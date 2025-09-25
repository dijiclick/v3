import { db } from "./db";
import { blogPosts, blogAuthors, blogCategories, blogTags, blogSearchAnalytics, blogSearchSuggestions, blogSavedSearches } from "@shared/schema";
import { sql, eq, and, or, like, ilike, desc, asc, inArray, gte, lte, isNotNull } from "drizzle-orm";
import type { BlogPost, BlogAuthor, BlogCategory, BlogTag, InsertBlogSearchAnalytics } from "@shared/schema";

export interface SearchOptions {
  query: string;
  scope?: 'all' | 'title' | 'content' | 'authors' | 'tags';
  categoryIds?: string[];
  authorIds?: string[];
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  readingTimeRange?: {
    min?: number;
    max?: number;
  };
  contentType?: string[];
  sortBy?: 'relevance' | 'publishedAt' | 'title' | 'readingTime' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  featured?: boolean;
  status?: string;
}

export interface SearchResult {
  post: BlogPost & { 
    author?: BlogAuthor; 
    category?: BlogCategory;
    relevanceScore?: number;
    snippet?: string;
    highlightedTitle?: string;
  };
  relevanceScore: number;
  snippet: string;
  highlightedTitle: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  suggestions?: string[];
  relatedSearches?: string[];
  searchTime: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ slug: string; name: string; count: number }>;
    readingTimes: Array<{ range: string; count: number }>;
  };
}

export interface PopularSearch {
  query: string;
  frequency: number;
  lastUsed: Date;
}

export interface SearchSuggestion {
  query: string;
  type: 'completion' | 'correction' | 'related';
  score: number;
}

export class BlogSearchService {
  private readonly SEARCH_INDEX_WEIGHTS = {
    title: 'A',      // Highest weight
    excerpt: 'B',    // High weight  
    content: 'C',    // Medium weight
    tags: 'D'        // Lower weight
  };

  private readonly SNIPPET_LENGTH = 200;
  private readonly MAX_SUGGESTIONS = 10;

  /**
   * Perform full-text search across blog posts with advanced filtering
   */
  async search(options: SearchOptions, trackAnalytics = true): Promise<SearchResponse> {
    const startTime = Date.now();
    
    const {
      query,
      scope = 'all',
      categoryIds = [],
      authorIds = [],
      tags = [],
      dateRange,
      readingTimeRange,
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
      featured,
      status = 'published'
    } = options;

    try {
      // Build base query with joins
      let baseQuery = db
        .select({
          post: blogPosts,
          author: blogAuthors,
          category: blogCategories,
          // PostgreSQL full-text search ranking
          rank: sql<number>`
            ts_rank_cd(
              to_tsvector('english', 
                ${this.SEARCH_INDEX_WEIGHTS.title} || ' ' || ${blogPosts.title} || ' ' ||
                ${this.SEARCH_INDEX_WEIGHTS.excerpt} || ' ' || COALESCE(${blogPosts.excerpt}, '') || ' ' ||
                ${this.SEARCH_INDEX_WEIGHTS.content} || ' ' || ${this.buildContentSearchText()} || ' ' ||
                ${this.SEARCH_INDEX_WEIGHTS.tags} || ' ' || array_to_string(${blogPosts.tags}, ' ')
              ),
              plainto_tsquery('english', ${query})
            ) AS rank
          `
        })
        .from(blogPosts)
        .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id));

      // Build WHERE conditions
      const conditions = [eq(blogPosts.status, status)];

      // Add search conditions based on scope
      if (query.trim()) {
        const searchCondition = this.buildSearchCondition(query, scope);
        conditions.push(searchCondition);
      }

      // Add filters
      if (categoryIds.length > 0) {
        conditions.push(inArray(blogPosts.categoryId, categoryIds));
      }

      if (authorIds.length > 0) {
        conditions.push(inArray(blogPosts.authorId, authorIds));
      }

      if (tags.length > 0) {
        const tagConditions = tags.map(tag => 
          sql`${tag} = ANY(${blogPosts.tags})`
        );
        conditions.push(or(...tagConditions));
      }

      if (dateRange?.start) {
        conditions.push(gte(blogPosts.publishedAt, dateRange.start));
      }

      if (dateRange?.end) {
        conditions.push(lte(blogPosts.publishedAt, dateRange.end));
      }

      if (readingTimeRange?.min) {
        conditions.push(gte(blogPosts.readingTime, readingTimeRange.min));
      }

      if (readingTimeRange?.max) {
        conditions.push(lte(blogPosts.readingTime, readingTimeRange.max));
      }

      if (featured !== undefined) {
        conditions.push(eq(blogPosts.featured, featured));
      }

      // Apply WHERE conditions
      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      // Add sorting
      const orderByClause = this.buildOrderBy(sortBy, sortOrder, query.trim() ? true : false);
      const searchResults = await baseQuery
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const [{ count: total }] = await countQuery;

      // Process results with snippets and highlighting
      const results: SearchResult[] = searchResults.map(result => ({
        post: {
          ...result.post,
          author: result.author || undefined,
          category: result.category || undefined,
          relevanceScore: result.rank || 0
        },
        relevanceScore: result.rank || 0,
        snippet: this.generateSnippet(result.post.content, result.post.excerpt, query),
        highlightedTitle: this.highlightText(result.post.title, query)
      }));

      // Get search facets
      const facets = await this.getSearchFacets(conditions, query);

      // Get suggestions and related searches
      const suggestions = query.trim() ? await this.getSearchSuggestions(query) : [];
      const relatedSearches = query.trim() ? await this.getRelatedSearches(query) : [];

      const searchTime = Date.now() - startTime;

      // Track analytics
      if (trackAnalytics && query.trim()) {
        await this.trackSearch({
          searchQuery: query,
          searchScope: scope,
          filters: {
            categoryIds,
            authorIds,
            tags,
            dateRange,
            readingTimeRange,
            featured
          },
          resultsCount: total,
          responseTime: searchTime
        });
      }

      return {
        results,
        total,
        suggestions,
        relatedSearches,
        searchTime,
        facets
      };

    } catch (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build search condition based on scope
   */
  private buildSearchCondition(query: string, scope: string) {
    const tsQuery = sql`plainto_tsquery('english', ${query})`;
    
    switch (scope) {
      case 'title':
        return sql`to_tsvector('english', ${blogPosts.title}) @@ ${tsQuery}`;
      case 'content':
        return sql`to_tsvector('english', ${this.buildContentSearchText()}) @@ ${tsQuery}`;
      case 'authors':
        return sql`to_tsvector('english', ${blogAuthors.name}) @@ ${tsQuery}`;
      case 'tags':
        return sql`to_tsvector('english', array_to_string(${blogPosts.tags}, ' ')) @@ ${tsQuery}`;
      default: // 'all'
        return sql`
          to_tsvector('english', 
            ${blogPosts.title} || ' ' || 
            COALESCE(${blogPosts.excerpt}, '') || ' ' ||
            ${this.buildContentSearchText()} || ' ' ||
            array_to_string(${blogPosts.tags}, ' ')
          ) @@ ${tsQuery}
        `;
    }
  }

  /**
   * Build content search text from JSONB content
   */
  private buildContentSearchText() {
    return sql`
      CASE 
        WHEN ${blogPosts.content} IS NOT NULL 
        THEN regexp_replace(
          ${blogPosts.content}::text, 
          '<[^>]*>|{[^}]*}|"[^"]*":', 
          ' ', 
          'g'
        )
        ELSE ''
      END
    `;
  }

  /**
   * Build ORDER BY clause
   */
  private buildOrderBy(sortBy: string, sortOrder: string, hasSearchQuery: boolean) {
    const order = sortOrder === 'asc' ? asc : desc;
    
    switch (sortBy) {
      case 'relevance':
        if (hasSearchQuery) {
          return order(sql`rank`);
        }
        return order(blogPosts.publishedAt);
      case 'publishedAt':
        return order(blogPosts.publishedAt);
      case 'title':
        return order(blogPosts.title);
      case 'readingTime':
        return order(blogPosts.readingTime);
      case 'viewCount':
        return order(blogPosts.viewCount);
      default:
        return order(blogPosts.publishedAt);
    }
  }

  /**
   * Generate content snippet with search term highlighting
   */
  private generateSnippet(content: any, excerpt: string | null, query: string): string {
    // Try excerpt first
    if (excerpt && excerpt.trim()) {
      const highlighted = this.highlightText(excerpt, query);
      if (highlighted !== excerpt || excerpt.length <= this.SNIPPET_LENGTH) {
        return highlighted;
      }
    }

    // Extract text from JSONB content
    let textContent = '';
    try {
      if (typeof content === 'object' && content !== null) {
        textContent = this.extractTextFromContent(content);
      } else if (typeof content === 'string') {
        textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    } catch (error) {
      console.warn('Error extracting content text:', error);
      textContent = excerpt || '';
    }

    if (!textContent) {
      return excerpt || '';
    }

    // Find best snippet containing search terms
    return this.findBestSnippet(textContent, query);
  }

  /**
   * Extract text content from JSONB structure
   */
  private extractTextFromContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content.map(item => this.extractTextFromContent(item)).join(' ');
    }

    if (typeof content === 'object' && content !== null) {
      let text = '';
      
      // Handle common content structures
      if (content.text) text += content.text + ' ';
      if (content.content) text += this.extractTextFromContent(content.content) + ' ';
      if (content.children) text += this.extractTextFromContent(content.children) + ' ';
      if (content.blocks) text += this.extractTextFromContent(content.blocks) + ' ';
      
      return text.trim();
    }

    return '';
  }

  /**
   * Find best snippet containing search terms
   */
  private findBestSnippet(text: string, query: string): string {
    const words = query.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Find sentence with most query words
    let bestSentence = '';
    let maxMatches = 0;
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const matches = words.filter(word => lowerSentence.includes(word)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence.trim();
      }
    }

    if (bestSentence && bestSentence.length <= this.SNIPPET_LENGTH) {
      return this.highlightText(bestSentence, query);
    }

    // Fallback: truncate and highlight
    const truncated = text.length > this.SNIPPET_LENGTH 
      ? text.substring(0, this.SNIPPET_LENGTH) + '...'
      : text;
      
    return this.highlightText(truncated, query);
  }

  /**
   * Highlight search terms in text
   */
  private highlightText(text: string, query: string): string {
    if (!query.trim() || !text) return text;
    
    const words = query.trim().split(/\s+/);
    let highlighted = text;
    
    for (const word of words) {
      if (word.length > 2) { // Only highlight words longer than 2 chars
        const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    }
    
    return highlighted;
  }

  /**
   * Get search facets for filtering
   */
  private async getSearchFacets(conditions: any[], query: string) {
    // Get category facets
    const categoryFacets = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        count: sql<number>`count(*)`
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(blogCategories.id, blogCategories.name)
      .having(sql`count(*) > 0`)
      .orderBy(desc(sql`count(*)`));

    // Get author facets
    const authorFacets = await db
      .select({
        id: blogAuthors.id,
        name: blogAuthors.name,
        count: sql<number>`count(*)`
      })
      .from(blogPosts)
      .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(blogAuthors.id, blogAuthors.name)
      .having(sql`count(*) > 0`)
      .orderBy(desc(sql`count(*)`));

    // Get tag facets (more complex due to array field)
    const tagFacets = await db.execute(sql`
      SELECT unnest(tags) as slug, unnest(tags) as name, count(*) as count
      FROM blog_posts 
      WHERE ${conditions.length > 0 ? sql.raw(conditions.map(() => '?').join(' AND ')) : sql`true`}
      AND tags IS NOT NULL 
      GROUP BY unnest(tags)
      HAVING count(*) > 0
      ORDER BY count DESC
      LIMIT 20
    `);

    // Get reading time ranges
    const readingTimeFacets = await db
      .select({
        range: sql<string>`
          CASE 
            WHEN reading_time <= 3 THEN 'quick'
            WHEN reading_time <= 10 THEN 'medium'
            ELSE 'long'
          END
        `,
        count: sql<number>`count(*)`
      })
      .from(blogPosts)
      .where(
        and(
          ...(conditions.length > 0 ? conditions : []),
          isNotNull(blogPosts.readingTime)
        )
      )
      .groupBy(sql`
        CASE 
          WHEN reading_time <= 3 THEN 'quick'
          WHEN reading_time <= 10 THEN 'medium'
          ELSE 'long'
        END
      `)
      .orderBy(desc(sql`count(*)`));

    return {
      categories: categoryFacets.filter(f => f.id && f.name),
      authors: authorFacets.filter(f => f.id && f.name),
      tags: tagFacets.rows.map((row: any) => ({
        slug: row.slug,
        name: row.name,
        count: parseInt(row.count)
      })),
      readingTimes: readingTimeFacets.map(f => ({
        range: f.range,
        count: f.count
      }))
    };
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      // Get suggestions from stored suggestions table
      const suggestions = await db
        .select({
          query: blogSearchSuggestions.query
        })
        .from(blogSearchSuggestions)
        .where(ilike(blogSearchSuggestions.query, `%${query}%`))
        .orderBy(desc(blogSearchSuggestions.frequency))
        .limit(this.MAX_SUGGESTIONS);

      return suggestions.map(s => s.query);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get related searches for a query
   */
  async getRelatedSearches(query: string): Promise<string[]> {
    if (!query || query.length < 3) return [];

    try {
      // Find searches with similar keywords
      const words = query.toLowerCase().split(/\s+/);
      const conditions = words.map(word => 
        ilike(blogSearchSuggestions.query, `%${word}%`)
      );

      const relatedSearches = await db
        .select({
          query: blogSearchSuggestions.query
        })
        .from(blogSearchSuggestions)
        .where(or(...conditions))
        .orderBy(desc(blogSearchSuggestions.frequency))
        .limit(5);

      return relatedSearches
        .map(s => s.query)
        .filter(q => q.toLowerCase() !== query.toLowerCase());
    } catch (error) {
      console.error('Error getting related searches:', error);
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit = 10): Promise<PopularSearch[]> {
    try {
      const popularSearches = await db
        .select({
          query: blogSearchSuggestions.query,
          frequency: blogSearchSuggestions.frequency,
          lastUsed: blogSearchSuggestions.lastUsed
        })
        .from(blogSearchSuggestions)
        .orderBy(desc(blogSearchSuggestions.frequency))
        .limit(limit);

      return popularSearches.map(s => ({
        query: s.query,
        frequency: s.frequency || 1,
        lastUsed: s.lastUsed || new Date()
      }));
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * Track search analytics
   */
  async trackSearch(analytics: InsertBlogSearchAnalytics): Promise<void> {
    try {
      // Insert search analytics
      await db.insert(blogSearchAnalytics).values(analytics);

      // Update or insert search suggestion
      if (analytics.searchQuery.trim()) {
        await this.updateSearchSuggestion(analytics.searchQuery);
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Update search suggestion frequency
   */
  private async updateSearchSuggestion(query: string): Promise<void> {
    const normalizedQuery = query.trim().toLowerCase();
    
    try {
      // Check if suggestion exists
      const existing = await db
        .select({ id: blogSearchSuggestions.id, frequency: blogSearchSuggestions.frequency })
        .from(blogSearchSuggestions)
        .where(eq(blogSearchSuggestions.query, normalizedQuery))
        .limit(1);

      if (existing.length > 0) {
        // Update frequency
        await db
          .update(blogSearchSuggestions)
          .set({
            frequency: (existing[0].frequency || 0) + 1,
            lastUsed: new Date()
          })
          .where(eq(blogSearchSuggestions.id, existing[0].id));
      } else {
        // Insert new suggestion
        await db.insert(blogSearchSuggestions).values({
          query: normalizedQuery,
          frequency: 1
        });
      }
    } catch (error) {
      console.error('Error updating search suggestion:', error);
    }
  }

  /**
   * Save a search query
   */
  async saveSearch(data: {
    name: string;
    searchQuery: string;
    filters?: any;
    sessionId?: string;
    isPublic?: boolean;
  }): Promise<string> {
    try {
      const [savedSearch] = await db.insert(blogSavedSearches).values({
        name: data.name,
        searchQuery: data.searchQuery,
        filters: data.filters || null,
        sessionId: data.sessionId,
        isPublic: data.isPublic || false
      }).returning({ id: blogSavedSearches.id });

      return savedSearch.id;
    } catch (error) {
      console.error('Error saving search:', error);
      throw new Error('Failed to save search');
    }
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(sessionId?: string): Promise<any[]> {
    try {
      const conditions = [];
      
      if (sessionId) {
        conditions.push(eq(blogSavedSearches.sessionId, sessionId));
      } else {
        conditions.push(eq(blogSavedSearches.isPublic, true));
      }

      const savedSearches = await db
        .select()
        .from(blogSavedSearches)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(blogSavedSearches.lastUsed));

      return savedSearches;
    } catch (error) {
      console.error('Error getting saved searches:', error);
      return [];
    }
  }
}

// Export singleton instance
export const blogSearchService = new BlogSearchService();