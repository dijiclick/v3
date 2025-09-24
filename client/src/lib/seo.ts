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

// Union type for all structured data schemas
export type StructuredDataSchema = ProductSchema | BreadcrumbSchema | OrganizationSchema | WebSiteSchema;

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