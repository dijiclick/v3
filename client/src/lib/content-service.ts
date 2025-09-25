import { Product, Category, BlogPost, BlogAuthor, BlogCategory, BlogTag, BlogPostsResponse, BlogFilters } from '@/types';
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
      const response = await fetch(`/api/categories/slug/${slug}`);
      if (response.status === 404) {
        return null; // Category not found - this will be handled as empty data
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(slug),
  });
}

// Hook to get products filtered by category
export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['/api/categories', categoryId, 'products'],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await fetch(`/api/categories/${categoryId}/products`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // Category not found, return empty array
        }
        throw new Error(`Failed to fetch products for category: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(categoryId),
  });
}

// Blog hooks - database API based for now (can be extended with Sanity support later)
export function useBlogPosts(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  featured?: boolean;
  categoryId?: string; // kept for backward compatibility
  categoryIds?: string[];
  authorId?: string; // kept for backward compatibility  
  authorIds?: string[];
  tags?: string[];
  search?: string;
  startDate?: string; // ISO string from frontend
  endDate?: string; // ISO string from frontend
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const queryParams = new URLSearchParams();
  
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.offset) queryParams.append('offset', options.offset.toString());
  if (options?.status) queryParams.append('status', options.status);
  if (options?.featured !== undefined) queryParams.append('featured', options.featured.toString());
  
  // Handle new array parameters while maintaining backward compatibility
  if (options?.categoryIds && options.categoryIds.length > 0) {
    queryParams.append('categoryIds', options.categoryIds.join(','));
  } else if (options?.categoryId) {
    queryParams.append('categoryId', options.categoryId);
  }
  
  if (options?.authorIds && options.authorIds.length > 0) {
    queryParams.append('authorIds', options.authorIds.join(','));
  } else if (options?.authorId) {
    queryParams.append('authorId', options.authorId);
  }
  
  if (options?.tags && options.tags.length > 0) queryParams.append('tags', options.tags.join(','));
  if (options?.search) queryParams.append('search', options.search);
  if (options?.startDate) queryParams.append('startDate', options.startDate);
  if (options?.endDate) queryParams.append('endDate', options.endDate);
  if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
  if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);

  const queryString = queryParams.toString();
  const url = `/api/blog/posts${queryString ? '?' + queryString : ''}`;

  return useQuery<BlogPostsResponse>({
    queryKey: ['/api/blog/posts', options],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useFeaturedBlogPosts(limit = 3) {
  return useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts/featured', limit],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/featured?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch featured blog posts: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useBlogPost(id: string) {
  return useQuery<BlogPost>({
    queryKey: ['/api/blog/posts', id],
    queryFn: async () => {
      if (!id) throw new Error('Blog post ID is required');
      const response = await fetch(`/api/blog/posts/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(id),
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery<BlogPost>({
    queryKey: ['/api/blog/posts/slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Blog post slug is required');
      const response = await fetch(`/api/blog/posts/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(slug),
  });
}

export function useBlogPostsByCategory(categoryId: string, options?: { limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.offset) queryParams.append('offset', options.offset.toString());
  const queryString = queryParams.toString();

  return useQuery<BlogPostsResponse>({
    queryKey: ['/api/blog/posts/category', categoryId, options],
    queryFn: async () => {
      if (!categoryId) throw new Error('Category ID is required');
      const response = await fetch(`/api/blog/posts/category/${categoryId}${queryString ? '?' + queryString : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts by category: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(categoryId),
  });
}

export function useBlogPostsByTag(tagSlug: string, options?: { limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.offset) queryParams.append('offset', options.offset.toString());
  const queryString = queryParams.toString();

  return useQuery<BlogPostsResponse>({
    queryKey: ['/api/blog/posts/tag', tagSlug, options],
    queryFn: async () => {
      if (!tagSlug) throw new Error('Tag slug is required');
      const response = await fetch(`/api/blog/posts/tag/${tagSlug}${queryString ? '?' + queryString : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts by tag: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(tagSlug),
  });
}

export function useBlogPostsByAuthor(authorId: string, options?: { limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.offset) queryParams.append('offset', options.offset.toString());
  const queryString = queryParams.toString();

  return useQuery<BlogPostsResponse>({
    queryKey: ['/api/blog/posts/author', authorId, options],
    queryFn: async () => {
      if (!authorId) throw new Error('Author ID is required');
      const response = await fetch(`/api/blog/posts/author/${authorId}${queryString ? '?' + queryString : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts by author: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(authorId),
  });
}

// Blog Authors hooks
export function useBlogAuthors() {
  return useQuery<BlogAuthor[]>({
    queryKey: ['/api/blog/authors'],
    queryFn: async () => {
      const response = await fetch('/api/blog/authors');
      if (!response.ok) {
        throw new Error(`Failed to fetch blog authors: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useBlogAuthor(id: string) {
  return useQuery<BlogAuthor>({
    queryKey: ['/api/blog/authors', id],
    queryFn: async () => {
      if (!id) throw new Error('Author ID is required');
      const response = await fetch(`/api/blog/authors/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog author: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(id),
  });
}

// Blog Categories hooks
export function useBlogCategories() {
  return useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
    queryFn: async () => {
      const response = await fetch('/api/blog/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch blog categories: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useBlogCategory(id: string) {
  return useQuery<BlogCategory>({
    queryKey: ['/api/blog/categories', id],
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required');
      const response = await fetch(`/api/blog/categories/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog category: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(id),
  });
}

export function useBlogCategoryBySlug(slug: string) {
  return useQuery<BlogCategory>({
    queryKey: ['/api/blog/categories/slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Category slug is required');
      const response = await fetch(`/api/blog/categories/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog category: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(slug),
  });
}

// Blog Tags hooks
export function useBlogTags() {
  return useQuery<BlogTag[]>({
    queryKey: ['/api/blog/tags'],
    queryFn: async () => {
      const response = await fetch('/api/blog/tags');
      if (!response.ok) {
        throw new Error(`Failed to fetch blog tags: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useBlogTag(id: string) {
  return useQuery<BlogTag>({
    queryKey: ['/api/blog/tags', id],
    queryFn: async () => {
      if (!id) throw new Error('Tag ID is required');
      const response = await fetch(`/api/blog/tags/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog tag: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(id),
  });
}

export function useBlogTagBySlug(slug: string) {
  return useQuery<BlogTag>({
    queryKey: ['/api/blog/tags/slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Tag slug is required');
      const response = await fetch(`/api/blog/tags/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch blog tag: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(slug),
  });
}

// Related posts hook - get posts from same category or with matching tags
export function useRelatedBlogPosts(post: BlogPost | undefined, limit = 3) {
  return useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts/related', post?.id, limit],
    queryFn: async () => {
      if (!post) return [];
      
      // Try to get posts from same category first
      let relatedPosts: BlogPost[] = [];
      
      if (post.categoryId) {
        const categoryResponse = await fetch(`/api/blog/posts/category/${post.categoryId}?limit=${limit * 2}&status=published`);
        if (categoryResponse.ok) {
          const categoryData: BlogPostsResponse = await categoryResponse.json();
          relatedPosts = categoryData.posts.filter(p => p.id !== post.id);
        }
      }
      
      // If we don't have enough posts, supplement with posts that share tags
      if (relatedPosts.length < limit && post.tags && post.tags.length > 0) {
        const remainingLimit = limit - relatedPosts.length;
        const existingIds = new Set([post.id, ...relatedPosts.map(p => p.id)]);
        
        // Try each tag to find more related posts
        for (const tag of post.tags) {
          if (relatedPosts.length >= limit) break;
          
          const tagResponse = await fetch(`/api/blog/posts/tag/${tag}?limit=${remainingLimit * 2}&status=published`);
          if (tagResponse.ok) {
            const tagData: BlogPostsResponse = await tagResponse.json();
            const newPosts = tagData.posts.filter(p => !existingIds.has(p.id));
            relatedPosts.push(...newPosts.slice(0, remainingLimit));
            newPosts.forEach(p => existingIds.add(p.id));
          }
        }
      }
      
      // Sort by publication date and limit results
      return relatedPosts
        .sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit);
    },
    enabled: !!post,
  });
}

// Hook to get previous/next posts for navigation
export function useBlogPostNavigation(currentPost: BlogPost | undefined) {
  return useQuery<{ previous: BlogPost | null; next: BlogPost | null }>({
    queryKey: ['/api/blog/posts/navigation', currentPost?.id],
    queryFn: async () => {
      if (!currentPost || !currentPost.publishedAt) {
        return { previous: null, next: null };
      }
      
      const currentDate = new Date(currentPost.publishedAt).toISOString();
      
      // Get previous post (older)
      const previousResponse = await fetch(`/api/blog/posts?limit=1&status=published&endDate=${currentDate}&sortBy=publishedAt&sortOrder=desc`);
      let previous: BlogPost | null = null;
      if (previousResponse.ok) {
        const previousData: BlogPostsResponse = await previousResponse.json();
        const filteredPrevious = previousData.posts.filter(p => p.id !== currentPost.id);
        previous = filteredPrevious.length > 0 ? filteredPrevious[0] : null;
      }
      
      // Get next post (newer)
      const nextResponse = await fetch(`/api/blog/posts?limit=1&status=published&startDate=${currentDate}&sortBy=publishedAt&sortOrder=asc`);
      let next: BlogPost | null = null;
      if (nextResponse.ok) {
        const nextData: BlogPostsResponse = await nextResponse.json();
        const filteredNext = nextData.posts.filter(p => p.id !== currentPost.id);
        next = filteredNext.length > 0 ? filteredNext[0] : null;
      }
      
      return { previous, next };
    },
    enabled: !!currentPost,
  });
}

// Export the service instance
export const contentService = new ContentService(ContentService.isSanityConfigured());