import { Product, Category } from "@/types";

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

export const getProductStructuredData = (product: Product, category?: Category) => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.image || `${baseUrl}/images/product-placeholder.jpg`,
    "sku": product.slug,
    "brand": {
      "@type": "Brand",
      "name": "TechShop"
    },
    "offers": {
      "@type": "Offer",
      "url": category ? `${baseUrl}/${category.slug}/${product.slug}` : `${baseUrl}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "TechShop"
      }
    },
    "aggregateRating": product.rating && product.reviewCount ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  };
};

export const getHomepageStructuredData = () => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TechShop - Premium Electronics & More",
    "url": baseUrl,
    "description": "Discover premium electronics, home & garden items, fashion accessories, and sports equipment. Quality products with fast shipping and excellent customer service.",
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
      "name": "TechShop",
      "url": baseUrl
    }
  };
};

export const defaultSEO: SEOMetadata = {
  title: "TechShop - Premium Electronics & More",
  description: "Discover premium electronics, home & garden items, fashion accessories, and sports equipment. Quality products with fast shipping and excellent customer service.",
  keywords: "electronics, tech gadgets, home garden, fashion accessories, sports equipment, online shopping",
  ogTitle: "TechShop - Premium Electronics & More",
  ogDescription: "Discover premium electronics, home & garden items, fashion accessories, and sports equipment. Quality products with fast shipping and excellent customer service."
};