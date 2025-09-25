import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Clock, Eye, Calendar, User, Folder, TrendingUp, ChevronRight } from "lucide-react";
import { BlogPost, BlogAuthor, BlogCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RelatedContentProps {
  currentPost: BlogPost;
  className?: string;
  showRelatedPosts?: boolean;
  showMoreFromAuthor?: boolean;
  showPopularInCategory?: boolean;
  maxItems?: {
    related?: number;
    author?: number;
    popular?: number;
  };
}

export default function RelatedContent({ 
  currentPost, 
  className,
  showRelatedPosts = true,
  showMoreFromAuthor = true,
  showPopularInCategory = true,
  maxItems = { related: 6, author: 4, popular: 4 }
}: RelatedContentProps) {

  // Fetch related posts
  const { data: relatedPosts, isLoading: loadingRelated } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts', currentPost.slug, 'related'],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/${currentPost.slug}/related?limit=${maxItems.related}`);
      if (!response.ok) throw new Error('Failed to fetch related posts');
      return response.json();
    },
    enabled: showRelatedPosts && Boolean(currentPost.slug),
  });

  // Fetch more from author
  const { data: authorPosts, isLoading: loadingAuthor } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/authors', currentPost.authorId, 'recent-posts'],
    queryFn: async () => {
      const response = await fetch(
        `/api/blog/authors/${currentPost.authorId}/recent-posts?limit=${maxItems.author}&exclude=${currentPost.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch author posts');
      return response.json();
    },
    enabled: showMoreFromAuthor && Boolean(currentPost.authorId),
  });

  // Fetch popular posts in category
  const { data: popularPosts, isLoading: loadingPopular } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/popular', currentPost.categoryId],
    queryFn: async () => {
      const response = await fetch(
        `/api/blog/popular?categoryId=${currentPost.categoryId}&limit=${maxItems.popular}&timeframe=30d`
      );
      if (!response.ok) throw new Error('Failed to fetch popular posts');
      return response.json();
    },
    enabled: showPopularInCategory && Boolean(currentPost.categoryId),
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const PostCard = ({ post, showCategory = false }: { post: BlogPost; showCategory?: boolean }) => (
    <Link href={`/blog/${post.slug}`} key={post.id}>
      <Card 
        className="hover:shadow-md transition-all duration-300 cursor-pointer group h-full"
        data-testid={`related-post-${post.id}`}
      >
        {post.featuredImage && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        
        <CardContent className="p-4 space-y-3">
          {showCategory && post.category && (
            <Badge variant="secondary" className="text-xs">
              <Folder className="w-3 h-3 ml-1" />
              {post.category.name}
            </Badge>
          )}
          
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
            {post.title}
          </h4>
          
          {post.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-reverse space-x-3">
              {post.readingTime && (
                <div className="flex items-center space-x-reverse space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime} دقیقه</span>
                </div>
              )}
              {post.publishedAt && (
                <div className="flex items-center space-x-reverse space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              )}
            </div>
            
            {post.viewCount && post.viewCount > 0 && (
              <div className="flex items-center space-x-reverse space-x-1">
                <Eye className="w-3 h-3" />
                <span>{post.viewCount.toLocaleString('fa-IR')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const SkeletonCard = () => (
    <Card>
      <div className="aspect-video">
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
  );

  const SectionHeader = ({ 
    icon: Icon, 
    title, 
    viewAllHref,
    count 
  }: { 
    icon: any; 
    title: string; 
    viewAllHref?: string;
    count?: number;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-reverse space-x-2">
        <Icon className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
          {count && count > 0 && (
            <span className="text-sm text-gray-500 mr-2">({count})</span>
          )}
        </h3>
      </div>
      
      {viewAllHref && (
        <Link href={viewAllHref}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            مشاهده همه
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-8", className)} data-testid="related-content">
      {/* Related Posts */}
      {showRelatedPosts && (
        <section data-testid="related-posts-section">
          <SectionHeader 
            icon={TrendingUp}
            title="مطالب مرتبط"
            count={relatedPosts?.length}
          />
          
          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : relatedPosts && relatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map(post => (
                <PostCard key={post.id} post={post} showCategory />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>مطلب مرتبطی یافت نشد.</p>
            </div>
          )}
        </section>
      )}

      {/* More from Author */}
      {showMoreFromAuthor && currentPost.authorId && (
        <section data-testid="more-from-author-section">
          <SectionHeader 
            icon={User}
            title={`بیشتر از ${currentPost.author?.name || 'این نویسنده'}`}
            viewAllHref={`/blog/author/${currentPost.author?.slug || currentPost.authorId}`}
            count={authorPosts?.length}
          />
          
          {loadingAuthor ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : authorPosts && authorPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {authorPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>مطلب دیگری از این نویسنده موجود نیست.</p>
            </div>
          )}
        </section>
      )}

      {/* Popular in Category */}
      {showPopularInCategory && currentPost.categoryId && (
        <section data-testid="popular-in-category-section">
          <SectionHeader 
            icon={Folder}
            title={`محبوب در ${currentPost.category?.name || 'این دسته‌بندی'}`}
            viewAllHref={`/blog/category/${currentPost.category?.slug || currentPost.categoryId}`}
            count={popularPosts?.length}
          />
          
          {loadingPopular ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : popularPosts && popularPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularPosts.filter(post => post.id !== currentPost.id).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Folder className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>مطلب محبوبی در این دسته‌بندی یافت نشد.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}