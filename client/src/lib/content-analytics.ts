/**
 * Client-side content analytics utility
 * Mirrors the server-side ContentAnalyticsService functionality
 */

export interface ContentAnalytics {
  wordCount: number;
  readingTime: number; // in minutes
  headingCount: number;
  imageCount: number;
  linkCount: number;
}

export class ClientContentAnalytics {
  
  /**
   * Calculate reading time based on word count
   * Average reading speed: 200-250 words per minute
   */
  static calculateReadingTime(wordCount: number): number {
    const averageWPM = 225; // Words per minute
    const readingTime = Math.ceil(wordCount / averageWPM);
    return Math.max(1, readingTime); // Minimum 1 minute
  }

  /**
   * Extract text content from blog post content (JSON structure)
   */
  static extractTextFromContent(content: any): string {
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
  static countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Analyze content structure and metrics
   */
  static analyzeContent(content: any): ContentAnalytics {
    const textContent = ClientContentAnalytics.extractTextFromContent(content);
    const wordCount = ClientContentAnalytics.countWords(textContent);
    const readingTime = ClientContentAnalytics.calculateReadingTime(wordCount);
    
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
   * Calculate content analytics from blog post content
   * Convenience method that returns both analytics and individual metrics
   */
  static calculateContentMetrics(content: any): {
    contentText: string;
    wordCount: number;
    readingTime: number;
    analytics: ContentAnalytics;
  } {
    const contentText = ClientContentAnalytics.extractTextFromContent(content);
    const wordCount = ClientContentAnalytics.countWords(contentText);
    const readingTime = ClientContentAnalytics.calculateReadingTime(wordCount);
    const analytics = ClientContentAnalytics.analyzeContent(content);

    return {
      contentText,
      wordCount,
      readingTime,
      analytics
    };
  }
}

// Export for convenience
export default ClientContentAnalytics;