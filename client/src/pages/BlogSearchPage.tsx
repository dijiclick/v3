import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, Home, TrendingUp, Clock, Filter, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { AdvancedBlogSearch } from "@/components/blog/AdvancedBlogSearch";
import type { SearchFilters } from "@/components/blog/search/SearchFilters";

export default function BlogSearchPage() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [sessionId] = useState(() => 
    typeof window !== 'undefined' ? Math.random().toString(36).substring(7) : 'default'
  );

  // Parse URL parameters to restore search state
  const urlParams = useMemo(() => {
    const params = new URLSearchParams(searchString);
    
    return {
      q: params.get('q') || '',
      scope: (params.get('scope') as any) || 'all',
      categories: params.get('categories')?.split(',').filter(Boolean) || [],
      authors: params.get('authors')?.split(',').filter(Boolean) || [],
      tags: params.get('tags')?.split(',').filter(Boolean) || [],
      startDate: params.get('startDate') ? new Date(params.get('startDate')!) : undefined,
      endDate: params.get('endDate') ? new Date(params.get('endDate')!) : undefined,
      minReadingTime: params.get('minReadingTime') ? parseInt(params.get('minReadingTime')!) : undefined,
      maxReadingTime: params.get('maxReadingTime') ? parseInt(params.get('maxReadingTime')!) : undefined,
      featured: params.get('featured') === 'true' ? true : undefined,
      sortBy: (params.get('sortBy') as any) || 'relevance',
      sortOrder: (params.get('sortOrder') as any) || 'desc'
    };
  }, [searchString]);

  // Get popular searches for the landing state
  const { data: popularSearches = [] } = useQuery({
    queryKey: ['/api/blog/search/popular'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get recent blog posts as suggested content
  const { data: recentPosts = [] } = useQuery({
    queryKey: ['/api/blog/posts', { limit: 6, status: 'published' }],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert URL params to search filters
  const initialFilters: SearchFilters = useMemo(() => ({
    scope: urlParams.scope,
    categoryIds: urlParams.categories,
    authorIds: urlParams.authors,
    tags: urlParams.tags,
    dateRange: {
      start: urlParams.startDate,
      end: urlParams.endDate
    },
    readingTimeRange: {
      min: urlParams.minReadingTime,
      max: urlParams.maxReadingTime
    },
    featured: urlParams.featured,
    sortBy: urlParams.sortBy,
    sortOrder: urlParams.sortOrder
  }), [urlParams]);

  // Update URL when search state changes
  const updateURL = (query: string, filters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (query.trim()) params.set('q', query.trim());
    if (filters.scope !== 'all') params.set('scope', filters.scope);
    if (filters.categoryIds.length > 0) params.set('categories', filters.categoryIds.join(','));
    if (filters.authorIds.length > 0) params.set('authors', filters.authorIds.join(','));
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.dateRange.start) params.set('startDate', filters.dateRange.start.toISOString());
    if (filters.dateRange.end) params.set('endDate', filters.dateRange.end.toISOString());
    if (filters.readingTimeRange.min) params.set('minReadingTime', filters.readingTimeRange.min.toString());
    if (filters.readingTimeRange.max) params.set('maxReadingTime', filters.readingTimeRange.max.toString());
    if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
    if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);

    const newURL = `/blog/search${params.toString() ? `?${params.toString()}` : ''}`;
    
    // Update URL without triggering a navigation
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', newURL);
    }
  };

  // Custom search handler that updates URL
  const handleSearchWithURL = (query: string, filters: SearchFilters) => {
    updateURL(query, filters);
  };

  // Generate SEO-friendly meta data
  const seoTitle = urlParams.q 
    ? `جستجو برای "${urlParams.q}" | وبلاگ`
    : 'جستجوی پیشرفته مقالات | وبلاگ';
    
  const seoDescription = urlParams.q
    ? `نتایج جستجو برای "${urlParams.q}" در وبلاگ. مقالات مرتبط، آموزش‌ها و مطالب کاربردی.`
    : 'جستجوی پیشرفته در مقالات وبلاگ. فیلتر بر اساس دسته‌بندی، نویسنده، تاریخ و موضوع.';

  const hasActiveSearch = urlParams.q.trim().length > 0 || 
    Object.values(initialFilters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined);
      }
      return value !== undefined && value !== 'all' && value !== 'relevance' && value !== 'desc';
    });

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://example.com/blog/search${searchString ? `?${searchString}` : ''}`} />
        
        {/* Search-specific structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "url": `https://example.com/blog/search${searchString ? `?${searchString}` : ''}`,
            "name": seoTitle,
            "description": seoDescription,
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://example.com/blog/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://example.com/blog/search${searchString ? `?${searchString}` : ''}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center">
                  <Home className="ml-1 h-4 w-4" />
                  خانه
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/blog">وبلاگ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>جستجوی پیشرفته</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
            <Search className="ml-3 h-8 w-8" />
            {urlParams.q ? `نتایج جستجو برای "${urlParams.q}"` : 'جستجوی پیشرفته مقالات'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {urlParams.q 
              ? 'مقالات مرتبط با جستجوی شما در زیر نمایش داده شده‌اند'
              : 'از جستجوی قدرتمند ما برای یافتن مقالات مورد نظرتان استفاده کنید'
            }
          </p>
        </div>

        {/* Advanced Search Component */}
        <AdvancedBlogSearch
          initialQuery={urlParams.q}
          initialFilters={initialFilters}
          sessionId={sessionId}
          onResultClick={(postId) => {
            // Handle result click analytics
            console.log('Post clicked:', postId);
          }}
          showSuggestions={true}
          showSavedSearches={true}
          showFilters={true}
          maxResults={100}
        />

        {/* Landing State Content - Popular Searches and Recent Posts */}
        {!hasActiveSearch && (
          <div className="mt-12 space-y-8">
            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="ml-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">جستجوهای محبوب</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.slice(0, 12).map((search: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/blog/search?q=${encodeURIComponent(search.query)}`)}
                      className="h-8"
                      data-testid={`popular-search-${index}`}
                    >
                      {search.query}
                      <Badge variant="secondary" className="mr-2 text-xs">
                        {search.frequency}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="ml-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">جدیدترین مقالات</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentPosts.slice(0, 6).map((post: any) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                        <div className="space-y-2">
                          <h3 className="font-medium line-clamp-2">{post.title}</h3>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {post.author && <span>{post.author.name}</span>}
                            {post.readingTime && (
                              <span className="flex items-center">
                                <Clock className="ml-1 h-3 w-3" />
                                {post.readingTime} دقیقه
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Search Tips */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Filter className="ml-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">راهنمای جستجو</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-medium mb-2">نکات جستجو:</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• از کلمات کلیدی ساده استفاده کنید</li>
                    <li>• جستجو در عنوان، محتوا و برچسب‌ها</li>
                    <li>• پشتیبانی از فارسی و انگلیسی</li>
                    <li>• جستجوی شما ذخیره خواهد شد</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">فیلترهای پیشرفته:</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• فیلتر بر اساس دسته‌بندی و نویسنده</li>
                    <li>• تاریخ انتشار و زمان مطالعه</li>
                    <li>• مقالات ویژه و محبوب</li>
                    <li>• مرتب‌سازی بر اساس مرتبط‌ترین</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              بازگشت به وبلاگ
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}