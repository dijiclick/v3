import { storage } from "./storage";
import { BlogPost, BlogAuthor, BlogCategory } from "@shared/schema";

export interface ContentSimilarityScore {
  postId: string;
  score: number;
  factors: {
    categoryMatch: number;
    tagOverlap: number;
    readingTimeSimilarity: number;
    recencyScore: number;
    authorMatch: number;
  };
}

export interface PopularityMetrics {
  postId: string;
  viewCount: number;
  shareCount: number;
  score: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface ContentAnalytics {
  wordCount: number;
  readingTime: number; // in minutes
  headingCount: number;
  imageCount: number;
  linkCount: number;
}

export class ContentAnalyticsService {
  
  /**
   * Calculate reading time based on word count
   * Average reading speed: 200-250 words per minute
   */
  calculateReadingTime(wordCount: number): number {
    const averageWPM = 225; // Words per minute
    const readingTime = Math.ceil(wordCount / averageWPM);
    return Math.max(1, readingTime); // Minimum 1 minute
  }

  /**
   * Extract text content from blog post content (JSON structure)
   */
  extractTextFromContent(content: any): string {
    if (!content) return '';
    
    if (typeof content === 'string') {
      // Remove HTML tags for word counting
      return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    if (Array.isArray(content)) {
      return content.map(section => {
        if (section.text) return section.text;
        if (section.content) return section.content;
        return '';
      }).join(' ');
    }
    
    if (typeof content === 'object') {
      const textParts: string[] = [];
      if (content.title) textParts.push(content.title);
      if (content.description) textParts.push(content.description);
      if (content.body) textParts.push(content.body);
      return textParts.join(' ');
    }
    
    return '';
  }

  /**
   * Count words in text content
   */
  countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Analyze content structure and metrics
   */
  analyzeContent(content: any): ContentAnalytics {
    const textContent = this.extractTextFromContent(content);
    const wordCount = this.countWords(textContent);
    const readingTime = this.calculateReadingTime(wordCount);
    
    // Count structural elements
    let headingCount = 0;
    let imageCount = 0;
    let linkCount = 0;
    
    if (Array.isArray(content)) {
      for (const section of content) {
        if (section.type === 'heading') headingCount++;
        if (section.type === 'image') imageCount++;
        if (section.type === 'paragraph' && section.text) {
          // Count links in text
          const linkMatches = section.text.match(/<a[^>]*>/g) || [];
          linkCount += linkMatches.length;
        }
      }
    } else if (typeof content === 'string') {
      // Count HTML elements
      headingCount = (content.match(/<h[1-6][^>]*>/g) || []).length;
      imageCount = (content.match(/<img[^>]*>/g) || []).length;
      linkCount = (content.match(/<a[^>]*>/g) || []).length;
    }
    
    return {
      wordCount,
      readingTime,
      headingCount,
      imageCount,
      linkCount
    };
  }

  /**
   * Calculate content similarity using multiple factors
   */
  async calculateContentSimilarity(
    sourcePost: BlogPost, 
    targetPost: BlogPost,
    sourceAuthor?: BlogAuthor,
    targetAuthor?: BlogAuthor,
    sourceCategory?: BlogCategory,
    targetCategory?: BlogCategory
  ): Promise<ContentSimilarityScore> {
    
    const factors = {
      categoryMatch: 0,
      tagOverlap: 0,
      readingTimeSimilarity: 0,
      recencyScore: 0,
      authorMatch: 0
    };

    // Category match (25% weight)
    if (sourcePost.categoryId && targetPost.categoryId && sourcePost.categoryId === targetPost.categoryId) {
      factors.categoryMatch = 1.0;
    }

    // Tag overlap (30% weight)
    if (sourcePost.tags && targetPost.tags && sourcePost.tags.length > 0 && targetPost.tags.length > 0) {
      const sourceTags = new Set(sourcePost.tags);
      const targetTags = new Set(targetPost.tags);
      const intersection = new Set([...sourceTags].filter(tag => targetTags.has(tag)));
      const union = new Set([...sourceTags, ...targetTags]);
      factors.tagOverlap = intersection.size / union.size; // Jaccard similarity
    }

    // Reading time similarity (15% weight)
    if (sourcePost.readingTime && targetPost.readingTime) {
      const timeDifference = Math.abs(sourcePost.readingTime - targetPost.readingTime);
      const maxTime = Math.max(sourcePost.readingTime, targetPost.readingTime);
      factors.readingTimeSimilarity = Math.max(0, 1 - (timeDifference / maxTime));
    }

    // Recency score (20% weight) - prefer more recent posts
    if (sourcePost.publishedAt && targetPost.publishedAt) {
      const daysDifference = Math.abs(
        (new Date(sourcePost.publishedAt).getTime() - new Date(targetPost.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      factors.recencyScore = Math.max(0, 1 - (daysDifference / 365)); // Decay over a year
    }

    // Author match (10% weight)
    if (sourcePost.authorId && targetPost.authorId && sourcePost.authorId === targetPost.authorId) {
      factors.authorMatch = 1.0;
    }

    // Calculate weighted score
    const weights = {
      categoryMatch: 0.25,
      tagOverlap: 0.30,
      readingTimeSimilarity: 0.15,
      recencyScore: 0.20,
      authorMatch: 0.10
    };

    const score = Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights]);
    }, 0);

    return {
      postId: targetPost.id,
      score,
      factors
    };
  }

  /**
   * Get related posts for a specific post
   */
  async getRelatedPosts(
    sourcePost: BlogPost, 
    limit: number = 6,
    excludeIds: string[] = []
  ): Promise<BlogPost[]> {
    try {
      // Get all published posts except the source and excluded ones
      const { posts: allPosts } = await storage.getBlogPosts({
        status: 'published',
        limit: 1000, // Get a large set to analyze
        offset: 0
      });

      const candidatePosts = allPosts.filter(post => 
        post.id !== sourcePost.id && 
        !excludeIds.includes(post.id)
      );

      if (candidatePosts.length === 0) {
        return [];
      }

      // Calculate similarity scores for all candidate posts
      const similarities: ContentSimilarityScore[] = [];
      
      for (const candidatePost of candidatePosts) {
        const similarity = await this.calculateContentSimilarity(sourcePost, candidatePost);
        similarities.push(similarity);
      }

      // Sort by score descending and take top posts
      const topSimilarities = similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Get the actual post objects
      const relatedPosts = candidatePosts
        .filter(post => topSimilarities.some(sim => sim.postId === post.id))
        .sort((a, b) => {
          const aScore = topSimilarities.find(sim => sim.postId === a.id)?.score || 0;
          const bScore = topSimilarities.find(sim => sim.postId === b.id)?.score || 0;
          return bScore - aScore;
        });

      return relatedPosts;
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  }

  /**
   * Track post view and update analytics
   */
  async trackPostView(postId: string, userAgent?: string): Promise<void> {
    try {
      const post = await storage.getBlogPost(postId);
      if (post) {
        const newViewCount = (post.viewCount || 0) + 1;
        await storage.updateBlogPost(postId, { viewCount: newViewCount });
      }
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  }

  /**
   * Get popular posts by category
   */
  async getPopularPostsByCategory(
    categoryId: string, 
    timeframe: '7d' | '30d' | '90d' | 'all' = '30d',
    limit: number = 10
  ): Promise<BlogPost[]> {
    try {
      let startDate: Date | undefined;
      const now = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = undefined;
      }

      const { posts } = await storage.getBlogPosts({
        status: 'published',
        categoryIds: [categoryId],
        startDate: startDate?.toISOString(),
        sortBy: 'viewCount',
        sortOrder: 'desc',
        limit,
        offset: 0
      });

      return posts;
    } catch (error) {
      console.error('Error getting popular posts by category:', error);
      return [];
    }
  }

  /**
   * Get posts by author with recent activity
   */
  async getPostsByAuthor(
    authorId: string,
    limit: number = 6,
    excludeIds: string[] = []
  ): Promise<BlogPost[]> {
    try {
      const { posts } = await storage.getBlogPosts({
        status: 'published',
        authorIds: [authorId],
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        limit: limit + excludeIds.length, // Get extra to account for exclusions
        offset: 0
      });

      return posts
        .filter(post => !excludeIds.includes(post.id))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting posts by author:', error);
      return [];
    }
  }

  /**
   * Get recently updated posts
   */
  async getRecentlyUpdatedPosts(limit: number = 10): Promise<BlogPost[]> {
    try {
      const { posts } = await storage.getBlogPosts({
        status: 'published',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        limit,
        offset: 0
      });

      // Filter posts that were actually updated (not just created)
      return posts.filter(post => {
        if (!post.createdAt || !post.updatedAt) return false;
        const created = new Date(post.createdAt).getTime();
        const updated = new Date(post.updatedAt).getTime();
        return updated > created + 60000; // Updated more than 1 minute after creation
      });
    } catch (error) {
      console.error('Error getting recently updated posts:', error);
      return [];
    }
  }

  /**
   * Get archive data organized by date
   */
  async getArchiveData(): Promise<{
    years: {
      year: number;
      postCount: number;
      months: {
        month: number;
        monthName: string;
        postCount: number;
        posts: BlogPost[];
      }[];
    }[];
  }> {
    try {
      const { posts } = await storage.getBlogPosts({
        status: 'published',
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        limit: 1000, // Get all posts for archive
        offset: 0
      });

      const archiveMap = new Map<number, Map<number, BlogPost[]>>();

      // Group posts by year and month
      posts.forEach(post => {
        if (!post.publishedAt) return;
        
        const date = new Date(post.publishedAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (!archiveMap.has(year)) {
          archiveMap.set(year, new Map());
        }
        
        const yearMap = archiveMap.get(year)!;
        if (!yearMap.has(month)) {
          yearMap.set(month, []);
        }
        
        yearMap.get(month)!.push(post);
      });

      // Convert to sorted array structure
      const years = Array.from(archiveMap.entries())
        .map(([year, monthMap]) => ({
          year,
          postCount: Array.from(monthMap.values()).flat().length,
          months: Array.from(monthMap.entries())
            .map(([month, monthPosts]) => ({
              month,
              monthName: new Date(year, month - 1).toLocaleDateString('fa-IR', { month: 'long' }),
              postCount: monthPosts.length,
              posts: monthPosts.sort((a, b) => 
                new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
              )
            }))
            .sort((a, b) => b.month - a.month)
        }))
        .sort((a, b) => b.year - a.year);

      return { years };
    } catch (error) {
      console.error('Error getting archive data:', error);
      return { years: [] };
    }
  }
}

export const contentAnalyticsService = new ContentAnalyticsService();