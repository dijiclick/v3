import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Star, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { SidebarSkeleton } from "@/components/ui/blog-skeleton";
import { BlogErrorBoundaryWrapper } from "@/components/ui/error-boundary";
import { BlogErrorHandler, fallbackData } from "@/lib/error-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PopularBlog {
  title: string;
  id: string;
  slug?: string;
}

interface FeaturedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  slug: string;
}

interface SectionState {
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

interface ModernSidebarProps {
  popularBlogs: PopularBlog[];
  featuredProducts: FeaturedProduct[];
  hotTags: string[];
  onTagClick?: (tag: string) => void;
  // New props for error handling
  popularBlogsState?: SectionState;
  featuredProductsState?: SectionState;
  hotTagsState?: SectionState;
  isLoading?: boolean;
}

// Component for individual section error display
function SectionError({ 
  error, 
  onRetry, 
  sectionName 
}: { 
  error: Error; 
  onRetry?: () => void; 
  sectionName: string; 
}) {
  return (
    <Alert variant="destructive" data-testid={`sidebar-error-${sectionName}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="font-vazir">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            {BlogErrorHandler.getErrorMessage(error, 'general')}
          </span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="font-vazir text-xs"
              data-testid={`sidebar-retry-${sectionName}`}
            >
              <RefreshCw className="w-3 h-3 ml-1" />
              تلاش مجدد
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Component for individual section skeleton
function SectionSkeleton({ 
  type 
}: { 
  type: 'popular' | 'products' | 'tags' 
}) {
  switch (type) {
    case 'popular':
      return (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="flex-shrink-0 w-5 h-5 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    
    case 'products':
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 mr-13" />
            </div>
          ))}
        </div>
      );
    
    case 'tags':
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      );
  }
}

export function ModernSidebar({ 
  popularBlogs, 
  featuredProducts, 
  hotTags, 
  onTagClick,
  popularBlogsState,
  featuredProductsState,
  hotTagsState,
  isLoading = false
}: ModernSidebarProps) {
  // If the entire sidebar is loading, show skeleton
  if (isLoading) {
    return <SidebarSkeleton />;
  }

  // Get fallback data for each section
  const getPopularBlogs = () => {
    if (popularBlogsState?.error) {
      return fallbackData.popularPosts;
    }
    return popularBlogs.length > 0 ? popularBlogs : fallbackData.popularPosts;
  };

  const getFeaturedProducts = () => {
    if (featuredProductsState?.error) {
      return fallbackData.featuredProducts;
    }
    return featuredProducts.length > 0 ? featuredProducts : fallbackData.featuredProducts;
  };

  const getHotTags = () => {
    if (hotTagsState?.error) {
      return fallbackData.hotTags;
    }
    return hotTags.length > 0 ? hotTags : fallbackData.hotTags;
  };

  return (
    <BlogErrorBoundaryWrapper context="ModernSidebar">
      <aside className="space-y-8 mt-72" dir="rtl" data-testid="modern-sidebar">
        {/* Popular Blogs Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="popular-blogs">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h3 className="text-gray-900 font-vazir">مطالب محبوب</h3>
          </div>
          
          {popularBlogsState?.loading ? (
            <SectionSkeleton type="popular" />
          ) : popularBlogsState?.error ? (
            <SectionError 
              error={popularBlogsState.error} 
              onRetry={popularBlogsState.onRetry}
              sectionName="popular-blogs"
            />
          ) : (
            <div className="space-y-3">
              {getPopularBlogs().slice(0, 6).map((blog, index) => (
                <Link
                  key={blog.id}
                  href={blog.slug ? `/blog/${blog.slug}` : "#"}
                  className="group flex items-start gap-3 text-sm text-gray-600 hover:text-gray-900 leading-relaxed transition-colors duration-200"
                  data-testid={`popular-blog-${blog.id}`}
                >
                  <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 text-xs rounded-full flex items-center justify-center mt-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors duration-200 font-vazir">
                    {(index + 1).toLocaleString('fa-IR')}
                  </span>
                  <span className="line-clamp-2 font-vazir">{blog.title}</span>
                </Link>
              ))}
            </div>
          )}
          
          {/* Show fallback indicator if using fallback data */}
          {popularBlogsState?.error && (
            <div className="mt-2 text-xs text-gray-500 font-vazir" data-testid="popular-blogs-fallback">
              • نمایش محتوای پیش‌فرض
            </div>
          )}
        </div>

        {/* Featured Products Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="featured-products">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-red-500" />
            <h3 className="text-gray-900 font-vazir">محصولات ویژه</h3>
          </div>
          
          {featuredProductsState?.loading ? (
            <SectionSkeleton type="products" />
          ) : featuredProductsState?.error ? (
            <SectionError 
              error={featuredProductsState.error} 
              onRetry={featuredProductsState.onRetry}
              sectionName="featured-products"
            />
          ) : (
            <div className="space-y-4">
              {getFeaturedProducts().slice(0, 5).map((product) => (
                <div key={product.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-vazir line-clamp-1">
                          {product.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 font-vazir font-medium">
                            {product.price.toLocaleString('fa-IR')} تومان
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through font-vazir">
                              {product.originalPrice.toLocaleString('fa-IR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <Button 
                      variant="link" 
                      className="text-red-500 hover:text-red-600 text-xs p-0 h-auto mr-13 font-vazir"
                      data-testid={`featured-product-link-${product.id}`}
                    >
                      مشاهده محصول ←
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          
          {/* Show fallback indicator if using fallback data */}
          {featuredProductsState?.error && (
            <div className="mt-2 text-xs text-gray-500 font-vazir" data-testid="featured-products-fallback">
              • نمایش محتوای پیش‌فرض
            </div>
          )}
        </div>

        {/* Hot Tags Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="hot-tags">
          <h3 className="mb-4 text-gray-900 font-vazir">برچسب‌های داغ</h3>
          
          {hotTagsState?.loading ? (
            <SectionSkeleton type="tags" />
          ) : hotTagsState?.error ? (
            <SectionError 
              error={hotTagsState.error} 
              onRetry={hotTagsState.onRetry}
              sectionName="hot-tags"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {getHotTags().map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-all duration-200 hover:scale-105 font-vazir"
                  onClick={() => onTagClick?.(tag)}
                  data-testid={`hot-tag-${tag}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Show fallback indicator if using fallback data */}
          {hotTagsState?.error && (
            <div className="mt-2 text-xs text-gray-500 font-vazir" data-testid="hot-tags-fallback">
              • نمایش برچسب‌های پیش‌فرض
            </div>
          )}
        </div>
      </aside>
    </BlogErrorBoundaryWrapper>
  );
}