import { Product, Category } from "@/types";

// Define types for structured data schemas
export type ProductSchema = {
  "@context": string;
  "@type": "Product";
  name: string;
  description: string;
  image: string;
  sku: string;
  mpn: string;
  brand: {
    "@type": "Brand";
    name: string;
    alternateName: string;
    url: string;
  };
  category: string;
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: number;
    priceValidUntil: string;
    availability: string;
    itemCondition: string;
    seller: {
      "@type": "Organization";
      name: string;
      alternateName: string;
      url: string;
    };
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
    bestRating: string;
    worstRating: string;
  };
  additionalProperty?: {
    "@type": "PropertyValue";
    name: string;
    value: string;
  }[];
};

export type BreadcrumbSchema = {
  "@context": string;
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

export type OrganizationSchema = {
  "@context": string;
  "@type": "Organization";
  name: string;
  alternateName: string;
  url: string;
  logo: string;
  description: string;
  address: {
    "@type": "PostalAddress";
    addressCountry: string;
    addressLocality: string;
  };
  contactPoint: {
    "@type": "ContactPoint";
    contactType: string;
    availableLanguage: string;
  };
  sameAs: string[];
};

export type WebSiteSchema = {
  "@context": string;
  "@type": "WebSite";
  name: string;
  alternateName: string;
  url: string;
  inLanguage: string;
  description: string;
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    alternateName: string;
    url: string;
  };
};

// Blog-specific schemas
export type BlogSchema = {
  "@context": string;
  "@type": "Blog";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo?: string;
  };
  mainEntityOfPage?: {
    "@type": "WebPage";
    "@id": string;
  };
};

export type BlogPostSchema = {
  "@context": string;
  "@type": "BlogPosting";
  headline: string;
  description: string;
  image?: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
    image?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo?: string;
  };
  datePublished: string;
  dateModified?: string;
  wordCount?: number;
  timeRequired?: string;
  articleSection?: string;
  keywords?: string[];
  articleBody?: string;
  url: string;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  inLanguage: string;
};

export type AuthorSchema = {
  "@context": string;
  "@type": "Person";
  name: string;
  description?: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  sameAs?: string[];
  knowsAbout?: string[];
};

export type CategorySchema = {
  "@context": string;
  "@type": "CollectionPage";
  name: string;
  description?: string;
  url: string;
  mainEntity: {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement: {
      "@type": "BlogPosting";
      position: number;
      url: string;
      name: string;
      description?: string;
      datePublished: string;
      author: {
        "@type": "Person";
        name: string;
      };
    }[];
  };
  breadcrumb?: BreadcrumbSchema;
};

// Union type for all structured data schemas
export type StructuredDataSchema = ProductSchema | BreadcrumbSchema | OrganizationSchema | WebSiteSchema | BlogSchema | BlogPostSchema | AuthorSchema | CategorySchema;

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  canonical?: string;
  robots?: string;
  structuredData?: object;
  hreflang?: string;
  ogLocale?: string;
}

export const updatePageSEO = (metadata: SEOMetadata) => {
  // Update document title
  document.title = metadata.title;

  // Helper function to set or update meta tag
  const setMetaTag = (name: string, content: string, property = false) => {
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
  };

  // Set basic meta tags
  setMetaTag('description', metadata.description);
  if (metadata.keywords) {
    setMetaTag('keywords', metadata.keywords);
  }

  // Set Open Graph tags
  setMetaTag('og:title', metadata.ogTitle || metadata.title, true);
  setMetaTag('og:description', metadata.ogDescription || metadata.description, true);
  setMetaTag('og:type', metadata.ogType || 'website', true);
  setMetaTag('og:locale', metadata.ogLocale || 'fa_IR', true);
  
  if (metadata.ogImage) {
    setMetaTag('og:image', metadata.ogImage, true);
  }
  
  if (metadata.ogUrl) {
    setMetaTag('og:url', metadata.ogUrl, true);
  }

  // Set Twitter Card tags (using name attribute)
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', metadata.ogTitle || metadata.title);
  setMetaTag('twitter:description', metadata.ogDescription || metadata.description);
  
  if (metadata.ogImage) {
    setMetaTag('twitter:image', metadata.ogImage);
  }

  // Set canonical URL
  if (metadata.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', metadata.canonical);
  }

  // Set robots meta
  if (metadata.robots) {
    setMetaTag('robots', metadata.robots);
  }

  // Add structured data if provided (with data attribute for tracking)
  if (metadata.structuredData) {
    // Remove existing SEO structured data
    const existingScript = document.querySelector('script[data-seo="dynamic"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'dynamic');
    script.textContent = JSON.stringify(metadata.structuredData);
    document.head.appendChild(script);
  }
};

export const getProductStructuredData = (product: Product, category?: Category): ProductSchema => {
  const baseUrl = window.location.origin;
  
  // Use regular title for consistent SEO
  const productName = product.title;
  
  // Enhanced description for SEO - use mainDescription or description
  const getProductDescription = () => {
    if (product.mainDescription && typeof product.mainDescription === 'string') {
      return product.mainDescription.replace(/<[^>]*>/g, '').substring(0, 160);
    }
    if (product.description) return product.description.substring(0, 160);
    return `خرید ${productName} با کیفیت پریمیوم از لیمیت پس`;
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": getProductDescription(),
    "image": product.image || `${baseUrl}/images/product-placeholder.jpg`,
    "sku": product.slug,
    "mpn": product.slug, // Manufacturer Part Number
    "brand": {
      "@type": "Brand",
      "name": "Limitpass",
      "alternateName": "لیمیت پس",
      "url": baseUrl
    },
    "category": category?.name || "محصولات دیجیتال",
    "offers": {
      "@type": "Offer",
      "url": category ? `${baseUrl}/${category.slug}/${product.slug}` : `${baseUrl}`,
      "priceCurrency": "IRR",
      "price": parseFloat(product.price),
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Limitpass",
        "alternateName": "لیمیت پس",
        "url": baseUrl
      }
    },
    "aggregateRating": product.rating && product.reviewCount ? {
      "@type": "AggregateRating",
      "ratingValue": parseFloat(product.rating),
      "reviewCount": product.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    // Add featured product special markup
    ...(product.featured && {
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "محصول ویژه",
          "value": "true"
        }
      ]
    })
  };
};

export const getHomepageStructuredData = (): WebSiteSchema => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "لیمیت پس - اشتراک پریمیوم مشترک با قیمت پایین‌تر",
    "alternateName": "Limitpass",
    "url": baseUrl,
    "inLanguage": "fa-IR",
    "description": "خرید اشتراک مشترک Netflix, Spotify, YouTube Premium, Adobe و سرویس‌های دیگر با قیمت پایین‌تر از لیمیت پس",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Limitpass",
      "alternateName": "لیمیت پس",
      "url": baseUrl
    }
  };
};

// Blog-specific SEO functions
export const generateBlogTitle = (postTitle: string, categoryName?: string): string => {
  const siteName = "وبلاگ لیمیت پس";
  if (categoryName) {
    return `${postTitle} - ${categoryName} | ${siteName}`;
  }
  return `${postTitle} | ${siteName}`;
};

export const generateBlogMetaDescription = (excerpt: string, authorName?: string): string => {
  const maxLength = 155;
  let description = excerpt;
  
  if (authorName) {
    description += ` - نوشته ${authorName} در وبلاگ لیمیت پس`;
  } else {
    description += " - وبلاگ لیمیت پس";
  }
  
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + "...";
  }
  
  return description;
};

// Generate blog listing structured data
export const getBlogStructuredData = (
  blogTitle: string,
  blogDescription: string,
  blogUrl: string
): BlogSchema => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": blogTitle,
    "description": blogDescription,
    "url": blogUrl,
    "inLanguage": "fa-IR",
    "publisher": {
      "@type": "Organization",
      "name": "لیمیت پس",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": blogUrl
    }
  };
};

// Generate blog post structured data
export const getBlogPostStructuredData = (
  post: {
    title: string;
    excerpt: string;
    slug: string;
    featuredImage?: string;
    publishedAt: Date | string;
    updatedAt?: Date | string;
    readingTime?: number;
    content?: any;
    tags?: string[];
    author?: {
      name: string;
      avatar?: string;
      website?: string;
    };
    category?: {
      name: string;
      slug: string;
    };
  }
): BlogPostSchema => {
  const baseUrl = window.location.origin;
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const publishedDate = typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toISOString();
  const modifiedDate = post.updatedAt ? (typeof post.updatedAt === 'string' ? post.updatedAt : post.updatedAt.toISOString()) : publishedDate;
  
  // Calculate word count from content if available
  const wordCount = post.content ? 
    (typeof post.content === 'string' ? post.content.split(/\s+/).length : undefined) : undefined;
  
  // Format reading time
  const timeRequired = post.readingTime ? `PT${post.readingTime}M` : undefined;
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "نویسنده وبلاگ",
      "url": post.author?.website,
      "image": post.author?.avatar
    },
    "publisher": {
      "@type": "Organization",
      "name": "لیمیت پس",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "wordCount": wordCount,
    "timeRequired": timeRequired,
    "articleSection": post.category?.name,
    "keywords": post.tags,
    "url": postUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "inLanguage": "fa-IR"
  };
};

// Generate blog category page structured data
export const getBlogCategoryStructuredData = (
  category: {
    name: string;
    slug: string;
    description?: string;
  },
  posts: {
    title: string;
    slug: string;
    excerpt?: string;
    publishedAt: Date | string;
    author?: {
      name: string;
    };
  }[],
  breadcrumbs?: { name: string; url: string }[]
): CategorySchema => {
  const baseUrl = window.location.origin;
  const categoryUrl = `${baseUrl}/blog/category/${category.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "url": categoryUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": posts.length,
      "itemListElement": posts.map((post, index) => ({
        "@type": "BlogPosting",
        "position": index + 1,
        "url": `${baseUrl}/blog/${post.slug}`,
        "name": post.title,
        "description": post.excerpt,
        "datePublished": typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toISOString(),
        "author": {
          "@type": "Person",
          "name": post.author?.name || "نویسنده"
        }
      }))
    },
    "breadcrumb": breadcrumbs ? getBreadcrumbStructuredData(breadcrumbs) : undefined
  };
};

// Generate author structured data
export const getAuthorStructuredData = (
  author: {
    name: string;
    bio?: string;
    avatar?: string;
    website?: string;
    jobTitle?: string;
    company?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  }
): AuthorSchema => {
  const baseUrl = window.location.origin;
  const sameAs: string[] = [];
  
  if (author.website) sameAs.push(author.website);
  if (author.twitter) sameAs.push(`https://twitter.com/${author.twitter.replace('@', '')}`);
  if (author.linkedin) sameAs.push(author.linkedin);
  if (author.github) sameAs.push(`https://github.com/${author.github}`);
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": author.bio,
    "image": author.avatar,
    "jobTitle": author.jobTitle,
    "worksFor": author.company ? {
      "@type": "Organization",
      "name": author.company,
      "url": baseUrl
    } : undefined,
    "sameAs": sameAs.length > 0 ? sameAs : undefined
  };
};

// Default blog SEO metadata
export const defaultBlogSEO: SEOMetadata = {
  title: "وبلاگ لیمیت پس - مقالات آموزشی و راهنمایی‌ها",
  description: "وبلاگ لیمیت پس - مقالات آموزشی، راهنمایی‌ها و آخرین اخبار. منبع کاملی از اطلاعات کاربردی و روزآمد.",
  keywords: "وبلاگ، آموزش، راهنمایی، مقالات، لیمیت پس، نکات کاربردی",
  ogTitle: "وبلاگ لیمیت پس - مقالات آموزشی و راهنمایی‌ها",
  ogDescription: "وبلاگ لیمیت پس - مقالات آموزشی، راهنمایی‌ها و آخرین اخبار",
  ogLocale: "fa_IR",
  hreflang: "fa"
};

export const defaultSEO: SEOMetadata = {
  title: "لیمیت پس - اشتراک پریمیوم مشترک با قیمت پایین‌تر",
  description: "خرید اشتراک مشترک Netflix, Spotify, YouTube Premium, Adobe و سرویس‌های دیگر با قیمت پایین‌تر از لیمیت پس. دسترسی آسان و کیفیت پریمیوم",
  keywords: "اشتراک مشترک، Netflix، Spotify، YouTube Premium، Adobe، قیمت ارزان، لیمیت پس، اشتراک ایرانی",
  ogTitle: "لیمیت پس - اشتراک پریمیوم مشترک با قیمت پایین‌تر",
  ogDescription: "خرید اشتراک مشترک Netflix, Spotify, YouTube Premium, Adobe و سرویس‌های دیگر با قیمت پایین‌تر از لیمیت پس",
  ogLocale: "fa_IR",
  hreflang: "fa"
};

// Generate breadcrumb navigation structured data
export const getBreadcrumbStructuredData = (breadcrumbs: { name: string; url: string }[]): BreadcrumbSchema => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// Generate Organization schema for Limitpass
export const getOrganizationStructuredData = (): OrganizationSchema => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Limitpass",
    "alternateName": "لیمیت پس",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.svg`,
    "description": "خرید اشتراک مشترک Netflix, Spotify, YouTube Premium, Adobe و سرویس‌های دیگر با قیمت پایین‌تر از لیمیت پس",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IR",
      "addressLocality": "تهران"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Persian"
    },
    "sameAs": [
      // Add social media profiles here when available
    ]
  };
};

// Enhanced meta description generation
export const generateMetaDescription = (product: Product): string => {
  
  // Fallback to main description (strip HTML)
  if (product.mainDescription && typeof product.mainDescription === 'string') {
    const stripped = product.mainDescription.replace(/<[^>]*>/g, '').trim();
    return stripped.length > 160 
      ? stripped.substring(0, 157) + '...'
      : stripped;
  }
  
  // Fallback to regular description
  if (product.description && product.description.length > 0) {
    return product.description.length > 160 
      ? product.description.substring(0, 157) + '...'
      : product.description;
  }
  
  // Default description
  const productName = product.title;
  return `خرید ${productName} با قیمت ویژه از لیمیت پس. دسترسی آسان و کیفیت پریمیوم`;
};

// Generate product page title with SEO optimization
export const generateProductTitle = (product: Product): string => {
  const productName = product.title;
  return `${productName} - خرید آنلاین | Limitpass`;
};

// Combined structured data for product pages (includes breadcrumbs + product + organization)
export const getEnhancedProductStructuredData = (
  product: Product, 
  category?: Category,
  breadcrumbs?: { name: string; url: string }[]
): StructuredDataSchema | StructuredDataSchema[] => {
  const schemas: StructuredDataSchema[] = [getProductStructuredData(product, category)];
  
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(getBreadcrumbStructuredData(breadcrumbs));
  }
  
  // Add organization schema for brand recognition
  schemas.push(getOrganizationStructuredData());
  
  return schemas.length === 1 ? schemas[0] : schemas;
};