import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loading component for blog posts in grid view
 */
export function BlogPostSkeleton() {
  return (
    <Card className="overflow-hidden" data-testid="blog-post-skeleton">
      {/* Featured Image Skeleton */}
      <Skeleton className="aspect-[16/10] w-full" />
      
      <CardHeader className="pb-4">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-4/5 mb-2" />
        <Skeleton className="h-4 w-3/5" />
        
        {/* Meta Info Skeleton */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardContent>

      {/* Footer Button Skeleton */}
      <div className="p-6 pt-4 border-t border-gray-100">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

/**
 * Skeleton loading component for blog post grid
 */
export function BlogPostGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6" data-testid="blog-grid-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <BlogPostSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton loading component for sidebar
 */
export function SidebarSkeleton() {
  return (
    <aside className="space-y-8 mt-72" dir="rtl" data-testid="sidebar-skeleton">
      {/* Popular Blogs Skeleton */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-5 w-24" />
        </div>
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
      </div>

      {/* Featured Products Skeleton */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-5 w-28" />
        </div>
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
      </div>

      {/* Hot Tags Skeleton */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </aside>
  );
}

/**
 * Skeleton loading component for blog post page
 */
export function BlogPostPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl" data-testid="blog-post-page-skeleton">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Title and Meta Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-4/5 mb-4" />
            <Skeleton className="h-6 w-3/5 mb-6" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Featured Image Skeleton */}
          <Skeleton className="aspect-video w-full mb-8" />

          {/* Content Skeleton */}
          <div className="space-y-4 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>

          {/* Tags Skeleton */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-16 rounded-full" />
            ))}
          </div>

          {/* Related Posts Skeleton */}
          <div className="mt-12">
            <Skeleton className="h-7 w-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Skeleton className="aspect-video w-full mb-3" />
                  <Skeleton className="h-5 w-4/5 mb-2" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loading component for category filter
 */
export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-6" dir="rtl" data-testid="category-filter-skeleton">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  );
}

/**
 * Skeleton loading component for search bar
 */
export function SearchBarSkeleton() {
  return (
    <div className="flex gap-3 mb-6" dir="rtl" data-testid="search-bar-skeleton">
      <Skeleton className="flex-1 h-10" />
    </div>
  );
}

/**
 * Skeleton loading component for modern blog post (compact version)
 */
export function ModernBlogPostSkeleton() {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm" data-testid="modern-blog-post-skeleton">
      {/* Featured Image Skeleton */}
      <Skeleton className="aspect-video w-full" />
      
      <div className="p-5">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-4/5 mb-3" />
        
        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Author and Meta Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}