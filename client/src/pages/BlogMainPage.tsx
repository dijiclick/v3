import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { 
  Star,
  Calendar,
  Clock,
  Filter,
  Grid,
  List,
  Rss,
  RefreshCw
} from "lucide-react";
import { BlogPost, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

// Import new modern components
import { Newsletter } from "@/components/blog/Newsletter";
import { ModernPagination } from "@/components/blog/ModernPagination";
import { ModernSearchBar } from "@/components/blog/ModernSearchBar";
import { ModernSidebar } from "@/components/blog/ModernSidebar";
import { ModernBlogPost } from "@/components/blog/ModernBlogPost";
import { ModernCategoryFilter } from "@/components/blog/ModernCategoryFilter";
import { ModernEmptyState } from "@/components/blog/ModernEmptyState";

const POSTS_PER_PAGE = 8; // 2x4 grid = 8 posts per page

export default function BlogMainPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  // Fetch blog categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['/api/blog/categories'],
    queryFn: async () => {
      const response = await fetch('/api/blog/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch blog posts with pagination and filtering
  const { 
    data: postsResponse, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useQuery({
    queryKey: ['/api/blog/posts', {
      page: currentPage,
      limit: POSTS_PER_PAGE,
      search: debouncedSearchQuery || undefined,
      category: selectedCategory || undefined,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: ((currentPage - 1) * POSTS_PER_PAGE).toString(),
        limit: POSTS_PER_PAGE.toString(),
        status: 'published',
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });
      
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/blog/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    },
  });

  // Fetch featured blog posts for hero section
  const { 
    data: featuredPosts, 
    isLoading: isLoadingFeatured 
  } = useQuery({
    queryKey: ['/api/blog/posts/featured', 3],
    queryFn: async () => {
      const response = await fetch('/api/blog/posts/featured?limit=3');
      if (!response.ok) throw new Error('Failed to fetch featured posts');
      return response.json();
    },
  });

  // Fetch popular posts for sidebar
  const { 
    data: popularPosts, 
    isLoading: isLoadingPopular 
  } = useQuery({
    queryKey: ['/api/blog/posts/popular', 6],
    queryFn: async () => {
      const response = await fetch('/api/blog/posts/popular?limit=6');
      if (!response.ok) {
        // Fallback to regular posts if popular endpoint doesn't exist
        const fallbackResponse = await fetch('/api/blog/posts?limit=6&sortBy=viewCount&sortOrder=desc');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return fallbackData.posts || [];
        }
        return [];
      }
      return response.json();
    },
  });

  // Fetch hot tags for sidebar
  const { 
    data: hotTags, 
    isLoading: isLoadingTags 
  } = useQuery({
    queryKey: ['/api/blog/tags/popular', 8],
    queryFn: async () => {
      const response = await fetch('/api/blog/tags/popular?limit=8');
      if (!response.ok) {
        // Fallback with some default Persian tags
        return ["بازی", "تکنولوژی", "آموزش", "راهنما", "اخبار", "بررسی"];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.tags || [];
    },
  });

  const posts = postsResponse?.posts || [];
  const totalPosts = postsResponse?.total || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return '';
    return minutes === 1 ? '۱ دقیقه' : `${minutes.toLocaleString('fa-IR')} دقیقه`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  // Generate page metadata
  const getPageTitle = () => {
    if (searchQuery) {
      return `نتایج جستجو "${searchQuery}" - وبلاگ گیم گو`;
    }
    if (selectedCategory) {
      const category = categories?.find((cat: any) => cat.slug === selectedCategory);
      return `${category?.name || selectedCategory} - وبلاگ گیم گو`;
    }
    return "وبلاگ گیم گو - آخرین مقالات و راهنمایی‌های بازی";
  };

  const getPageDescription = () => {
    if (searchQuery) {
      return `نتایج جستجوی "${searchQuery}" در وبلاگ گیم گو - یافتن مقالات مرتبط و کاربردی`;
    }
    if (selectedCategory) {
      const category = categories?.find((cat: any) => cat.slug === selectedCategory);
      return `مطالب دسته‌بندی ${category?.name || selectedCategory} در وبلاگ گیم گو`;
    }
    return "وبلاگ گیم گو - مقالات آموزشی، راهنمایی‌های بازی، اخبار و نکات کاربردی. منبع کاملی از اطلاعات روزآمد برای گیمرها.";
  };

  // Prepare sidebar data
  const sidebarData = {
    popularBlogs: (popularPosts || []).map((post: BlogPost) => ({
      id: post.id,
      title: post.title,
      slug: post.slug
    })),
    subscriptionServices: [
      { name: "Netflix", color: "bg-red-500" },
      { name: "Disney Plus", color: "bg-blue-600" },
      { name: "HBO Max", color: "bg-purple-600" },
      { name: "Amazon Prime", color: "bg-yellow-500", textColor: "text-black" },
      { name: "Apple TV+", color: "bg-gray-800" }
    ],
    hotTags: hotTags || []
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="وبلاگ گیم گو" href="/rss.xml" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "وبلاگ گیم گو",
            "description": getPageDescription(),
            "url": `${window.location.origin}/blog`,
            "publisher": {
              "@type": "Organization",
              "name": "گیم گو",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-red-500 to-red-600 text-white py-16" data-testid="blog-hero">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-vazir" data-testid="blog-hero-title">
                وبلاگ
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto font-vazir" data-testid="blog-hero-description">
                آخرین مقالات، راهنمایی‌ها و اخبار دنیای بازی‌های دیجیتال
              </p>
            </div>

            {/* Featured Posts Carousel */}
            {featuredPosts && featuredPosts.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredPosts.slice(0, 3).map((post: BlogPost) => (
                    <Link href={`/blog/${post.slug}`} key={post.id}>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Blog Posts */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <ModernSearchBar
                  placeholder="جستجو در مقالات..."
                  value={searchQuery}
                  onSearch={handleSearch}
                />
              </div>

              {/* Category Filter */}
              {categories && categories.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <ModernCategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search/Filter Results Info */}
                <div className="flex items-center gap-2">
                  {(searchQuery || selectedCategory) && (
                    <p className="text-gray-600 font-vazir" data-testid="search-results-count">
                      {isLoadingPosts ? 
                        'در حال جستجو...' : 
                        `${totalPosts.toLocaleString('fa-IR')} نتیجه${searchQuery ? ` برای "${searchQuery}"` : ''}`
                      }
                    </p>
                  )}
                  {(searchQuery || selectedCategory) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetFilters}
                      className="font-vazir"
                      data-testid="reset-filters"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      پاک کردن فیلترها
                    </Button>
                  )}
                </div>
                
                {/* View Mode Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-red-500 hover:bg-red-600' : ''}
                    data-testid="view-mode-grid"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-red-500 hover:bg-red-600' : ''}
                    data-testid="view-mode-list"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="rss-button" className="font-vazir">
                    <Rss className="w-4 h-4 ml-2" />
                    RSS
                  </Button>
                </div>
              </div>

              {/* Posts Grid/List */}
              {postsError ? (
                <Alert variant="destructive" data-testid="posts-error">
                  <AlertDescription className="font-vazir">
                    خطا در بارگذاری مقالات. لطفاً صفحه را تازه‌سازی کنید.
                  </AlertDescription>
                </Alert>
              ) : isLoadingPosts ? (
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                    : "space-y-4"
                )}>
                  {Array(8).fill(0).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="aspect-video bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8" 
                      : "space-y-8"
                  )} data-testid="blog-posts-container">
                    {posts.map((post: BlogPost) => (
                      <ModernBlogPost key={post.id} post={post} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <ModernPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalPosts={totalPosts}
                    postsPerPage={POSTS_PER_PAGE}
                  />
                </>
              ) : (
                <ModernEmptyState
                  type={searchQuery ? "search" : selectedCategory ? "category" : "general"}
                  query={searchQuery}
                  onReset={resetFilters}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ModernSidebar
                popularBlogs={sidebarData.popularBlogs}
                subscriptionServices={sidebarData.subscriptionServices}
                hotTags={sidebarData.hotTags}
                onTagClick={handleTagClick}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}