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
  Bookmark
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
import BlogCard from "@/components/blog/BlogCard";
import { SEOService } from "@/lib/seo-service";
import { useEffect } from "react";
import EnhancedSocialShare from "@/components/blog/EnhancedSocialShare";

interface BlogContentRendererProps {
  content: any;
  className?: string;
}

// Component to render blog post content (similar to CMSContentRenderer but optimized for blog posts)
const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content, className = "" }) => {
  if (!content) {
    return <div className={className}>محتوای این مطلب موجود نیست.</div>;
  }

  // If content is a string (HTML or markdown), render it directly
  if (typeof content === 'string') {
    return (
      <div 
        className={`prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-6 prose-blockquote:italic ${className}`}
        dir="rtl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // If content is an object (structured JSON), render it as sections
  if (typeof content === 'object') {
    return (
      <div className={`prose prose-lg max-w-none ${className}`} dir="rtl">
        {Array.isArray(content) ? (
          content.map((section, index) => (
            <div key={index} className="mb-8">
              {section.type === 'heading' && (
                <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-100 pb-3">
                  {section.text}
                </h2>
              )}
              {section.type === 'paragraph' && (
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {section.text}
                </p>
              )}
              {section.type === 'html' && (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
              {section.type === 'image' && (
                <figure className="my-8">
                  <img 
                    src={section.url} 
                    alt={section.alt || ''} 
                    className="w-full rounded-lg shadow-md"
                    loading="lazy"
                  />
                  {section.caption && (
                    <figcaption className="text-center text-gray-500 text-sm mt-2">
                      {section.caption}
                    </figcaption>
                  )}
                </figure>
              )}
              {section.type === 'callout' && (
                <div className={`p-6 rounded-lg border-l-4 my-8 ${
                  section.calloutType === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  section.calloutType === 'error' ? 'bg-red-50 border-red-400' :
                  section.calloutType === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="text-sm font-medium mb-2">
                    {section.calloutType === 'warning' ? '⚠️ هشدار' :
                     section.calloutType === 'error' ? '❌ خطا' :
                     section.calloutType === 'success' ? '✅ موفقیت' :
                     'ℹ️ نکته'}
                  </div>
                  <div className="text-gray-700">{section.text}</div>
                </div>
              )}
            </div>
          ))
        ) : (
          // Handle object content with properties
          <div>
            {content.title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {content.title}
              </h2>
            )}
            {content.description && (
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {content.description}
              </p>
            )}
            {content.body && (
              <div dangerouslySetInnerHTML={{ __html: content.body }} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback for other content types
  return (
    <div className={className}>
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto" dir="ltr">
        <pre className="text-sm">{JSON.stringify(content, null, 2)}</pre>
      </div>
    </div>
  );
};

export default function BlogPostPage() {
  const { slug } = useParams();
  
  // Fetch blog post data
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || "");
  const { data: relatedPosts } = useRelatedBlogPosts(post || undefined, 3);
  const { data: navigation } = useBlogPostNavigation(post || undefined);

  // Current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
      // Initialize SEO service
      const seoService = new SEOService();

      // Calculate reading time and word count from content
      const contentText = seoService.extractTextFromContent(post.content);
      const wordCount = seoService.calculateWordCount(contentText);
      const readingTime = seoService.calculateReadingTime(wordCount);

      // Generate comprehensive schema markup
      const organizationSchema = seoService.generateOrganizationSchema({
        name: "لیمیت پس",
        url: "https://limitplus.ir",
        logo: "https://limitplus.ir/logo.png",
        description: "پلتفرم جامع ارائه محصولات و خدمات دیجیتال",
        contactInfo: {
          email: "info@limitplus.ir",
          phone: "+98-21-12345678",
          address: {
            streetAddress: "تهران، ایران",
            addressLocality: "تهران", 
            addressRegion: "تهران",
            postalCode: "12345",
            addressCountry: "IR"
          }
        },
        socialProfiles: [
          "https://t.me/limitplus",
          "https://instagram.com/limitplus.ir"
        ]
      });

      const authorSchema = post.author ? seoService.generatePersonSchema({
        name: post.author.name,
        description: post.author.bio || undefined,
        url: post.author.website || undefined,
        image: post.author.avatar || undefined,
        jobTitle: post.author.jobTitle || undefined,
        worksFor: post.author.company || undefined,
        socialProfiles: [
          post.author.twitter,
          post.author.linkedin,
          post.author.github,
          post.author.telegram
        ].filter(Boolean)
      }) : undefined;

      const blogPostSchema = seoService.generateArticleSchema({
        headline: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || "",
        content: contentText,
        author: post.author ? {
          name: post.author.name,
          url: post.author.website || undefined,
          image: post.author.avatar || undefined
        } : undefined,
        datePublished: post.publishedAt || post.createdAt || new Date(),
        dateModified: post.updatedAt || undefined,
        image: post.ogImage || post.featuredImage || undefined,
        category: post.category?.name,
        tags: post.tags || undefined,
        keywords: post.seoKeywords || undefined,
        url: currentUrl,
        wordCount,
        readingTime,
        language: "fa-IR",
        inLanguage: "fa-IR"
      });

      const breadcrumbSchema = seoService.generateBreadcrumbSchema([
        { name: "خانه", url: "https://limitplus.ir" },
        { name: "وبلاگ", url: "https://limitplus.ir/blog" },
        ...(post.category ? [{ 
          name: post.category.name, 
          url: `https://limitplus.ir/blog/category/${post.category.slug}` 
        }] : []),
        { name: post.title, url: currentUrl }
      ]);

      // Generate enhanced meta tags
      const metaTags = seoService.generateMetaTags({
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || "",
        keywords: post.seoKeywords || post.tags || [],
        canonical: currentUrl,
        language: "fa-IR",
        textDirection: "rtl",
        robots: "index,follow"
      });

      // Generate Open Graph tags
      const ogTags = seoService.generateOpenGraphTags({
        title: post.ogTitle || post.title,
        description: post.ogDescription || post.excerpt || "",
        url: currentUrl,
        type: "article",
        image: post.ogImage || post.featuredImage || undefined,
        siteName: "لیمیت پس",
        locale: "fa_IR",
        article: {
          author: post.author?.name,
          publishedTime: post.publishedAt || post.createdAt || new Date(),
          modifiedTime: post.updatedAt || undefined,
          section: post.category?.name,
          tags: post.tags || undefined
        }
      });

      // Generate Twitter Card tags
      const twitterTags = seoService.generateTwitterCardTags({
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || "",
        image: post.ogImage || post.featuredImage || undefined,
        site: "@limitplus_ir",
        creator: post.author?.twitter || undefined
      });

      // Apply all SEO enhancements
      seoService.updatePageSEO({
        title: `${post.seoTitle || post.title} - وبلاگ لیمیت پس`,
        metaTags,
        openGraphTags: ogTags,
        twitterCardTags: twitterTags,
        structuredData: [
          organizationSchema,
          ...(authorSchema ? [authorSchema] : []),
          blogPostSchema,
          breadcrumbSchema
        ],
        jsonLd: true
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 text-blue-500 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              در حال بارگذاری...
            </h3>
            <p className="text-gray-500">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              مطلب پیدا نشد
            </h3>
            <p className="text-gray-500 mb-4" dir="rtl">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-yellow-600 mb-2">
              مطلب در دسترس نیست
            </h3>
            <p className="text-gray-500" dir="rtl">
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

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-500" dir="rtl">
              <Link href="/" className="hover:text-blue-600">خانه</Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-blue-600">وبلاگ</Link>
              {post.category && (
                <>
                  <span className="mx-2">/</span>
                  <Link href={`/blog/category/${post.category.slug}`} className="hover:text-blue-600">
                    {post.category.name}
                  </Link>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Article Content */}
            <article className="lg:col-span-2" data-testid={`blog-post-${post.slug}`}>
              <Card className="shadow-lg border-0">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative">
                    <img 
                      src={post.featuredImage} 
                      alt={post.featuredImageAlt || post.title}
                      className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                      data-testid="featured-image"
                    />
                    {post.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          ⭐ ویژه
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="pb-6">
                  {/* Category */}
                  {post.category && (
                    <div className="mb-4">
                      <Link href={`/blog/category/${post.category.slug}`}>
                        <Badge 
                          variant="outline" 
                          className="hover:bg-gray-100 transition-colors"
                          style={{ backgroundColor: post.category.color ? `${post.category.color}15` : undefined }}
                          data-testid={`category-${post.category.slug}`}
                        >
                          {post.category.name}
                        </Badge>
                      </Link>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6" data-testid="post-title">
                    {post.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                    {/* Author */}
                    {post.author && (
                      <Link href={`/blog/author/${post.author.slug}`} data-testid={`author-profile-link-${post.author.slug}`}>
                        <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getAuthorInitials(post.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-testid="author-name">
                              {post.author.name}
                            </div>
                            {post.author.jobTitle && (
                              <div className="text-xs text-gray-500" data-testid="author-title">
                                {post.author.jobTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )}

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

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-lg text-gray-700 leading-relaxed mb-6 p-4 bg-blue-50 rounded-lg border-r-4 border-blue-400" data-testid="post-excerpt">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Enhanced Social Sharing */}
                  <EnhancedSocialShare 
                    post={post} 
                    author={post.author}
                    currentUrl={currentUrl}
                    variant="default"
                    showLabels={true}
                    onShare={handleSocialShare}
                    className="mt-4"
                  />
                </CardHeader>

                <CardContent className="prose-container">
                  {/* Main Content */}
                  {post.content && (
                    <BlogContentRenderer 
                      content={post.content} 
                      className="mb-8"
                    />
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap items-center gap-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">برچسب‌ها:</span>
                        {post.tags.map((tag, index) => (
                          <Link key={index} href={`/blog/tag/${tag}`}>
                            <Badge 
                              variant="secondary" 
                              className="hover:bg-gray-200 transition-colors"
                              data-testid={`tag-${tag}`}
                            >
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Author Bio */}
                  {post.author && post.author.bio && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16 flex-shrink-0">
                          <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                            {getAuthorInitials(post.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2" data-testid="author-bio-name">
                            درباره {post.author.name}
                          </h3>
                          <p className="text-gray-700 leading-relaxed mb-3" data-testid="author-bio">
                            {post.author.bio}
                          </p>
                          {(post.author.website || post.author.twitter || post.author.linkedin) && (
                            <div className="flex items-center gap-3 text-sm">
                              {post.author.website && (
                                <a 
                                  href={post.author.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
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
                                  className="text-blue-600 hover:underline"
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
                                  className="text-blue-600 hover:underline"
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

              {/* Navigation */}
              {navigation && (navigation.previous || navigation.next) && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {navigation.previous && (
                    <Link href={`/blog/${navigation.previous.slug}`} className="block">
                      <Card className="h-full hover:shadow-md transition-shadow border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
                            <ArrowRight className="w-4 h-4" />
                            مطلب قبلی
                          </div>
                          <h3 className="font-medium text-gray-900 line-clamp-2" data-testid="previous-post-title">
                            {navigation.previous.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                  {navigation.next && (
                    <Link href={`/blog/${navigation.next.slug}`} className="block">
                      <Card className="h-full hover:shadow-md transition-shadow border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
                            مطلب بعدی
                            <ArrowLeft className="w-4 h-4" />
                          </div>
                          <h3 className="font-medium text-gray-900 line-clamp-2" data-testid="next-post-title">
                            {navigation.next.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Related Posts */}
              {relatedPosts && relatedPosts.length > 0 && (
                <Card className="mb-8 shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="related-posts-title">
                      مطالب مرتبط
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <div key={relatedPost.id} className="group">
                        <Link href={`/blog/${relatedPost.slug}`} className="block">
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            {relatedPost.featuredImage && (
                              <img 
                                src={relatedPost.featuredImage} 
                                alt={relatedPost.title}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                loading="lazy"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1" data-testid={`related-post-${relatedPost.slug}`}>
                                {relatedPost.title}
                              </h4>
                              {relatedPost.publishedAt && (
                                <div className="text-xs text-gray-500">
                                  {formatDate(relatedPost.publishedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">عملیات سریع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="like-button">
                    <Heart className="w-4 h-4 ml-2" />
                    پسندیدن مطلب
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="bookmark-button">
                    <Bookmark className="w-4 h-4 ml-2" />
                    ذخیره مطلب
                  </Button>
                  <Link href="#comments" className="w-full">
                    <Button variant="outline" className="w-full justify-start" data-testid="comment-button">
                      <MessageCircle className="w-4 h-4 ml-2" />
                      نظرات
                    </Button>
                  </Link>
                  <Separator />
                  <EnhancedSocialShare 
                    post={post} 
                    author={post.author}
                    currentUrl={currentUrl}
                    variant="compact"
                    showLabels={false}
                    onShare={handleSocialShare}
                    className="mt-4"
                  />
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}