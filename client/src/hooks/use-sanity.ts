import { useQuery } from '@tanstack/react-query';
import { sanityClient, SanityProduct, SanityCategory, SanityPage, QUERIES } from '@/lib/sanity';

// Generic hook for fetching Sanity data using React Query
export function useSanityData<T>(
  queryKey: string[], 
  query: string, 
  params?: Record<string, string | number | boolean>
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const result = await sanityClient.fetch<T>(query, params || {});
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

// Specific hooks for different content types
export function useSanityProducts() {
  return useSanityData<SanityProduct[]>(['sanity', 'products'], QUERIES.ALL_PRODUCTS);
}

export function useSanityFeaturedProducts() {
  return useSanityData<SanityProduct[]>(['sanity', 'products', 'featured'], QUERIES.FEATURED_PRODUCTS);
}

export function useSanityProduct(slug: string) {
  return useSanityData<SanityProduct>(['sanity', 'product', slug], QUERIES.PRODUCT_BY_SLUG, { slug });
}

export function useSanityCategories() {
  return useSanityData<SanityCategory[]>(['sanity', 'categories'], QUERIES.ALL_CATEGORIES);
}

export function useSanityCategory(slug: string) {
  return useSanityData<SanityCategory>(['sanity', 'category', slug], QUERIES.CATEGORY_BY_SLUG, { slug });
}

export function useSanityProductsByCategory(categoryId: string) {
  return useSanityData<SanityProduct[]>(['sanity', 'products', 'category', categoryId], QUERIES.PRODUCTS_BY_CATEGORY, { categoryId });
}

export function useSanityPage(slug: string) {
  return useSanityData<SanityPage>(['sanity', 'page', slug], QUERIES.PAGE_BY_SLUG, { slug });
}

// Helper function to check if Sanity is configured
export function isSanityConfigured(): boolean {
  return !!(
    import.meta.env.VITE_SANITY_PROJECT_ID && 
    import.meta.env.VITE_SANITY_DATASET
  );
}