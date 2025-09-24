import { Product, Category } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useSanityProducts, useSanityCategories, useSanityProduct, isSanityConfigured } from '@/hooks/use-sanity';
import { adaptSanityProducts, adaptSanityCategories, adaptSanityProduct } from './content-adapter';

// Content service that provides a unified interface for both Sanity and database content
export class ContentService {
  private useSanity: boolean;

  constructor(useSanity = false) {
    this.useSanity = useSanity;
  }

  // Check if Sanity is configured
  static isSanityConfigured(): boolean {
    return !!(
      import.meta.env.VITE_SANITY_PROJECT_ID && 
      import.meta.env.VITE_SANITY_DATASET
    );
  }

  // Get products from either Sanity or database
  async getProducts(): Promise<Product[]> {
    if (this.useSanity && ContentService.isSanityConfigured()) {
      // This would be used in a component with the hook
      throw new Error('Use useProducts hook for Sanity data in components');
    } else {
      // Fallback to database API
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  }

  // Get categories from either Sanity or database  
  async getCategories(): Promise<Category[]> {
    if (this.useSanity && ContentService.isSanityConfigured()) {
      throw new Error('Use useCategories hook for Sanity data in components');
    } else {
      // Fallback to database API
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  }

  // Get single product
  async getProduct(slug: string): Promise<Product | null> {
    if (this.useSanity && ContentService.isSanityConfigured()) {
      throw new Error('Use useProduct hook for Sanity data in components');
    } else {
      // Fallback to database API
      const response = await fetch(`/api/products/slug/${slug}`);
      if (!response.ok) return null;
      return response.json();
    }
  }
}

// React hooks that automatically choose between Sanity and database
export function useProducts() {
  if (isSanityConfigured()) {
    const { data: sanityProducts, isLoading, error } = useSanityProducts();
    const products = sanityProducts ? adaptSanityProducts(sanityProducts) : [];
    return { data: products, isLoading, error };
  } else {
    // Fallback to existing API-based hook
    return useApiProducts();
  }
}

export function useCategories() {
  if (isSanityConfigured()) {
    const { data: sanityCategories, isLoading, error } = useSanityCategories();
    const categories = sanityCategories ? adaptSanityCategories(sanityCategories) : [];
    return { data: categories, isLoading, error };
  } else {
    // Fallback to existing API-based hook
    return useApiCategories();
  }
}

export function useProduct(slug: string) {
  if (isSanityConfigured()) {
    const { data: sanityProduct, isLoading, error } = useSanityProduct(slug);
    const product = sanityProduct ? adaptSanityProduct(sanityProduct) : undefined;
    return { data: product, isLoading, error };
  } else {
    // Fallback to existing API-based hook
    return useApiProduct(slug);
  }
}

// New hook for fetching product by category slug and product slug
export function useProductByCategoryAndSlug(categorySlug: string, productSlug: string) {
  return useQuery({
    queryKey: ['/api/products', categorySlug, productSlug],
    queryFn: async () => {
      if (!categorySlug || !productSlug) return null;
      try {
        const response = await fetch(`/api/products/${categorySlug}/${productSlug}`);
        if (!response.ok) return null;
        return response.json();
      } catch (error) {
        console.error('Error fetching product by category and slug:', error);
        return null;
      }
    },
    enabled: Boolean(categorySlug && productSlug),
  });
}

// Hook specifically for featured products
export function useFeaturedProducts() {
  const result = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });
  return {
    data: result.data || [],
    isLoading: result.isLoading,
    error: result.error
  };
}

// Fallback hooks for database API (existing functionality)
function useApiProducts() {
  // Use existing React Query hook - this should integrate with actual API hooks
  const result = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  return {
    data: result.data || [],
    isLoading: result.isLoading,
    error: result.error
  };
}

function useApiCategories() {
  // Use existing React Query hook
  const result = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  return {
    data: result.data || [],
    isLoading: result.isLoading,
    error: result.error
  };
}

function useApiProduct(slug: string) {
  // Use existing React Query hook 
  const result = useQuery<Product>({
    queryKey: [`/api/products/slug/${slug}`],
    enabled: !!slug,
  });
  return {
    data: result.data,
    isLoading: result.isLoading,
    error: result.error
  };
}

// Helper hook to get category by slug  
export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['/api/categories', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const response = await fetch(`/api/categories`);
        if (!response.ok) return null;
        const categories = await response.json();
        return categories.find((cat: Category) => cat.slug === slug) || null;
      } catch (error) {
        console.error('Error fetching category by slug:', error);
        return null;
      }
    },
    enabled: Boolean(slug),
  });
}

// Export the service instance
export const contentService = new ContentService(ContentService.isSanityConfigured());