import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { 
  Search, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Tag, 
  Star,
  Filter,
  Grid,
  List,
  Rss,
  ArrowRight
} from "lucide-react";
import { BlogPost, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PopularContent from "@/components/blog/PopularContent";
import BlogPagination from "@/components/blog/BlogPagination";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 8; // 2x4 grid = 8 posts per page

export default function BlogMainPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Fetch blog posts with pagination
  const { 
    data: postsResponse, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useQuery({
    queryKey: ['/api/blog/posts', {
      page: currentPage,
      limit: POSTS_PER_PAGE,
      search: debouncedSearchQuery || undefined,
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

  // Fetch popular products for sidebar
  const { 
    data: popularProducts, 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['/api/products/featured', 6],
    queryFn: async () => {
      const response = await fetch('/api/products/featured?limit=6');
      if (!response.ok) throw new Error('Failed to fetch popular products');
      return response.json();
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
    return minutes === 1 ? '۱ دقیقه' : `${minutes} دقیقه`;
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page metadata
  const getPageTitle = () => {
    if (searchQuery) {
      return `نتایج جستجو "${searchQuery}" - وبلاگ گیم گو`;
    }
    return "وبلاگ گیم گو - آخرین مقالات و راهنمایی‌های بازی";
  };

  const getPageDescription = () => {
    if (searchQuery) {
      return `نتایج جستجوی "${searchQuery}" در وبلاگ گیم گو - یافتن مقالات مرتبط و کاربردی`;
    }
    return "وبلاگ گیم گو - مقالات آموزشی، راهنمایی‌های بازی، اخبار و نکات کاربردی. منبع کاملی از اطلاعات روزآمد برای گیمرها.";
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

      <div className="min-h-screen bg-gray-50 dark:bg-background" dir="rtl">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="blog-hero-title">
                وبلاگ
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto" data-testid="blog-hero-description">
                آخرین مقالات، راهنمایی‌ها و اخبار دنیای بازی‌های دیجیتال
              </p>
            </div>

            {/* Featured Posts Carousel */}
            {featuredPosts && featuredPosts.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  مقالات ویژه
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredPosts.slice(0, 3).map((post: BlogPost) => (
                    <Link href={`/blog/${post.slug}`} key={post.id}>
                      <Card className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                        {post.featuredImage && (
                          <div className="aspect-[16/10] overflow-hidden rounded-t-lg">
                            <img
                              src={post.featuredImage}
                              alt={post.featuredImageAlt || post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-yellow-300 transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-blue-100 text-sm mt-2 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-blue-200">
                            {post.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.publishedAt)}
                              </span>
                            )}
                            {post.readingTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatReadingTime(post.readingTime)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Blog Posts */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="جستجو در مقالات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                    data-testid="blog-search-input"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    data-testid="view-mode-grid"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    data-testid="view-mode-list"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="rss-button">
                    <Rss className="w-4 h-4 ml-2" />
                    RSS
                  </Button>
                </div>
              </div>

              {/* Search Results Info */}
              {searchQuery && (
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-muted-foreground" data-testid="search-results-count">
                    {isLoadingPosts ? 'در حال جستجو...' : `${totalPosts.toLocaleString('fa-IR')} نتیجه برای "${searchQuery}"`}
                  </p>
                </div>
              )}

              {/* Posts Grid/List */}
              {postsError ? (
                <Alert variant="destructive" data-testid="posts-error">
                  <AlertDescription>
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
                    <Card key={index} className="animate-pulse">
                      <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                      : "space-y-6"
                  )}>
                    {posts.map((post: BlogPost) => (
                      <Card 
                        key={post.id} 
                        className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-card border-0 shadow-md"
                        data-testid={`blog-post-${post.id}`}
                      >
                        {/* Featured Image */}
                        {post.featuredImage && (
                          <div className="relative overflow-hidden aspect-[16/10] rounded-t-lg">
                            <img 
                              src={post.featuredImage} 
                              alt={post.featuredImageAlt || post.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            
                            {/* Category Badge */}
                            {post.category && (
                              <div className="absolute top-3 left-3">
                                <Badge 
                                  variant="outline" 
                                  className="bg-white/90 backdrop-blur-sm border-white/20"
                                  style={{ backgroundColor: post.category.color ? `${post.category.color}20` : undefined }}
                                >
                                  {post.category.name}
                                </Badge>
                              </div>
                            )}

                            {/* Featured Badge */}
                            {post.featured && (
                              <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <Star className="w-3 h-3 ml-1" />
                                  ویژه
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}

                        <CardContent className="p-6">
                          {/* Title */}
                          <Link href={`/blog/${post.slug}`} data-testid={`blog-link-${post.slug}`}>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-tight mb-3">
                              {post.title}
                            </h3>
                          </Link>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-gray-600 dark:text-muted-foreground line-clamp-3 leading-relaxed mb-4" data-testid={`excerpt-${post.id}`}>
                              {post.excerpt}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground mb-4">
                            {/* Author */}
                            {post.author && (
                              <Link href={`/blog/author/${post.author.slug}`} data-testid={`author-link-${post.author.slug}`}>
                                <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                      {getAuthorInitials(post.author.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{post.author.name}</span>
                                </div>
                              </Link>
                            )}

                            {/* Publication Date */}
                            {post.publishedAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={post.publishedAt.toString()}>
                                  {formatDate(post.publishedAt)}
                                </time>
                              </div>
                            )}

                            {/* Reading Time */}
                            {post.readingTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatReadingTime(post.readingTime)}</span>
                              </div>
                            )}

                            {/* View Count */}
                            {post.viewCount && post.viewCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.viewCount.toLocaleString('fa-IR')}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <Link key={index} href={`/blog/tag/${tag}`} data-testid={`tag-link-${tag}`}>
                                  <Badge variant="secondary" className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <Tag className="w-3 h-3 ml-1" />
                                    {tag}
                                  </Badge>
                                </Link>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3} بیشتر
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Read More Button */}
                          <Link href={`/blog/${post.slug}`} data-testid={`read-more-${post.slug}`}>
                            <Button 
                              variant="outline" 
                              className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950 transition-colors"
                            >
                              مطالعه بیشتر
                              <ArrowRight className="w-4 h-4 mr-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <BlogPagination
                        pagination={{
                          page: currentPage,
                          limit: POSTS_PER_PAGE,
                          total: totalPosts,
                          totalPages,
                          hasNext: currentPage < totalPages,
                          hasPrev: currentPage > 1
                        }}
                        onPageChange={handlePageChange}
                        showPageInfo={true}
                        maxVisiblePages={5}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <CardContent className="space-y-4">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-foreground">
                      {searchQuery ? 'نتیجه‌ای یافت نشد' : 'مقاله‌ای موجود نیست'}
                    </h3>
                    <p className="text-gray-500 dark:text-muted-foreground">
                      {searchQuery 
                        ? `متأسفانه نتیجه‌ای برای "${searchQuery}" یافت نشد. کلمات کلیدی دیگری امتحان کنید.`
                        : 'در حال حاضر مقاله‌ای منتشر نشده است.'
                      }
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery('')}
                        data-testid="clear-search"
                      >
                        مشاهده همه مقالات
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Popular Subscriptions/Products */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>اشتراک‌های محبوب</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {isLoadingProducts ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : popularProducts && popularProducts.length > 0 ? (
                    <div className="space-y-3">
                      {popularProducts.slice(0, 5).map((product: Product) => (
                        <Link href={`/${product.slug}`} key={product.id}>
                          <div className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                            {product.image && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                                {product.title}
                              </h3>
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                {product.price} تومان
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">محصولی یافت نشد.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Popular Blog Posts */}
              <PopularContent
                showPopularPosts={true}
                showPopularAuthors={false}
                showHotTags={true}
                maxItems={{
                  posts: 5,
                  tags: 8
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}