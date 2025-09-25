import { BlogPost, BlogAuthor, BlogCategory, BlogTag, Product, Category } from "@/types";
import { updatePageSEO, type BlogPostSchema, type AuthorSchema, type CategorySchema, type BreadcrumbSchema, type OrganizationSchema, type WebSiteSchema } from "./seo";

// Enhanced SEO Service with comprehensive utilities
export class SEOService {
  private static readonly SITE_NAME = "لیمیت پس";
  private static readonly SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://limitplus.ir';
  private static readonly ORGANIZATION_NAME = "لیمیت پس";
  private static readonly ORGANIZATION_URL = "https://limitplus.ir";
  private static readonly ORGANIZATION_LOGO = `${SEOService.SITE_URL}/logo.png`;

  // Generate comprehensive blog post schema with enhanced data
  static generateBlogPostSchema(
    post: BlogPost, 
    author?: BlogAuthor, 
    category?: BlogCategory,
    relatedPosts?: BlogPost[]
  ): BlogPostSchema {
    const baseUrl = SEOService.SITE_URL;
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    
    // Calculate word count from content
    const wordCount = SEOService.calculateWordCount(post.content);
    
    // Generate reading time
    const readingTime = post.readingTime || Math.ceil(wordCount / 200); // 200 words per minute
    
    // Extract keywords from content and SEO keywords
    const keywords = SEOService.extractKeywords(post.content, post.seoKeywords);
    
    const schema: BlogPostSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
      image: post.featuredImage || post.ogImage,
      author: {
        "@type": "Person",
        name: author?.name || "نویسنده ناشناس",
        url: author ? `${baseUrl}/blog/author/${author.slug}` : undefined,
        image: author?.avatar,
        jobTitle: author?.jobTitle,
        description: author?.bio,
        worksFor: author?.company ? {
          "@type": "Organization",
          name: author.company,
          url: author.website || SEOService.ORGANIZATION_URL
        } : undefined,
        sameAs: SEOService.getAuthorSocialLinks(author)
      },
      publisher: {
        "@type": "Organization",
        name: SEOService.ORGANIZATION_NAME,
        url: SEOService.ORGANIZATION_URL,
        logo: {
          "@type": "ImageObject",
          url: SEOService.ORGANIZATION_LOGO,
          width: "200",
          height: "60"
        }
      },
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt!).toISOString(),
      dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      wordCount,
      timeRequired: `PT${readingTime}M`,
      articleSection: category?.name,
      keywords,
      url: postUrl,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl
      },
      inLanguage: "fa-IR",
      isAccessibleForFree: true,
      about: category ? {
        "@type": "Thing",
        name: category.name,
        description: category.description
      } : undefined,
      mentions: relatedPosts?.map(related => ({
        "@type": "BlogPosting",
        name: related.title,
        url: `${baseUrl}/blog/${related.slug}`
      }))
    };

    return schema;
  }

  // Generate enhanced author schema
  static generateAuthorSchema(
    author: BlogAuthor, 
    posts?: BlogPost[],
    stats?: { postCount: number; totalViews: number }
  ): AuthorSchema {
    const baseUrl = SEOService.SITE_URL;
    const authorUrl = `${baseUrl}/blog/author/${author.slug}`;
    
    const schema: AuthorSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: author.name,
      description: author.bio || undefined,
      url: authorUrl,
      image: author.avatar,
      jobTitle: author.jobTitle,
      worksFor: author.company ? {
        "@type": "Organization",
        name: author.company,
        url: author.website || SEOService.ORGANIZATION_URL
      } : undefined,
      sameAs: SEOService.getAuthorSocialLinks(author),
      knowsAbout: posts?.map(post => post.title).slice(0, 10), // Top 10 topics
      mainEntityOfPage: {
        "@type": "ProfilePage",
        "@id": authorUrl
      },
      email: author.email || undefined
    };

    return schema;
  }

  // Generate category schema with posts
  static generateCategorySchema(
    category: BlogCategory, 
    posts: BlogPost[] = [],
    totalCount: number = 0
  ): CategorySchema {
    const baseUrl = SEOService.SITE_URL;
    const categoryUrl = `${baseUrl}/blog/category/${category.slug}`;
    
    const schema: CategorySchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.seoTitle || category.name,
      description: category.seoDescription || category.description || undefined,
      url: categoryUrl,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: totalCount,
        itemListElement: posts.map((post, index) => ({
          "@type": "BlogPosting",
          position: index + 1,
          url: `${baseUrl}/blog/${post.slug}`,
          name: post.title,
          description: post.excerpt || undefined,
          datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : "",
          author: {
            "@type": "Person",
            name: post.author?.name || "نویسنده ناشناس"
          }
        }))
      },
      breadcrumb: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "خانه",
            item: baseUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "وبلاگ",
            item: `${baseUrl}/blog`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: categoryUrl
          }
        ]
      }
    };

    return schema;
  }

  // Generate organization schema
  static generateOrganizationSchema(): OrganizationSchema {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SEOService.ORGANIZATION_NAME,
      alternateName: "LimitPlus",
      url: SEOService.ORGANIZATION_URL,
      logo: SEOService.ORGANIZATION_LOGO,
      description: "ارائه دهنده محصولات و خدمات دیجیتال با کیفیت",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IR",
        addressLocality: "تهران"
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Persian"
      },
      sameAs: [
        "https://t.me/limitplus",
        "https://instagram.com/limitplus.ir"
      ]
    };
  }

  // Generate website schema
  static generateWebsiteSchema(): WebSiteSchema {
    const baseUrl = SEOService.SITE_URL;
    
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SEOService.SITE_NAME,
      alternateName: "LimitPlus",
      url: baseUrl,
      inLanguage: "fa-IR",
      description: "وبسایت رسمی لیمیت پس - ارائه دهنده محصولات و خدمات دیجیتال",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/blog?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      publisher: {
        "@type": "Organization",
        name: SEOService.ORGANIZATION_NAME,
        alternateName: "LimitPlus",
        url: SEOService.ORGANIZATION_URL
      }
    };
  }

  // Advanced meta tag generation
  static generateAdvancedMeta(options: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: string;
    publishedAt?: Date;
    modifiedAt?: Date;
    author?: string;
    tags?: string[];
    category?: string;
    readingTime?: number;
    locale?: string;
  }) {
    const baseUrl = SEOService.SITE_URL;
    const {
      title,
      description,
      image,
      url,
      type = 'article',
      publishedAt,
      modifiedAt,
      author,
      tags,
      category,
      readingTime,
      locale = 'fa_IR'
    } = options;

    return {
      // Basic meta tags
      title: `${title} - ${SEOService.SITE_NAME}`,
      description,
      
      // Open Graph tags
      'og:title': title,
      'og:description': description,
      'og:image': image || `${baseUrl}/og-default.png`,
      'og:url': url,
      'og:type': type,
      'og:site_name': SEOService.SITE_NAME,
      'og:locale': locale,
      
      // Twitter Card tags
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image || `${baseUrl}/og-default.png`,
      
      // Article specific tags
      ...(type === 'article' && {
        'article:published_time': publishedAt?.toISOString(),
        'article:modified_time': modifiedAt?.toISOString(),
        'article:author': author,
        'article:section': category,
        'article:tag': tags?.join(','),
        'article:reading_time': readingTime ? `${readingTime} minutes` : undefined
      }),
      
      // Additional meta tags
      'robots': 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      'canonical': url,
      'language': 'fa-IR',
      'author': author,
      'keywords': tags?.join(', ')
    };
  }

  // Extract keywords from content
  static extractKeywords(content: any, seoKeywords?: string[]): string[] {
    const keywords = new Set(seoKeywords || []);
    
    if (typeof content === 'string') {
      // Simple keyword extraction from HTML content
      const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
      const words = text.split(/\s+/).filter(word => word.length > 3);
      
      // Count word frequency
      const wordCount: Record<string, number> = {};
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u061C\u200E\u200Fa-zA-Z]/g, '');
        if (cleanWord.length > 3) {
          wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
        }
      });
      
      // Get top keywords
      const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
      
      topWords.forEach(word => keywords.add(word));
    }
    
    return Array.from(keywords);
  }

  // Calculate word count from content
  static calculateWordCount(content: any): number {
    if (typeof content === 'string') {
      const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
      return text.split(/\s+/).filter(word => word.length > 0).length;
    }
    
    if (Array.isArray(content)) {
      return content.reduce((count, section) => {
        if (section.text) {
          return count + section.text.split(/\s+/).filter((word: string) => word.length > 0).length;
        }
        return count;
      }, 0);
    }
    
    return 0;
  }

  // Get author social links
  static getAuthorSocialLinks(author?: BlogAuthor): string[] {
    if (!author) return [];
    
    const links: string[] = [];
    
    if (author.website) links.push(author.website);
    if (author.twitter) links.push(`https://twitter.com/${author.twitter.replace('@', '')}`);
    if (author.linkedin) links.push(author.linkedin);
    if (author.github) links.push(`https://github.com/${author.github}`);
    if (author.telegram) links.push(`https://t.me/${author.telegram.replace('@', '')}`);
    
    return links;
  }

  // Generate breadcrumb schema
  static generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbSchema {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
  }

  // Generate dynamic OG image URL
  static generateOGImageUrl(options: {
    title: string;
    category?: string;
    author?: string;
    type?: 'blog' | 'category' | 'author';
  }): string {
    const baseUrl = SEOService.SITE_URL;
    const params = new URLSearchParams({
      title: options.title,
      ...(options.category && { category: options.category }),
      ...(options.author && { author: options.author }),
      type: options.type || 'blog'
    });
    
    return `${baseUrl}/api/og-image?${params.toString()}`;
  }

  // Validate SEO data
  static validateSEOData(data: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
  }): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!data.title) {
      errors.push('Title is required');
    } else {
      if (data.title.length < 30) {
        warnings.push('Title is too short (recommended: 30-60 characters)');
      }
      if (data.title.length > 60) {
        warnings.push('Title is too long (recommended: 30-60 characters)');
      }
    }

    // Description validation
    if (!data.description) {
      errors.push('Description is required');
    } else {
      if (data.description.length < 120) {
        warnings.push('Description is too short (recommended: 120-160 characters)');
      }
      if (data.description.length > 160) {
        warnings.push('Description is too long (recommended: 120-160 characters)');
      }
    }

    // Keywords validation
    if (!data.keywords || data.keywords.length === 0) {
      warnings.push('No keywords specified');
    } else if (data.keywords.length > 10) {
      warnings.push('Too many keywords (recommended: 3-10 keywords)');
    }

    // Image validation
    if (!data.image) {
      warnings.push('No featured image specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Update page SEO with comprehensive schema
  static updatePageSEO(options: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: string;
    schemas?: any[];
    publishedAt?: Date;
    modifiedAt?: Date;
    author?: string;
    tags?: string[];
    category?: string;
    readingTime?: number;
  }) {
    const meta = SEOService.generateAdvancedMeta(options);
    
    // Update basic meta tags
    updatePageSEO({
      title: meta.title,
      description: meta.description,
      ogTitle: meta['og:title'],
      ogDescription: meta['og:description'],
      ogImage: meta['og:image'],
      ogUrl: meta['og:url'],
      ogType: meta['og:type'],
      canonical: meta.canonical,
      robots: meta.robots,
      structuredData: options.schemas
    });

    // Set additional meta tags
    SEOService.setMetaTag('og:site_name', meta['og:site_name'], true);
    SEOService.setMetaTag('og:locale', meta['og:locale'], true);
    SEOService.setMetaTag('twitter:card', meta['twitter:card']);
    SEOService.setMetaTag('twitter:title', meta['twitter:title']);
    SEOService.setMetaTag('twitter:description', meta['twitter:description']);
    SEOService.setMetaTag('twitter:image', meta['twitter:image']);
    
    if (meta['article:published_time']) {
      SEOService.setMetaTag('article:published_time', meta['article:published_time'], true);
    }
    if (meta['article:modified_time']) {
      SEOService.setMetaTag('article:modified_time', meta['article:modified_time'], true);
    }
    if (meta['article:author']) {
      SEOService.setMetaTag('article:author', meta['article:author'], true);
    }
    if (meta['article:section']) {
      SEOService.setMetaTag('article:section', meta['article:section'], true);
    }
    if (meta['article:tag']) {
      SEOService.setMetaTag('article:tag', meta['article:tag'], true);
    }
    
    SEOService.setMetaTag('language', meta.language);
    if (meta.author) {
      SEOService.setMetaTag('author', meta.author);
    }
    if (meta.keywords) {
      SEOService.setMetaTag('keywords', meta.keywords);
    }
  }

  // Helper function to set meta tags
  private static setMetaTag(name: string, content: string, property = false) {
    if (!content) return;
    
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
}

// Export for convenience
export default SEOService;