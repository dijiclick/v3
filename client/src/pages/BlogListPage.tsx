import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { Helmet } from "react-helmet-async";
import { AlertCircle, Loader2, Rss, TrendingUp, BookOpen } from "lucide-react";
import { 
  useBlogPosts, 
  useFeaturedBlogPosts, 
  useBlogCategories, 
  useBlogTags, 
  useBlogAuthors,
  useBlogCategoryBySlug,
  useBlogTagBySlug
} from "@/lib/content-service";
import { BlogFilters, BlogPaginationInfo } from "@/types";
import BlogCard from "@/components/blog/BlogCard";
import BlogFiltersComponent from "@/components/blog/BlogFilters";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogPagination from "@/components/blog/BlogPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const POSTS_PER_PAGE = 12;
const FEATURED_POSTS_LIMIT = 3;

export default function BlogListPage() {
  const [location] = useLocation();
  const [, params] = useRoute("/blog/category/:categorySlug");
  const [, tagParams] = useRoute("/blog/tag/:tagSlug");
  const [, authorParams] = useRoute("/blog/author/:authorId");

  // Extract URL parameters
  const categorySlug = params?.categorySlug;
  const tagSlug = tagParams?.tagSlug;
  const authorId = authorParams?.authorId;

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BlogFilters>({
    search: "",
    categories: categorySlug ? [] : [], // Will be populated when category data loads
    tags: tagSlug ? [] : [], // Will be populated when tag data loads
    authors: authorId ? [authorId] : [],
    dateRange: {
      start: null,
      end: null
    },
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });

  // Fetch metadata for filtered views
  const { data: categoryData } = useBlogCategoryBySlug(categorySlug || "");
  const { data: tagData } = useBlogTagBySlug(tagSlug || "");

  // Update filters when URL params change
  useEffect(() => {
    if (categorySlug && categoryData) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryData.id]
      }));
    }
  }, [categorySlug, categoryData]);

  useEffect(() => {
    if (tagSlug && tagData) {
      setFilters(prev => ({
        ...prev,
        tags: [tagData.slug]
      }));
    }
  }, [tagSlug, tagData]);

  // Calculate blog posts query options
  const postsOptions = useMemo(() => ({
    limit: POSTS_PER_PAGE,
    offset: (currentPage - 1) * POSTS_PER_PAGE,
    status: 'published',
    categoryIds: filters.categories.length > 0 ? filters.categories : undefined,
    authorIds: filters.authors.length > 0 ? filters.authors : undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    search: filters.search || undefined,
    startDate: filters.dateRange.start ? filters.dateRange.start.toISOString() : undefined,
    endDate: filters.dateRange.end ? filters.dateRange.end.toISOString() : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  }), [filters, currentPage]);

  // Data fetching
  const { 
    data: postsResponse, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useBlogPosts(postsOptions);

  const { 
    data: featuredPosts, 
    isLoading: isLoadingFeatured 
  } = useFeaturedBlogPosts(FEATURED_POSTS_LIMIT);

  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useBlogCategories();

  const { 
    data: tags = [], 
    isLoading: isLoadingTags 
  } = useBlogTags();

  const { 
    data: authors = [], 
    isLoading: isLoadingAuthors 
  } = useBlogAuthors();

  // Pagination info
  const paginationInfo: BlogPaginationInfo = useMemo(() => {
    const total = postsResponse?.total || 0;
    const totalPages = Math.ceil(total / POSTS_PER_PAGE);
    
    return {
      page: currentPage,
      limit: POSTS_PER_PAGE,
      total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }, [postsResponse?.total, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: BlogFilters) => {
    setFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page metadata
  const getPageTitle = () => {
    if (categorySlug && categoryData) {
      return `${categoryData.seoTitle || categoryData.name} - وبلاگ لیمیت پس`;
    }
    if (tagSlug && tagData) {
      return `برچسب ${tagData.name} - وبلاگ لیمیت پس`;
    }
    if (filters.search) {
      return `نتایج جستجو "${filters.search}" - وبلاگ لیمیت پس`;
    }
    return "وبلاگ لیمیت پس - آخرین مقالات و اخبار";
  };

  const getPageDescription = () => {
    if (categorySlug && categoryData) {
      return categoryData.seoDescription || categoryData.description || `مقالات دسته‌بندی ${categoryData.name} در وبلاگ لیمیت پس`;
    }
    if (tagSlug && tagData) {
      return `مقالات برچسب ${tagData.name} در وبلاگ لیمیت پس - ${tagData.description || 'مطالب مرتبط و کاربردی'}`;
    }
    if (filters.search) {
      return `نتایج جستجوی "${filters.search}" در وبلاگ لیمیت پس - یافتن مقالات مرتبط`;
    }
    return "وبلاگ لیمیت پس - مقالات آموزشی، راهنمایی‌ها و آخرین اخبار. منبع کاملی از اطلاعات کاربردی و روزآمد.";
  };

  const getCanonicalUrl = () => {
    const baseUrl = window.location.origin;
    if (categorySlug) {
      return `${baseUrl}/blog/category/${categorySlug}`;
    }
    if (tagSlug) {
      return `${baseUrl}/blog/tag/${tagSlug}`;
    }
    return `${baseUrl}/blog`;
  };

  // Loading states
  const isLoading = isLoadingPosts || isLoadingFeatured;
  const isLoadingFilters = isLoadingCategories || isLoadingTags || isLoadingAuthors;

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <link rel="canonical" href={getCanonicalUrl()} />
        
        {/* Open Graph */}
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl()} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        
        {/* Pagination SEO */}
        {paginationInfo.hasPrev && (
          <link rel="prev" href={`${getCanonicalUrl()}?page=${currentPage - 1}`} />
        )}
        {paginationInfo.hasNext && (
          <link rel="next" href={`${getCanonicalUrl()}?page=${currentPage + 1}`} />
        )}

        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="وبلاگ لیمیت پس" href="/rss.xml" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "وبلاگ لیمیت پس",
            "description": getPageDescription(),
            "url": getCanonicalUrl(),
            "publisher": {
              "@type": "Organization",
              "name": "لیمیت پس",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-foreground mb-2">
                  {categorySlug && categoryData ? (
                    <>دسته‌بندی: {categoryData.name}</>
                  ) : tagSlug && tagData ? (
                    <>برچسب: {tagData.name}</>
                  ) : filters.search ? (
                    <>نتایج جستجو: "{filters.search}"</>
                  ) : (
                    <>وبلاگ لیمیت پس</>
                  )}
                </h1>
                <p className="text-gray-600 dark:text-muted-foreground">
                  {categorySlug && categoryData ? (
                    categoryData.description || `مقالات مرتبط با ${categoryData.name}`
                  ) : tagSlug && tagData ? (
                    tagData.description || `مقالات برچسب ${tagData.name}`
                  ) : filters.search ? (
                    `${paginationInfo.total.toLocaleString('fa-IR')} نتیجه یافت شد`
                  ) : (
                    "آخرین مقالات، راهنمایی‌ها و اخبار"
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" data-testid="rss-button">
                  <Rss className="w-4 h-4 ml-2" />
                  RSS
                </Button>
                {paginationInfo.total > 0 && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {paginationInfo.total.toLocaleString('fa-IR')} مقاله
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Featured Posts Section */}
          {!categorySlug && !tagSlug && !filters.search && featuredPosts && featuredPosts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                  مقالات ویژه
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingFeatured ? (
                  Array(3).fill(0).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardHeader className="space-y-0 pb-4">
                        <Skeleton className="h-48 w-full rounded" />
                        <Skeleton className="h-6 w-3/4 mt-4" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  featuredPosts.map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      showExcerpt={true}
                      className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                    />
                  ))
                )}
              </div>
              
              <Separator className="my-8" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <BlogFiltersComponent
                  categories={categories}
                  tags={tags}
                  authors={authors}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  isLoading={isLoadingFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Search */}
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">
                  جستجو و فهرست مقالات
                </h2>
              </div>
              
              <BlogSearch
                value={filters.search}
                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                onSearch={handleSearch}
                placeholder="جستجو در عنوان، محتوا و برچسب‌ها..."
                isLoading={isLoadingPosts}
              />

              {/* Posts Grid */}
              {postsError ? (
                <Alert variant="destructive" data-testid="posts-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    خطا در بارگذاری مقالات. لطفاً صفحه را تازه‌سازی کنید.
                  </AlertDescription>
                </Alert>
              ) : isLoadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardHeader className="space-y-0 pb-4">
                        <Skeleton className="h-48 w-full rounded" />
                        <div className="space-y-2 mt-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : postsResponse?.posts && postsResponse.posts.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {postsResponse.posts.map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        showExcerpt={true}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <BlogPagination
                    pagination={paginationInfo}
                    onPageChange={handlePageChange}
                    showPageInfo={true}
                    maxVisiblePages={5}
                    className="mt-8"
                  />
                </div>
              ) : (
                <Card className="p-12 text-center" data-testid="no-posts">
                  <CardContent className="space-y-4">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-foreground">
                      هیچ مقاله‌ای یافت نشد
                    </h3>
                    <p className="text-gray-500 dark:text-muted-foreground">
                      {filters.search ? (
                        `متأسفانه نتیجه‌ای برای "${filters.search}" یافت نشد. کلمات کلیدی دیگری امتحان کنید.`
                      ) : (
                        "در حال حاضر مقاله‌ای در این دسته‌بندی وجود ندارد."
                      )}
                    </p>
                    {(filters.search || filters.categories.length > 0 || filters.tags.length > 0) && (
                      <Button
                        variant="outline"
                        onClick={() => setFilters({
                          search: "",
                          categories: [],
                          tags: [],
                          authors: [],
                          dateRange: { start: null, end: null },
                          sortBy: 'publishedAt',
                          sortOrder: 'desc'
                        })}
                        data-testid="clear-all-filters"
                      >
                        مشاهده همه مقالات
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}