import { BlogPost, BlogAuthor, BlogCategory } from '@/types';

export interface RecommendationScore {
  postId: string;
  score: number;
  reasons: string[];
  similarity?: {
    category: number;
    tags: number;
    author: number;
    readingTime: number;
    recency: number;
  };
}

export interface UserReadingPattern {
  viewedPosts: string[];
  favoriteCategories: string[];
  favoriteTags: string[];
  favoriteAuthors: string[];
  averageReadingTime: number;
  lastActivity: Date;
}

export interface ContentSimilarityOptions {
  includeCategory?: boolean;
  includeTags?: boolean;
  includeAuthor?: boolean;
  includeReadingTime?: boolean;
  includeRecency?: boolean;
  weights?: {
    category: number;
    tags: number;
    author: number;
    readingTime: number;
    recency: number;
  };
}

export class ContentRecommendationEngine {
  private readonly DEFAULT_WEIGHTS = {
    category: 0.25,
    tags: 0.30,
    author: 0.15,
    readingTime: 0.15,
    recency: 0.15
  };

  private readonly STORAGE_KEYS = {
    VIEWED_POSTS: 'blog_viewed_posts',
    READING_PATTERNS: 'blog_reading_patterns',
    BOOKMARKS: 'blog_bookmarks'
  };

  /**
   * Extract text content for TF-IDF analysis
   */
  extractTextContent(post: BlogPost): string {
    if (!post.content) return '';

    let text = '';
    
    // Add title and excerpt
    text += post.title + ' ';
    if (post.excerpt) text += post.excerpt + ' ';

    // Extract text from content based on structure
    if (typeof post.content === 'string') {
      // Remove HTML tags and extract plain text
      text += post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    } else if (Array.isArray(post.content)) {
      post.content.forEach(section => {
        if (section.text) text += section.text + ' ';
        if (section.content) text += section.content + ' ';
      });
    } else if (typeof post.content === 'object') {
      if (post.content.title) text += post.content.title + ' ';
      if (post.content.description) text += post.content.description + ' ';
      if (post.content.body) text += post.content.body + ' ';
    }

    return text.toLowerCase().trim();
  }

  /**
   * Calculate TF-IDF similarity between two posts
   */
  calculateTFIDFSimilarity(post1: BlogPost, post2: BlogPost, allPosts: BlogPost[]): number {
    const text1 = this.extractTextContent(post1);
    const text2 = this.extractTextContent(post2);

    if (!text1 || !text2) return 0;

    // Simple tokenization (can be enhanced with stemming, stop words removal)
    const words1 = text1.split(/\s+/).filter(word => word.length > 2);
    const words2 = text2.split(/\s+/).filter(word => word.length > 2);

    // Calculate term frequencies
    const tf1 = this.calculateTermFrequency(words1);
    const tf2 = this.calculateTermFrequency(words2);

    // Calculate document frequencies
    const df = this.calculateDocumentFrequency(allPosts);

    // Calculate TF-IDF vectors
    const tfidf1 = this.calculateTFIDF(tf1, df, allPosts.length);
    const tfidf2 = this.calculateTFIDF(tf2, df, allPosts.length);

    // Calculate cosine similarity
    return this.cosineSimilarity(tfidf1, tfidf2);
  }

  private calculateTermFrequency(words: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const totalWords = words.length;

    words.forEach(word => {
      tf.set(word, (tf.get(word) || 0) + 1);
    });

    // Normalize by total word count
    tf.forEach((count, word) => {
      tf.set(word, count / totalWords);
    });

    return tf;
  }

  private calculateDocumentFrequency(posts: BlogPost[]): Map<string, number> {
    const df = new Map<string, number>();

    posts.forEach(post => {
      const words = new Set(this.extractTextContent(post).split(/\s+/));
      words.forEach(word => {
        if (word.length > 2) {
          df.set(word, (df.get(word) || 0) + 1);
        }
      });
    });

    return df;
  }

  private calculateTFIDF(tf: Map<string, number>, df: Map<string, number>, totalDocs: number): Map<string, number> {
    const tfidf = new Map<string, number>();

    tf.forEach((tfValue, word) => {
      const dfValue = df.get(word) || 1;
      const idf = Math.log(totalDocs / dfValue);
      tfidf.set(word, tfValue * idf);
    });

    return tfidf;
  }

  private cosineSimilarity(vector1: Map<string, number>, vector2: Map<string, number>): number {
    const words = new Set([...vector1.keys(), ...vector2.keys()]);
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    words.forEach(word => {
      const v1 = vector1.get(word) || 0;
      const v2 = vector2.get(word) || 0;

      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate content similarity using multiple factors
   */
  calculateContentSimilarity(
    post1: BlogPost, 
    post2: BlogPost, 
    allPosts: BlogPost[],
    options: ContentSimilarityOptions = {}
  ): RecommendationScore {
    const weights = { ...this.DEFAULT_WEIGHTS, ...options.weights };
    const similarity = {
      category: 0,
      tags: 0,
      author: 0,
      readingTime: 0,
      recency: 0
    };

    const reasons: string[] = [];

    // Category similarity
    if (options.includeCategory !== false && post1.categoryId && post2.categoryId) {
      similarity.category = post1.categoryId === post2.categoryId ? 1 : 0;
      if (similarity.category > 0) {
        reasons.push('Same category');
      }
    }

    // Tag similarity (Jaccard similarity)
    if (options.includeTags !== false && post1.tags && post2.tags) {
      const tags1 = new Set(post1.tags);
      const tags2 = new Set(post2.tags);
      const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
      const union = new Set([...tags1, ...tags2]);
      
      similarity.tags = union.size > 0 ? intersection.size / union.size : 0;
      if (similarity.tags > 0.3) {
        reasons.push(`${intersection.size} shared tags`);
      }
    }

    // Author similarity
    if (options.includeAuthor !== false && post1.authorId && post2.authorId) {
      similarity.author = post1.authorId === post2.authorId ? 1 : 0;
      if (similarity.author > 0) {
        reasons.push('Same author');
      }
    }

    // Reading time similarity
    if (options.includeReadingTime !== false && post1.readingTime && post2.readingTime) {
      const timeDiff = Math.abs(post1.readingTime - post2.readingTime);
      const maxTime = Math.max(post1.readingTime, post2.readingTime);
      similarity.readingTime = maxTime > 0 ? Math.max(0, 1 - (timeDiff / maxTime)) : 0;
      if (similarity.readingTime > 0.7) {
        reasons.push('Similar reading time');
      }
    }

    // Recency similarity
    if (options.includeRecency !== false && post1.publishedAt && post2.publishedAt) {
      const daysDiff = Math.abs(
        (new Date(post1.publishedAt).getTime() - new Date(post2.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      similarity.recency = Math.max(0, 1 - (daysDiff / 365)); // Decay over a year
      if (similarity.recency > 0.8) {
        reasons.push('Published around the same time');
      }
    }

    // Calculate overall score
    const score = Object.entries(similarity).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights]);
    }, 0);

    return {
      postId: post2.id,
      score,
      reasons,
      similarity
    };
  }

  /**
   * Track user reading patterns
   */
  trackPostView(post: BlogPost): void {
    try {
      // Update viewed posts
      const viewedPosts = this.getViewedPosts();
      const updatedViewed = [post.id, ...viewedPosts.filter(id => id !== post.id)].slice(0, 50); // Keep last 50
      localStorage.setItem(this.STORAGE_KEYS.VIEWED_POSTS, JSON.stringify(updatedViewed));

      // Update reading patterns
      const patterns = this.getReadingPatterns();
      
      // Update favorite categories
      if (post.categoryId) {
        const categoryIndex = patterns.favoriteCategories.indexOf(post.categoryId);
        if (categoryIndex === -1) {
          patterns.favoriteCategories.unshift(post.categoryId);
        } else {
          // Move to front
          patterns.favoriteCategories.splice(categoryIndex, 1);
          patterns.favoriteCategories.unshift(post.categoryId);
        }
        patterns.favoriteCategories = patterns.favoriteCategories.slice(0, 10);
      }

      // Update favorite tags
      if (post.tags) {
        post.tags.forEach(tag => {
          const tagIndex = patterns.favoriteTags.indexOf(tag);
          if (tagIndex === -1) {
            patterns.favoriteTags.unshift(tag);
          } else {
            patterns.favoriteTags.splice(tagIndex, 1);
            patterns.favoriteTags.unshift(tag);
          }
        });
        patterns.favoriteTags = patterns.favoriteTags.slice(0, 20);
      }

      // Update favorite authors
      if (post.authorId) {
        const authorIndex = patterns.favoriteAuthors.indexOf(post.authorId);
        if (authorIndex === -1) {
          patterns.favoriteAuthors.unshift(post.authorId);
        } else {
          patterns.favoriteAuthors.splice(authorIndex, 1);
          patterns.favoriteAuthors.unshift(post.authorId);
        }
        patterns.favoriteAuthors = patterns.favoriteAuthors.slice(0, 10);
      }

      // Update average reading time
      if (post.readingTime) {
        patterns.averageReadingTime = patterns.averageReadingTime > 0 
          ? (patterns.averageReadingTime + post.readingTime) / 2 
          : post.readingTime;
      }

      patterns.lastActivity = new Date();

      localStorage.setItem(this.STORAGE_KEYS.READING_PATTERNS, JSON.stringify(patterns));
    } catch (error) {
      console.warn('Could not track reading patterns:', error);
    }
  }

  /**
   * Get viewed posts history
   */
  getViewedPosts(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.VIEWED_POSTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get user reading patterns
   */
  getReadingPatterns(): UserReadingPattern {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.READING_PATTERNS);
      if (stored) {
        const patterns = JSON.parse(stored);
        return {
          ...patterns,
          lastActivity: new Date(patterns.lastActivity)
        };
      }
    } catch {
      // Return default pattern
    }

    return {
      viewedPosts: [],
      favoriteCategories: [],
      favoriteTags: [],
      favoriteAuthors: [],
      averageReadingTime: 0,
      lastActivity: new Date()
    };
  }

  /**
   * Generate personalized recommendations
   */
  generatePersonalizedRecommendations(
    allPosts: BlogPost[], 
    limit: number = 10
  ): RecommendationScore[] {
    const patterns = this.getReadingPatterns();
    const viewedPosts = this.getViewedPosts();
    
    const candidatePosts = allPosts.filter(post => !viewedPosts.includes(post.id));
    const recommendations: RecommendationScore[] = [];

    candidatePosts.forEach(post => {
      let score = 0;
      const reasons: string[] = [];

      // Category preference
      if (post.categoryId && patterns.favoriteCategories.includes(post.categoryId)) {
        const index = patterns.favoriteCategories.indexOf(post.categoryId);
        score += (10 - index) * 0.1; // Higher score for more preferred categories
        reasons.push('Preferred category');
      }

      // Tag preference
      if (post.tags) {
        const matchingTags = post.tags.filter(tag => patterns.favoriteTags.includes(tag));
        if (matchingTags.length > 0) {
          score += matchingTags.length * 0.05;
          reasons.push(`${matchingTags.length} preferred tags`);
        }
      }

      // Author preference
      if (post.authorId && patterns.favoriteAuthors.includes(post.authorId)) {
        const index = patterns.favoriteAuthors.indexOf(post.authorId);
        score += (5 - index) * 0.2;
        reasons.push('Preferred author');
      }

      // Reading time preference
      if (post.readingTime && patterns.averageReadingTime > 0) {
        const timeDiff = Math.abs(post.readingTime - patterns.averageReadingTime);
        const similarity = Math.max(0, 1 - (timeDiff / patterns.averageReadingTime));
        score += similarity * 0.1;
        if (similarity > 0.7) {
          reasons.push('Matches reading time preference');
        }
      }

      // Recency boost
      if (post.publishedAt) {
        const daysOld = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 1 - (daysOld / 30)); // Boost recent posts (last 30 days)
        score += recencyScore * 0.1;
      }

      // Popularity boost
      if (post.viewCount && post.viewCount > 0) {
        score += Math.min(post.viewCount / 1000, 0.1); // Cap popularity boost
      }

      if (score > 0) {
        recommendations.push({
          postId: post.id,
          score,
          reasons
        });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Bookmark management
   */
  addBookmark(postId: string): void {
    try {
      const bookmarks = this.getBookmarks();
      if (!bookmarks.includes(postId)) {
        bookmarks.unshift(postId);
        localStorage.setItem(this.STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks.slice(0, 100)));
      }
    } catch (error) {
      console.warn('Could not add bookmark:', error);
    }
  }

  removeBookmark(postId: string): void {
    try {
      const bookmarks = this.getBookmarks();
      const filtered = bookmarks.filter(id => id !== postId);
      localStorage.setItem(this.STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Could not remove bookmark:', error);
    }
  }

  getBookmarks(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  isBookmarked(postId: string): boolean {
    return this.getBookmarks().includes(postId);
  }

  /**
   * Clear all stored data
   */
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const contentRecommendationEngine = new ContentRecommendationEngine();