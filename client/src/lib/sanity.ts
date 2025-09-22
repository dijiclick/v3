import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true, // CDN for better performance on read operations
  apiVersion: '2024-01-01', // Use current date in YYYY-MM-DD format
  // No token on client-side for security - only use for read operations
});

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(sanityClient);

// Helper function to generate image URLs
export function urlFor(source: any) {
  return builder.image(source);
}

// Sanity content types
export interface SanityProduct {
  _id: string;
  _type: 'product';
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  price: number;
  originalPrice?: number;
  category?: {
    _id: string;
    name: string;
    slug: {
      current: string;
    };
  };
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  gallery?: Array<{
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  }>;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  featured: boolean;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  
  // ChatGPT-style layout fields
  layoutStyle?: 'ecommerce' | 'chatgpt';
  heroSection?: {
    titleOverride?: string;
    subtitle?: string;
    heroIcon?: string;
    features?: string[];
    rtlDirection?: boolean;
  };
  pricingPlans?: Array<{
    duration: string;
    price: string;
    priceNumber?: number;
    originalPrice?: string;
    originalPriceNumber?: number;
    isPopular?: boolean;
    discount?: string;
  }>;
  screenshots?: Array<{
    title?: string;
    description?: string;
    gradient?: string;
    icon?: string;
    image?: {
      asset: {
        _ref: string;
        _type: 'reference';
      };
      alt?: string;
    };
  }>;
  sidebarContent?: {
    howItWorks?: Array<{
      step: string;
      title: string;
      description: string;
    }>;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    recommendations?: Array<{
      icon: string;
      name: string;
      price: string;
      backgroundColor?: string;
    }>;
  };
  statisticsSection?: {
    title?: string;
    subtitle?: string;
    backgroundGradient?: string;
    statistics?: Array<{
      value: string;
      label: string;
      icon?: string;
    }>;
  };
  benefitsSection?: {
    title?: string;
    benefits?: Array<{
      icon?: string;
      title: string;
      description: string;
      gradient?: string;
    }>;
  };
  footerCTA?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonUrl?: string;
    supportingLinks?: Array<{
      text: string;
      url: string;
    }>;
    backgroundGradient?: string;
  };
  
  _createdAt: string;
  _updatedAt: string;
}

export interface SanityCategory {
  _id: string;
  _type: 'category';
  name: string;
  slug: {
    current: string;
  };
  description?: string;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  _createdAt: string;
  _updatedAt: string;
}

export interface SanityPage {
  _id: string;
  _type: 'page';
  title: string;
  slug: {
    current: string;
  };
  content: any[]; // Portable Text content
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  _createdAt: string;
  _updatedAt: string;
}

// GROQ queries
export const QUERIES = {
  ALL_PRODUCTS: `*[_type == "product"] {
    _id,
    title,
    slug,
    description,
    price,
    originalPrice,
    category->{
      _id,
      name,
      slug
    },
    image,
    gallery,
    rating,
    reviewCount,
    inStock,
    featured,
    tags,
    seo,
    layoutStyle,
    heroSection,
    pricingPlans,
    screenshots,
    sidebarContent,
    statisticsSection,
    benefitsSection,
    footerCTA,
    _createdAt,
    _updatedAt
  }`,
  
  FEATURED_PRODUCTS: `*[_type == "product" && featured == true] {
    _id,
    title,
    slug,
    description,
    price,
    originalPrice,
    category->{
      _id,
      name,
      slug
    },
    image,
    rating,
    reviewCount,
    inStock,
    featured,
    tags,
    layoutStyle,
    heroSection,
    pricingPlans,
    screenshots,
    sidebarContent,
    statisticsSection,
    benefitsSection,
    footerCTA,
    _createdAt,
    _updatedAt
  }`,
  
  PRODUCT_BY_SLUG: `*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    price,
    originalPrice,
    category->{
      _id,
      name,
      slug
    },
    image,
    gallery,
    rating,
    reviewCount,
    inStock,
    featured,
    tags,
    seo,
    layoutStyle,
    heroSection,
    pricingPlans,
    screenshots,
    sidebarContent,
    statisticsSection,
    benefitsSection,
    footerCTA,
    _createdAt,
    _updatedAt
  }`,
  
  ALL_CATEGORIES: `*[_type == "category"] {
    _id,
    name,
    slug,
    description,
    image,
    _createdAt,
    _updatedAt
  }`,
  
  CATEGORY_BY_SLUG: `*[_type == "category" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    image,
    _createdAt,
    _updatedAt
  }`,
  
  PRODUCTS_BY_CATEGORY: `*[_type == "product" && references($categoryId)] {
    _id,
    title,
    slug,
    description,
    price,
    originalPrice,
    category->{
      _id,
      name,
      slug
    },
    image,
    rating,
    reviewCount,
    inStock,
    featured,
    tags,
    layoutStyle,
    heroSection,
    pricingPlans,
    screenshots,
    sidebarContent,
    statisticsSection,
    benefitsSection,
    footerCTA,
    _createdAt,
    _updatedAt
  }`,
  
  PAGE_BY_SLUG: `*[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    content,
    seo,
    _createdAt,
    _updatedAt
  }`
};