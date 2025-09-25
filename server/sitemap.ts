import { storage } from './storage';
import { BlogPost, BlogAuthor, BlogCategory, BlogTag } from '@shared/schema';

export interface SitemapURL {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private readonly baseUrl: string;
  private readonly siteName: string;

  constructor(baseUrl: string = 'https://limitplus.ir', siteName: string = 'لیمیت پس') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.siteName = siteName;
  }

  // Generate complete blog sitemap
  async generateBlogSitemap(): Promise<string> {
    try {
      const urls: SitemapURL[] = [];

      // Add main blog page
      urls.push({
        url: `${this.baseUrl}/blog`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9
      });

      // Add published blog posts
      const blogPostsResponse = await storage.getBlogPosts({
        status: 'published',
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      for (const post of blogPostsResponse.posts) {
        urls.push({
          url: `${this.baseUrl}/blog/${post.slug}`,
          lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : 
                   post.publishedAt ? new Date(post.publishedAt).toISOString() :
                   new Date(post.createdAt!).toISOString(),
          changefreq: 'weekly',
          priority: post.featured ? 0.8 : 0.7
        });
      }

      // Add blog categories
      const categories = await storage.getBlogCategories();
      for (const category of categories.filter(cat => cat.active)) {
        // Get post count for this category to determine priority
        const categoryPosts = await storage.getBlogPostsByCategory(category.id, { limit: 1 });
        
        if (categoryPosts.total > 0) {
          urls.push({
            url: `${this.baseUrl}/blog/category/${category.slug}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: category.featured ? 0.7 : 0.6
          });
        }
      }

      // Add blog authors
      const authorsResponse = await storage.getBlogAuthors({ active: true });
      for (const author of authorsResponse.authors) {
        // Get post count for this author to determine if they should be in sitemap
        const authorPosts = await storage.getBlogPostsByAuthor(author.id, { limit: 1 });
        
        if (authorPosts.total > 0) {
          urls.push({
            url: `${this.baseUrl}/blog/author/${author.slug}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly',
            priority: author.featured ? 0.6 : 0.5
          });
        }
      }

      // Add blog tags (only for featured tags with posts)
      const tags = await storage.getBlogTags();
      for (const tag of tags.filter(t => t.featured)) {
        // Check if tag has any posts
        const tagPosts = await storage.getBlogPostsByTag(tag.slug, { limit: 1 });
        
        if (tagPosts.total > 0) {
          urls.push({
            url: `${this.baseUrl}/blog/tag/${tag.slug}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.5
          });
        }
      }

      // Sort URLs by priority (highest first)
      urls.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      return this.generateXML(urls);
    } catch (error) {
      console.error('Error generating blog sitemap:', error);
      throw new Error('Failed to generate blog sitemap');
    }
  }

  // Generate sitemap for specific category
  async generateCategorySitemap(categorySlug: string): Promise<string> {
    try {
      const urls: SitemapURL[] = [];
      
      const category = await storage.getBlogCategoryBySlug(categorySlug);
      if (!category || !category.active) {
        throw new Error('Category not found or inactive');
      }

      // Add category page
      urls.push({
        url: `${this.baseUrl}/blog/category/${category.slug}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      });

      // Add all posts in this category
      const categoryPosts = await storage.getBlogPostsByCategory(category.id);
      for (const post of categoryPosts.posts) {
        urls.push({
          url: `${this.baseUrl}/blog/${post.slug}`,
          lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : 
                   post.publishedAt ? new Date(post.publishedAt).toISOString() :
                   new Date(post.createdAt!).toISOString(),
          changefreq: 'weekly',
          priority: post.featured ? 0.8 : 0.7
        });
      }

      return this.generateXML(urls);
    } catch (error) {
      console.error('Error generating category sitemap:', error);
      throw new Error('Failed to generate category sitemap');
    }
  }

  // Generate sitemap for specific author
  async generateAuthorSitemap(authorSlug: string): Promise<string> {
    try {
      const urls: SitemapURL[] = [];
      
      const author = await storage.getBlogAuthorBySlug(authorSlug);
      if (!author || !author.active) {
        throw new Error('Author not found or inactive');
      }

      // Add author page
      urls.push({
        url: `${this.baseUrl}/blog/author/${author.slug}`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7
      });

      // Add all posts by this author
      const authorPosts = await storage.getBlogPostsByAuthor(author.id);
      for (const post of authorPosts.posts) {
        urls.push({
          url: `${this.baseUrl}/blog/${post.slug}`,
          lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : 
                   post.publishedAt ? new Date(post.publishedAt).toISOString() :
                   new Date(post.createdAt!).toISOString(),
          changefreq: 'weekly',
          priority: post.featured ? 0.8 : 0.7
        });
      }

      return this.generateXML(urls);
    } catch (error) {
      console.error('Error generating author sitemap:', error);
      throw new Error('Failed to generate author sitemap');
    }
  }

  // Generate sitemap index (main sitemap that references other sitemaps)
  async generateSitemapIndex(): Promise<string> {
    try {
      const sitemaps: Array<{ url: string; lastmod: string }> = [];

      // Main blog sitemap
      sitemaps.push({
        url: `${this.baseUrl}/sitemap-blog.xml`,
        lastmod: new Date().toISOString()
      });

      // Category-specific sitemaps (for large categories)
      const categories = await storage.getBlogCategories();
      for (const category of categories.filter(cat => cat.active && cat.featured)) {
        const categoryPosts = await storage.getBlogPostsByCategory(category.id, { limit: 1 });
        
        // Only create separate sitemap for categories with many posts
        if (categoryPosts.total > 50) {
          sitemaps.push({
            url: `${this.baseUrl}/sitemap-blog-category-${category.slug}.xml`,
            lastmod: new Date().toISOString()
          });
        }
      }

      // Author-specific sitemaps (for prolific authors)
      const authorsResponse = await storage.getBlogAuthors({ active: true, featured: true });
      for (const author of authorsResponse.authors) {
        const authorPosts = await storage.getBlogPostsByAuthor(author.id, { limit: 1 });
        
        // Only create separate sitemap for authors with many posts
        if (authorPosts.total > 20) {
          sitemaps.push({
            url: `${this.baseUrl}/sitemap-blog-author-${author.slug}.xml`,
            lastmod: new Date().toISOString()
          });
        }
      }

      return this.generateSitemapIndexXML(sitemaps);
    } catch (error) {
      console.error('Error generating sitemap index:', error);
      throw new Error('Failed to generate sitemap index');
    }
  }

  // Generate XML from URL array
  private generateXML(urls: SitemapURL[]): string {
    const urlElements = urls.map(urlObj => {
      let urlElement = `    <url>\n      <loc>${this.escapeXML(urlObj.url)}</loc>\n`;
      
      if (urlObj.lastmod) {
        urlElement += `      <lastmod>${urlObj.lastmod}</lastmod>\n`;
      }
      
      if (urlObj.changefreq) {
        urlElement += `      <changefreq>${urlObj.changefreq}</changefreq>\n`;
      }
      
      if (urlObj.priority !== undefined) {
        urlElement += `      <priority>${urlObj.priority.toFixed(1)}</priority>\n`;
      }
      
      urlElement += `    </url>`;
      return urlElement;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlElements}
</urlset>`;
  }

  // Generate sitemap index XML
  private generateSitemapIndexXML(sitemaps: Array<{ url: string; lastmod: string }>): string {
    const sitemapElements = sitemaps.map(sitemap => {
      return `    <sitemap>
      <loc>${this.escapeXML(sitemap.url)}</loc>
      <lastmod>${sitemap.lastmod}</lastmod>
    </sitemap>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
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

  // Get sitemap statistics
  async getSitemapStats(): Promise<{
    totalURLs: number;
    blogPosts: number;
    categories: number;
    authors: number;
    tags: number;
    lastGenerated: string;
  }> {
    try {
      const [postsResponse, categoriesResponse, authorsResponse, tagsResponse] = await Promise.all([
        storage.getBlogPosts({ status: 'published', limit: 1 }),
        storage.getBlogCategories(),
        storage.getBlogAuthors({ active: true }),
        storage.getBlogTags()
      ]);

      const activeCategoriesWithPosts = [];
      for (const category of categoriesResponse.filter(cat => cat.active)) {
        const categoryPosts = await storage.getBlogPostsByCategory(category.id, { limit: 1 });
        if (categoryPosts.total > 0) {
          activeCategoriesWithPosts.push(category);
        }
      }

      const activeAuthorsWithPosts = [];
      for (const author of authorsResponse.authors) {
        const authorPosts = await storage.getBlogPostsByAuthor(author.id, { limit: 1 });
        if (authorPosts.total > 0) {
          activeAuthorsWithPosts.push(author);
        }
      }

      const featuredTagsWithPosts = [];
      for (const tag of tagsResponse.filter(t => t.featured)) {
        const tagPosts = await storage.getBlogPostsByTag(tag.slug, { limit: 1 });
        if (tagPosts.total > 0) {
          featuredTagsWithPosts.push(tag);
        }
      }

      const totalURLs = 1 + // Main blog page
                       postsResponse.total + // All blog posts
                       activeCategoriesWithPosts.length + // Active categories with posts
                       activeAuthorsWithPosts.length + // Active authors with posts
                       featuredTagsWithPosts.length; // Featured tags with posts

      return {
        totalURLs,
        blogPosts: postsResponse.total,
        categories: activeCategoriesWithPosts.length,
        authors: activeAuthorsWithPosts.length,
        tags: featuredTagsWithPosts.length,
        lastGenerated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting sitemap stats:', error);
      throw new Error('Failed to get sitemap statistics');
    }
  }

  // Validate sitemap URLs
  async validateSitemap(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    totalURLs: number;
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      let totalURLs = 0;

      // Check blog posts
      const postsResponse = await storage.getBlogPosts({ status: 'published' });
      totalURLs += postsResponse.total;

      for (const post of postsResponse.posts) {
        if (!post.slug) {
          errors.push(`Blog post "${post.title}" has no slug`);
        }
        if (!post.publishedAt && !post.createdAt) {
          warnings.push(`Blog post "${post.title}" has no publication date`);
        }
      }

      // Check categories
      const categories = await storage.getBlogCategories();
      for (const category of categories.filter(cat => cat.active)) {
        if (!category.slug) {
          errors.push(`Category "${category.name}" has no slug`);
        }
        
        const categoryPosts = await storage.getBlogPostsByCategory(category.id, { limit: 1 });
        if (categoryPosts.total > 0) {
          totalURLs++;
        }
      }

      // Check authors
      const authorsResponse = await storage.getBlogAuthors({ active: true });
      for (const author of authorsResponse.authors) {
        if (!author.slug) {
          errors.push(`Author "${author.name}" has no slug`);
        }
        
        const authorPosts = await storage.getBlogPostsByAuthor(author.id, { limit: 1 });
        if (authorPosts.total > 0) {
          totalURLs++;
        }
      }

      totalURLs++; // Main blog page

      if (totalURLs > 50000) {
        warnings.push('Sitemap has more than 50,000 URLs. Consider splitting into multiple sitemaps.');
      }

      if (totalURLs === 0) {
        errors.push('No URLs found for sitemap');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        totalURLs
      };
    } catch (error) {
      console.error('Error validating sitemap:', error);
      return {
        isValid: false,
        errors: ['Failed to validate sitemap'],
        warnings: [],
        totalURLs: 0
      };
    }
  }
}

// Create singleton instance
export const sitemapGenerator = new SitemapGenerator();

// Cache for sitemap content (5 minutes cache)
class SitemapCache {
  private cache = new Map<string, { content: string; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

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

export const sitemapCache = new SitemapCache();