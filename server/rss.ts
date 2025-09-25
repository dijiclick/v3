import { storage } from './storage';
import { BlogPost, BlogAuthor, BlogCategory, BlogTag } from '@shared/schema';

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
  author?: string;
  category?: string;
  content?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: number;
  };
}

export interface RSSChannel {
  title: string;
  description: string;
  link: string;
  language: string;
  managingEditor?: string;
  webMaster?: string;
  lastBuildDate: string;
  ttl?: number;
  image?: {
    url: string;
    title: string;
    link: string;
    width?: number;
    height?: number;
  };
  items: RSSItem[];
}

export class RSSGenerator {
  private readonly baseUrl: string;
  private readonly siteName: string;
  private readonly siteDescription: string;
  private readonly webMaster: string;

  constructor(
    baseUrl: string = 'https://limitplus.ir',
    siteName: string = 'وبلاگ لیمیت پس',
    siteDescription: string = 'آخرین مقالات و اخبار از وبلاگ لیمیت پس - منبع کاملی از اطلاعات کاربردی و روزآمد',
    webMaster: string = 'webmaster@limitplus.ir'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.siteName = siteName;
    this.siteDescription = siteDescription;
    this.webMaster = webMaster;
  }

  // Generate main blog RSS feed
  async generateBlogFeed(limit: number = 20): Promise<string> {
    try {
      const postsResponse = await storage.getBlogPosts({
        status: 'published',
        limit,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      const items: RSSItem[] = [];

      for (const post of postsResponse.posts) {
        const author = post.authorId ? await storage.getBlogAuthor(post.authorId) : null;
        const category = post.categoryId ? await storage.getBlogCategory(post.categoryId) : null;

        items.push(this.createRSSItem(post, author, category));
      }

      const channel: RSSChannel = {
        title: this.siteName,
        description: this.siteDescription,
        link: `${this.baseUrl}/blog`,
        language: 'fa-IR',
        managingEditor: `${this.webMaster} (${this.siteName})`,
        webMaster: this.webMaster,
        lastBuildDate: new Date().toUTCString(),
        ttl: 60, // 1 hour
        image: {
          url: `${this.baseUrl}/logo.png`,
          title: this.siteName,
          link: `${this.baseUrl}/blog`,
          width: 144,
          height: 144
        },
        items
      };

      return this.generateRSSXML(channel);
    } catch (error) {
      console.error('Error generating blog RSS feed:', error);
      throw new Error('Failed to generate blog RSS feed');
    }
  }

  // Generate category-specific RSS feed
  async generateCategoryFeed(categorySlug: string, limit: number = 20): Promise<string> {
    try {
      const category = await storage.getBlogCategoryBySlug(categorySlug);
      if (!category || !category.active) {
        throw new Error('Category not found or inactive');
      }

      const postsResponse = await storage.getBlogPostsByCategory(category.id, {
        limit,
        offset: 0
      });

      const items: RSSItem[] = [];

      for (const post of postsResponse.posts) {
        const author = post.authorId ? await storage.getBlogAuthor(post.authorId) : null;
        items.push(this.createRSSItem(post, author, category));
      }

      const channel: RSSChannel = {
        title: `${this.siteName} - ${category.name}`,
        description: category.description || `مقالات دسته‌بندی ${category.name} در ${this.siteName}`,
        link: `${this.baseUrl}/blog/category/${category.slug}`,
        language: 'fa-IR',
        managingEditor: `${this.webMaster} (${this.siteName})`,
        webMaster: this.webMaster,
        lastBuildDate: new Date().toUTCString(),
        ttl: 120, // 2 hours
        image: {
          url: `${this.baseUrl}/logo.png`,
          title: `${this.siteName} - ${category.name}`,
          link: `${this.baseUrl}/blog/category/${category.slug}`,
          width: 144,
          height: 144
        },
        items
      };

      return this.generateRSSXML(channel);
    } catch (error) {
      console.error('Error generating category RSS feed:', error);
      throw new Error('Failed to generate category RSS feed');
    }
  }

  // Generate author-specific RSS feed
  async generateAuthorFeed(authorSlug: string, limit: number = 20): Promise<string> {
    try {
      const author = await storage.getBlogAuthorBySlug(authorSlug);
      if (!author || !author.active) {
        throw new Error('Author not found or inactive');
      }

      const postsResponse = await storage.getBlogPostsByAuthor(author.id, {
        limit,
        offset: 0
      });

      const items: RSSItem[] = [];

      for (const post of postsResponse.posts) {
        const category = post.categoryId ? await storage.getBlogCategory(post.categoryId) : null;
        items.push(this.createRSSItem(post, author, category));
      }

      const channel: RSSChannel = {
        title: `${this.siteName} - ${author.name}`,
        description: author.bio || `مقالات نوشته شده توسط ${author.name} در ${this.siteName}`,
        link: `${this.baseUrl}/blog/author/${author.slug}`,
        language: 'fa-IR',
        managingEditor: `${this.webMaster} (${this.siteName})`,
        webMaster: this.webMaster,
        lastBuildDate: new Date().toUTCString(),
        ttl: 240, // 4 hours
        image: {
          url: author.avatar || `${this.baseUrl}/logo.png`,
          title: `${this.siteName} - ${author.name}`,
          link: `${this.baseUrl}/blog/author/${author.slug}`,
          width: 144,
          height: 144
        },
        items
      };

      return this.generateRSSXML(channel);
    } catch (error) {
      console.error('Error generating author RSS feed:', error);
      throw new Error('Failed to generate author RSS feed');
    }
  }

  // Generate tag-specific RSS feed
  async generateTagFeed(tagSlug: string, limit: number = 20): Promise<string> {
    try {
      const tag = await storage.getBlogTagBySlug(tagSlug);
      if (!tag) {
        throw new Error('Tag not found');
      }

      const postsResponse = await storage.getBlogPostsByTag(tag.slug, {
        limit,
        offset: 0
      });

      const items: RSSItem[] = [];

      for (const post of postsResponse.posts) {
        const author = post.authorId ? await storage.getBlogAuthor(post.authorId) : null;
        const category = post.categoryId ? await storage.getBlogCategory(post.categoryId) : null;
        items.push(this.createRSSItem(post, author, category));
      }

      const channel: RSSChannel = {
        title: `${this.siteName} - برچسب ${tag.name}`,
        description: tag.description || `مقالات برچسب ${tag.name} در ${this.siteName}`,
        link: `${this.baseUrl}/blog/tag/${tag.slug}`,
        language: 'fa-IR',
        managingEditor: `${this.webMaster} (${this.siteName})`,
        webMaster: this.webMaster,
        lastBuildDate: new Date().toUTCString(),
        ttl: 240, // 4 hours
        image: {
          url: `${this.baseUrl}/logo.png`,
          title: `${this.siteName} - ${tag.name}`,
          link: `${this.baseUrl}/blog/tag/${tag.slug}`,
          width: 144,
          height: 144
        },
        items
      };

      return this.generateRSSXML(channel);
    } catch (error) {
      console.error('Error generating tag RSS feed:', error);
      throw new Error('Failed to generate tag RSS feed');
    }
  }

  // Create RSS item from blog post
  private createRSSItem(
    post: BlogPost, 
    author?: BlogAuthor | null, 
    category?: BlogCategory | null
  ): RSSItem {
    const postUrl = `${this.baseUrl}/blog/${post.slug}`;
    const publishDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt!);
    
    // Format content for RSS
    const content = this.formatContentForRSS(post.content);
    const description = post.excerpt || this.extractExcerpt(content) || post.title;

    const item: RSSItem = {
      title: post.title,
      description: this.escapeXML(description),
      link: postUrl,
      guid: postUrl,
      pubDate: publishDate.toUTCString(),
      author: author ? `${this.webMaster} (${author.name})` : undefined,
      category: category?.name,
      content: `<![CDATA[${content}]]>`
    };

    // Add enclosure for featured image
    if (post.featuredImage) {
      item.enclosure = {
        url: post.featuredImage.startsWith('http') ? 
              post.featuredImage : 
              `${this.baseUrl}${post.featuredImage}`,
        type: 'image/jpeg' // Default to JPEG, could be enhanced to detect actual type
      };
    }

    return item;
  }

  // Format blog post content for RSS
  private formatContentForRSS(content: any): string {
    if (typeof content === 'string') {
      return this.processHTMLContent(content);
    }

    if (Array.isArray(content)) {
      return content.map(section => {
        switch (section.type) {
          case 'heading':
            return `<h2>${this.escapeXML(section.text)}</h2>`;
          case 'paragraph':
            return `<p>${this.escapeXML(section.text)}</p>`;
          case 'html':
            return this.processHTMLContent(section.content);
          case 'image':
            return `<figure>
              <img src="${section.url}" alt="${this.escapeXML(section.alt || '')}" />
              ${section.caption ? `<figcaption>${this.escapeXML(section.caption)}</figcaption>` : ''}
            </figure>`;
          case 'callout':
            return `<blockquote class="callout callout-${section.calloutType || 'info'}">
              <p><strong>${this.getCalloutIcon(section.calloutType)} ${this.getCalloutTitle(section.calloutType)}</strong></p>
              <p>${this.escapeXML(section.text)}</p>
            </blockquote>`;
          default:
            return section.text ? `<p>${this.escapeXML(section.text)}</p>` : '';
        }
      }).join('\n');
    }

    if (typeof content === 'object' && content !== null) {
      let html = '';
      if (content.title) {
        html += `<h2>${this.escapeXML(content.title)}</h2>`;
      }
      if (content.description) {
        html += `<p>${this.escapeXML(content.description)}</p>`;
      }
      if (content.body) {
        html += this.processHTMLContent(content.body);
      }
      return html;
    }

    return '';
  }

  // Process HTML content for RSS
  private processHTMLContent(html: string): string {
    // Clean up HTML for RSS feed
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '') // Remove iframes
      .replace(/style="[^"]*"/gi, '') // Remove inline styles
      .replace(/class="[^"]*"/gi, '') // Remove classes
      .replace(/id="[^"]*"/gi, '') // Remove IDs
      .replace(/<(\w+)[^>]*>/g, '<$1>') // Simplify tags
      .trim();
  }

  // Extract excerpt from content
  private extractExcerpt(content: string, maxLength: number = 200): string {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.length > maxLength ? 
           text.substring(0, maxLength).trim() + '...' : 
           text.trim();
  }

  // Get callout icon
  private getCalloutIcon(type?: string): string {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'info':
      default: return 'ℹ️';
    }
  }

  // Get callout title
  private getCalloutTitle(type?: string): string {
    switch (type) {
      case 'warning': return 'هشدار';
      case 'error': return 'خطا';
      case 'success': return 'موفقیت';
      case 'info':
      default: return 'نکته';
    }
  }

  // Generate RSS XML
  private generateRSSXML(channel: RSSChannel): string {
    const items = channel.items.map(item => {
      let itemXML = `    <item>
      <title>${this.escapeXML(item.title)}</title>
      <description>${item.description}</description>
      <link>${this.escapeXML(item.link)}</link>
      <guid isPermaLink="true">${this.escapeXML(item.guid)}</guid>
      <pubDate>${item.pubDate}</pubDate>`;

      if (item.author) {
        itemXML += `\n      <author>${this.escapeXML(item.author)}</author>`;
      }

      if (item.category) {
        itemXML += `\n      <category>${this.escapeXML(item.category)}</category>`;
      }

      if (item.content) {
        itemXML += `\n      <content:encoded>${item.content}</content:encoded>`;
      }

      if (item.enclosure) {
        itemXML += `\n      <enclosure url="${this.escapeXML(item.enclosure.url)}" type="${item.enclosure.type}"${item.enclosure.length ? ` length="${item.enclosure.length}"` : ''} />`;
      }

      itemXML += `\n    </item>`;
      return itemXML;
    }).join('\n');

    const imageXML = channel.image ? `
    <image>
      <url>${this.escapeXML(channel.image.url)}</url>
      <title>${this.escapeXML(channel.image.title)}</title>
      <link>${this.escapeXML(channel.image.link)}</link>
      ${channel.image.width ? `<width>${channel.image.width}</width>` : ''}
      ${channel.image.height ? `<height>${channel.image.height}</height>` : ''}
    </image>` : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title>${this.escapeXML(channel.title)}</title>
    <description>${this.escapeXML(channel.description)}</description>
    <link>${this.escapeXML(channel.link)}</link>
    <language>${channel.language}</language>
    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>
    <managingEditor>${this.escapeXML(channel.managingEditor || '')}</managingEditor>
    <webMaster>${this.escapeXML(channel.webMaster)}</webMaster>
    <generator>لیمیت پس RSS Generator 1.0</generator>
    <atom:link href="${this.escapeXML(channel.link)}/feed.xml" rel="self" type="application/rss+xml" />
    ${channel.ttl ? `<ttl>${channel.ttl}</ttl>` : ''}${imageXML}
${items}
  </channel>
</rss>`;
  }

  // Escape XML special characters
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Get RSS feed statistics
  async getRSSStats(): Promise<{
    mainFeed: { totalItems: number; lastUpdate: string };
    categoryFeeds: Array<{ category: string; slug: string; itemCount: number }>;
    authorFeeds: Array<{ author: string; slug: string; itemCount: number }>;
    tagFeeds: Array<{ tag: string; slug: string; itemCount: number }>;
  }> {
    try {
      // Main feed stats
      const mainPosts = await storage.getBlogPosts({ 
        status: 'published', 
        limit: 1 
      });

      // Category feeds stats
      const categories = await storage.getBlogCategories();
      const categoryFeeds = [];
      for (const category of categories.filter(cat => cat.active)) {
        const categoryPosts = await storage.getBlogPostsByCategory(category.id, { limit: 1 });
        if (categoryPosts.total > 0) {
          categoryFeeds.push({
            category: category.name,
            slug: category.slug,
            itemCount: categoryPosts.total
          });
        }
      }

      // Author feeds stats
      const authorsResponse = await storage.getBlogAuthors({ active: true });
      const authorFeeds = [];
      for (const author of authorsResponse.authors) {
        const authorPosts = await storage.getBlogPostsByAuthor(author.id, { limit: 1 });
        if (authorPosts.total > 0) {
          authorFeeds.push({
            author: author.name,
            slug: author.slug,
            itemCount: authorPosts.total
          });
        }
      }

      // Tag feeds stats (only for featured tags)
      const tags = await storage.getBlogTags();
      const tagFeeds = [];
      for (const tag of tags.filter(t => t.featured)) {
        const tagPosts = await storage.getBlogPostsByTag(tag.slug, { limit: 1 });
        if (tagPosts.total > 0) {
          tagFeeds.push({
            tag: tag.name,
            slug: tag.slug,
            itemCount: tagPosts.total
          });
        }
      }

      return {
        mainFeed: {
          totalItems: mainPosts.total,
          lastUpdate: new Date().toISOString()
        },
        categoryFeeds,
        authorFeeds,
        tagFeeds
      };
    } catch (error) {
      console.error('Error getting RSS stats:', error);
      throw new Error('Failed to get RSS statistics');
    }
  }

  // Validate RSS feeds
  async validateFeeds(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    feedCounts: { main: number; categories: number; authors: number; tags: number };
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check main feed
      const mainPosts = await storage.getBlogPosts({ status: 'published', limit: 1 });
      const mainCount = mainPosts.total;

      if (mainCount === 0) {
        warnings.push('No published blog posts found for main feed');
      }

      // Check categories
      const categories = await storage.getBlogCategories();
      let categoryCount = 0;
      for (const category of categories.filter(cat => cat.active)) {
        const categoryPosts = await storage.getBlogPostsByCategory(category.id, { limit: 1 });
        if (categoryPosts.total > 0) {
          categoryCount++;
        }
      }

      // Check authors
      const authorsResponse = await storage.getBlogAuthors({ active: true });
      let authorCount = 0;
      for (const author of authorsResponse.authors) {
        const authorPosts = await storage.getBlogPostsByAuthor(author.id, { limit: 1 });
        if (authorPosts.total > 0) {
          authorCount++;
        }
      }

      // Check tags
      const tags = await storage.getBlogTags();
      let tagCount = 0;
      for (const tag of tags.filter(t => t.featured)) {
        const tagPosts = await storage.getBlogPostsByTag(tag.slug, { limit: 1 });
        if (tagPosts.total > 0) {
          tagCount++;
        }
      }

      if (categoryCount === 0) {
        warnings.push('No active categories with posts found');
      }

      if (authorCount === 0) {
        warnings.push('No active authors with posts found');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        feedCounts: {
          main: mainCount,
          categories: categoryCount,
          authors: authorCount,
          tags: tagCount
        }
      };
    } catch (error) {
      console.error('Error validating RSS feeds:', error);
      return {
        isValid: false,
        errors: ['Failed to validate RSS feeds'],
        warnings: [],
        feedCounts: { main: 0, categories: 0, authors: 0, tags: 0 }
      };
    }
  }
}

// Create singleton instance
export const rssGenerator = new RSSGenerator();

// Cache for RSS content (10 minutes cache)
class RSSCache {
  private cache = new Map<string, { content: string; timestamp: number }>();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.content;
  }

  set(key: string, content: string): void {
    this.cache.set(key, {
      content,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const rssCache = new RSSCache();