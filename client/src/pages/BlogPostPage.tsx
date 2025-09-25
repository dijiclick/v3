import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Eye, 
  Share2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Heart,
  MessageCircle,
  Bookmark,
  ChevronUp,
  Menu
} from "lucide-react";
import { 
  useBlogPostBySlug, 
  useRelatedBlogPosts, 
  useBlogPostNavigation 
} from "@/lib/content-service";
import { BlogPost } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import BlogCard from "@/components/blog/BlogCard";
import TableOfContents from "@/components/blog/TableOfContents";
import PopularContent from "@/components/blog/PopularContent";
import BlogContentRenderer from "@/components/BlogContentRenderer";
import { SEOService } from "@/lib/seo-service";
import { useEffect, useState } from "react";
import EnhancedSocialShare from "@/components/blog/EnhancedSocialShare";
import { ClientContentAnalytics } from "@/lib/content-analytics";
import { cn } from "@/lib/utils";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Fetch blog post data
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || "");
  const { data: relatedPosts } = useRelatedBlogPosts(post || undefined, 3);
  const { data: navigation } = useBlogPostNavigation(post || undefined);

  // Current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track social sharing analytics
  const handleSocialShare = (platform: string, url: string) => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'article', 
        item_id: post?.slug,
        content_title: post?.title
      });
    }
    
    console.log(`Shared article "${post?.title}" on ${platform}: ${url}`);
  };

  // Update SEO when post loads
  useEffect(() => {
    if (post) {
      // Calculate reading time and word count from content using client-side analytics
      const contentText = ClientContentAnalytics.extractTextFromContent(post.content);
      const wordCount = ClientContentAnalytics.countWords(contentText);
      const readingTime = ClientContentAnalytics.calculateReadingTime(wordCount);

      // Generate comprehensive schema markup
      const organizationSchema = SEOService.generateOrganizationSchema();
      
      // Generate website schema
      const websiteSchema = SEOService.generateWebsiteSchema();
      
      // Generate blog post schema
      const blogPostSchema = SEOService.generateBlogPostSchema(
        post,
        post.author,
        post.category,
        relatedPosts
      );
      
      // Generate breadcrumb schema
      const breadcrumbSchema = SEOService.generateBreadcrumbSchema([
        { name: "خانه", url: "https://limitplus.ir" },
        { name: "وبلاگ", url: "https://limitplus.ir/blog" },
        ...(post.category ? [{ 
          name: post.category.name, 
          url: `https://limitplus.ir/blog/category/${post.category.slug}` 
        }] : []),
        { name: post.title, url: currentUrl }
      ]);
      
      // Update page SEO
      SEOService.updatePageSEO({
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || "",
        image: post.ogImage || post.featuredImage,
        url: currentUrl,
        type: "article",
        schemas: [
          organizationSchema,
          websiteSchema,
          blogPostSchema,
          breadcrumbSchema
        ],
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
        modifiedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        author: post.author?.name,
        tags: post.tags,
        category: post.category?.name,
        readingTime
      });
    }
  }, [post, currentUrl]);

  // Helper functions
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return "";
    return minutes === 1 ? "۱ دقیقه" : `${minutes} دقیقه`;
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 text-blue-500 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              در حال بارگذاری...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              لطفاً صبر کنید تا محتوا بارگذاری شود.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              مطلب پیدا نشد
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4" dir="rtl">
              {error ? 
                `خطا در بارگذاری محتوا: ${(error as Error).message}` : 
                `مطلب با آدرس "${slug}" پیدا نشد.`
              }
            </p>
            <Link href="/blog">
              <Button variant="outline">
                بازگشت به وبلاگ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if post is published
  if (post.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 mb-2">
              مطلب در دسترس نیست
            </h3>
            <p className="text-gray-500 dark:text-gray-400" dir="rtl">
              این مطلب هنوز منتشر نشده و در دسترس عموم نیست.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.seoTitle || post.title} - وبلاگ لیمیت پس</title>
        <meta name="description" content={post.seoDescription || post.excerpt || ""} />
        {post.seoKeywords && <meta name="keywords" content={post.seoKeywords.join(', ')} />}
        <meta property="og:title" content={post.ogTitle || post.title} />
        <meta property="og:description" content={post.ogDescription || post.excerpt || ""} />
        {(post.ogImage || post.featuredImage) && (
          <meta property="og:image" content={post.ogImage || post.featuredImage || ""} />
        )}
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author?.name || ""} />
        {post.publishedAt && (
          <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />
        )}
        {post.category && (
          <meta property="article:section" content={post.category.name} />
        )}
        {post.tags && post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400" dir="rtl">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">خانه</Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">وبلاگ</Link>
              {post.category && (
                <>
                  <span className="mx-2">/</span>
                  <Link 
                    href={`/blog/category/${post.category.slug}`} 
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 truncate max-w-xs">{post.title}</span>
            </nav>
          </div>
        </div>

        {/* 3-Column Layout Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar - Table of Contents */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-24 space-y-6">
                <TableOfContents 
                  content={post.content}
                  showOnMobile={false}
                  sticky={false}
                  className="hidden lg:block"
                  data-testid="table-of-contents-sidebar"
                />
                
                {/* Mobile TOC - collapsible */}
                <div className="lg:hidden">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Menu className="w-5 h-5 text-blue-500" />
                        <span>فهرست مطالب</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <TableOfContents 
                        content={post.content}
                        showOnMobile={true}
                        collapsible={true}
                        sticky={false}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-6 order-1 lg:order-2">
              <article className="space-y-6" data-testid={`blog-post-${post.slug}`}>
                
                {/* Article Header Card */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="pb-6">
                    {/* Category */}
                    {post.category && (
                      <div className="mb-4">
                        <Link href={`/blog/category/${post.category.slug}`}>
                          <Badge 
                            variant="outline" 
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm px-3 py-1"
                            style={{ 
                              backgroundColor: post.category.color ? `${post.category.color}15` : undefined,
                              borderColor: post.category.color || undefined,
                              color: post.category.color || undefined
                            }}
                            data-testid={`category-${post.category.slug}`}
                          >
                            {post.category.name}
                          </Badge>
                        </Link>
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6 font-persian" data-testid="post-title">
                      {post.title}
                    </h1>

                    {/* Simplified Author Display */}
                    {post.author && (
                      <div className="mb-6">
                        <Link href={`/blog/author/${post.author.slug}`} data-testid={`author-profile-link-${post.author.slug}`}>
                          <div className="flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 -mx-3 transition-colors cursor-pointer group">
                            <Avatar className="w-12 h-12 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all">
                              <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-lg font-bold">
                                {getAuthorInitials(post.author.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" data-testid="author-name">
                                {post.author.name}
                              </div>
                              {post.author.jobTitle && (
                                <div className="text-sm text-gray-500 dark:text-gray-400" data-testid="author-title">
                                  {post.author.jobTitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </CardHeader>

                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="relative">
                      <img 
                        src={post.featuredImage} 
                        alt={post.featuredImageAlt || post.title}
                        className="w-full h-64 md:h-80 lg:h-96 object-cover"
                        data-testid="featured-image"
                      />
                      {post.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-md">
                            ⭐ ویژه
                          </Badge>
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  <CardHeader className="pt-6 pb-6">
                    {/* Publication Info - Single Line */}
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                        {/* Publication Date */}
                        {post.publishedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <time dateTime={post.publishedAt.toString()} data-testid="publish-date">
                              {formatDate(post.publishedAt)}
                            </time>
                          </div>
                        )}

                        {/* Reading Time */}
                        {post.readingTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span data-testid="reading-time">{formatReadingTime(post.readingTime)}</span>
                          </div>
                        )}

                        {/* View Count */}
                        {post.viewCount && post.viewCount > 0 && (
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span data-testid="view-count">{post.viewCount.toLocaleString('fa-IR')}</span>
                          </div>
                        )}
                      </div>

                      {/* Horizontal Social Sharing */}
                      <div className="flex-shrink-0">
                        <EnhancedSocialShare 
                          post={post} 
                          author={post.author}
                          currentUrl={currentUrl}
                          variant="compact"
                          showLabels={false}
                          onShare={handleSocialShare}
                          className="flex gap-2"
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30" data-testid="post-excerpt">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {post.excerpt}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                </Card>

                {/* Main Content Card */}
                <Card className="shadow-lg border-0">
                  <CardContent className="px-6 py-8 lg:px-8 lg:py-10">
                    {/* Main Content */}
                    {post.content && (
                      <div className="blog-content-wrapper">
                        <BlogContentRenderer 
                          content={post.content} 
                          className="prose-enhanced"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-3">
                          <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">برچسب‌ها:</span>
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <Link key={index} href={`/blog/tag/${tag}`}>
                                <Badge 
                                  variant="secondary" 
                                  className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 cursor-pointer px-3 py-1"
                                  data-testid={`tag-${tag}`}
                                >
                                  #{tag}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Author Bio */}
                    {post.author && post.author.bio && (
                      <div className="mt-12 p-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-6">
                          <Avatar className="w-20 h-20 flex-shrink-0 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                            <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xl font-bold">
                              {getAuthorInitials(post.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3" data-testid="author-bio-name">
                              درباره {post.author.name}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base" data-testid="author-bio">
                              {post.author.bio}
                            </p>
                            {(post.author.website || post.author.twitter || post.author.linkedin) && (
                              <div className="flex items-center gap-4 text-sm">
                                {post.author.website && (
                                  <a 
                                    href={post.author.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                                    data-testid="author-website"
                                  >
                                    وب‌سایت
                                  </a>
                                )}
                                {post.author.twitter && (
                                  <a 
                                    href={`https://twitter.com/${post.author.twitter}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                                    data-testid="author-twitter"
                                  >
                                    توییتر
                                  </a>
                                )}
                                {post.author.linkedin && (
                                  <a 
                                    href={post.author.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                                    data-testid="author-linkedin"
                                  >
                                    لینکدین
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Post Navigation */}
                {navigation && (navigation.previous || navigation.next) && (
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {navigation.previous && (
                          <Link href={`/blog/${navigation.previous.slug}`}>
                            <div className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                              <div className="flex items-center gap-3 mb-2">
                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">مطلب قبلی</span>
                              </div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {navigation.previous.title}
                              </h3>
                            </div>
                          </Link>
                        )}
                        
                        {navigation.next && (
                          <Link href={`/blog/${navigation.next.slug}`}>
                            <div className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                              <div className="flex items-center gap-3 mb-2 justify-end">
                                <span className="text-sm text-gray-500 dark:text-gray-400">مطلب بعدی</span>
                                <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                              </div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-right">
                                {navigation.next.title}
                              </h3>
                            </div>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Related Posts */}
                {relatedPosts && relatedPosts.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        مطالب مرتبط
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedPosts.slice(0, 3).map((relatedPost) => (
                          <BlogCard 
                            key={relatedPost.id} 
                            post={relatedPost}
                            className="h-full"
                            data-testid={`related-post-${relatedPost.id}`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </article>
            </main>

            {/* Right Sidebar - Popular Content */}
            <aside className="lg:col-span-3 order-3">
              <div className="sticky top-24">
                <PopularContent 
                  currentPostId={post.id}
                  maxItems={{ posts: 5, authors: 4, tags: 10 }}
                  className="hidden lg:block"
                  data-testid="popular-content-sidebar"
                />
                
                {/* Mobile Popular Content */}
                <div className="lg:hidden mt-6">
                  <PopularContent 
                    currentPostId={post.id}
                    maxItems={{ posts: 3, authors: 3, tags: 6 }}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
            data-testid="scroll-to-top"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        )}
      </div>
    </>
  );
}