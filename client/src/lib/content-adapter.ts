import { SanityProduct, SanityCategory, urlFor } from './sanity';
import { Product, Category } from '@/types';

// Adapter functions to convert Sanity content to application types
export function adaptSanityProduct(sanityProduct: SanityProduct): Product {
  return {
    id: sanityProduct._id,
    title: sanityProduct.title,
    slug: sanityProduct.slug.current,
    description: sanityProduct.description || '',
    buyLink: null, // Sanity products don't have this field
    mainDescription: null, // Sanity products don't have this field
    featuredTitle: null, // Sanity products don't have this field
    featuredFeatures: null, // Sanity products don't have this field
    price: sanityProduct.price.toString(),
    originalPrice: sanityProduct.originalPrice?.toString() || null,
    categoryId: sanityProduct.category?._id || '',
    image: sanityProduct.image ? urlFor(sanityProduct.image).width(400).height(400).url() : null,
    rating: sanityProduct.rating?.toString() || '0',
    reviewCount: sanityProduct.reviewCount || 0,
    inStock: sanityProduct.inStock,
    featured: sanityProduct.featured,
    tags: sanityProduct.tags || [],
    createdAt: new Date(sanityProduct._createdAt),
    
    // ChatGPT-style layout fields
    layoutStyle: sanityProduct.layoutStyle === 'chatgpt' ? 'chatgpt' : 'traditional',
    heroSection: sanityProduct.heroSection,
    pricingPlans: sanityProduct.pricingPlans,
    screenshots: sanityProduct.screenshots?.map(screenshot => ({
      ...screenshot,
      image: screenshot.image ? urlFor(screenshot.image).width(800).height(600).url() : undefined,
    })),
    sidebarContent: sanityProduct.sidebarContent,
    statisticsSection: sanityProduct.statisticsSection,
    benefitsSection: sanityProduct.benefitsSection,
    footerCTA: sanityProduct.footerCTA,
  };
}

export function adaptSanityCategory(sanityCategory: SanityCategory): Category {
  return {
    id: sanityCategory._id,
    name: sanityCategory.name,
    slug: sanityCategory.slug.current,
    description: sanityCategory.description || '',
    createdAt: new Date(sanityCategory._createdAt),
  };
}

// Convert arrays of Sanity content
export function adaptSanityProducts(sanityProducts: SanityProduct[]): Product[] {
  return sanityProducts.map(adaptSanityProduct);
}

export function adaptSanityCategories(sanityCategories: SanityCategory[]): Category[] {
  return sanityCategories.map(adaptSanityCategory);
}

// Helper function to get product image gallery URLs
export function getProductImageGallery(sanityProduct: SanityProduct): string[] {
  if (!sanityProduct.gallery) return [];
  
  return sanityProduct.gallery.map(image => 
    urlFor(image).width(800).height(800).url()
  );
}

// Helper function to get optimized image URLs
export function getOptimizedImageUrl(sanityImage: any, width = 400, height = 400): string {
  if (!sanityImage) return '';
  return urlFor(sanityImage).width(width).height(height).url();
}

// Helper function to get SEO data from Sanity content
export function getSEOFromSanityProduct(sanityProduct: SanityProduct) {
  return {
    title: sanityProduct.seo?.title || `${sanityProduct.title} - TechShop`,
    description: sanityProduct.seo?.description || sanityProduct.description || `Buy ${sanityProduct.title} for $${sanityProduct.price}`,
    keywords: sanityProduct.seo?.keywords?.join(', ') || sanityProduct.tags?.join(', ') || '',
    image: sanityProduct.image ? urlFor(sanityProduct.image).width(1200).height(630).url() : undefined,
  };
}