import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Eye, 
  Calendar, 
  User, 
  Hash, 
  Flame, 
  BookOpen, 
  Users,
  ChevronRight,
  Star,
  Clock
} from "lucide-react";
import { BlogPost, BlogTag, BlogAuthor } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PopularContentProps {
  className?: string;
  currentPostId?: string;
  showPopularPosts?: boolean;
  showPopularAuthors?: boolean;
  showHotTags?: boolean;
  maxItems?: {
    posts?: number;
    authors?: number;
    tags?: number;
  };
}

export default function PopularContent({ 
  className,
  currentPostId,
  showPopularPosts = true,
  showPopularAuthors = true,
  showHotTags = true,
  maxItems = { posts: 5, authors: 4, tags: 8 }
}: PopularContentProps) {

  // Fetch popular posts
  const { data: popularPosts, isLoading: loadingPosts } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts/popular', maxItems.posts],
    queryFn: async () => {
      const response = await fetch(
        `/api/blog/posts/popular?limit=${maxItems.posts}&timeframe=30d&status=published`
      );
      if (!response.ok) throw new Error('Failed to fetch popular posts');
      return response.json();
    },
    enabled: showPopularPosts,
  });

  // Fetch popular authors
  const { data: popularAuthors, isLoading: loadingAuthors } = useQuery<(BlogAuthor & { postCount: number; totalViews: number })[]>({
    queryKey: ['/api/blog/authors/popular', maxItems.authors],
    queryFn: async () => {
      const response = await fetch(`/api/blog/authors/popular?limit=${maxItems.authors}`);
      if (!response.ok) throw new Error('Failed to fetch popular authors');
      return response.json();
    },
    enabled: showPopularAuthors,
  });

  // Fetch hot tags (most used)
  const { data: hotTags, isLoading: loadingTags } = useQuery<(BlogTag & { postCount: number })[]>({
    queryKey: ['/api/blog/tags/popular', maxItems.tags],
    queryFn: async () => {
      const response = await fetch(`/api/blog/tags/popular?limit=${maxItems.tags}`);
      if (!response.ok) throw new Error('Failed to fetch popular tags');
      return response.json();
    },
    enabled: showHotTags,
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'هزار';
    return (num / 1000000).toFixed(1) + 'میلیون';
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="popular-content">
      
      {/* Popular Posts Section */}
      {showPopularPosts && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span>مطالب محبوب</span>
              <Badge variant="secondary" className="text-xs">
                {popularPosts?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            {loadingPosts ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : popularPosts && popularPosts.length > 0 ? (
              <div className="space-y-4">
                {popularPosts
                  .filter(post => post.id !== currentPostId)
                  .slice(0, maxItems.posts)
                  .map((post, index) => (
                  <Link href={`/blog/${post.slug}`} key={post.id}>
                    <div 
                      className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      data-testid={`popular-post-${post.id}`}
                    >
                      {/* Ranking Number */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      
                      {/* Post Image */}
                      {post.featuredImage && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={post.featuredImage}
                            alt={post.featuredImageAlt || post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      {/* Post Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 mb-1">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {post.viewCount && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{formatNumber(post.viewCount)}</span>
                            </div>
                          )}
                          
                          {post.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">مطالب محبوبی یافت نشد.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Authors Section */}
      {showPopularAuthors && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              <span>نویسندگان محبوب</span>
              <Badge variant="secondary" className="text-xs">
                {popularAuthors?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            {loadingAuthors ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : popularAuthors && popularAuthors.length > 0 ? (
              <div className="space-y-3">
                {popularAuthors.slice(0, maxItems.authors).map((author, index) => (
                  <Link href={`/blog/author/${author.slug}`} key={author.id}>
                    <div 
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      data-testid={`popular-author-${author.id}`}
                    >
                      {/* Ranking */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      
                      {/* Author Avatar */}
                      <Avatar className="w-10 h-10 border-2 border-gray-100 dark:border-gray-700">
                        <AvatarImage src={author.avatar || ''} alt={author.name} />
                        <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900">
                          {getAuthorInitials(author.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Author Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {author.name}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {author.postCount > 0 && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{author.postCount} مطلب</span>
                            </div>
                          )}
                          
                          {author.totalViews > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{formatNumber(author.totalViews)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">نویسنده‌ای یافت نشد.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hot Tags Section */}
      {showHotTags && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-red-500" />
              <span>تگ‌های داغ</span>
              <Badge variant="secondary" className="text-xs">
                {hotTags?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            {loadingTags ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            ) : hotTags && hotTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hotTags.slice(0, maxItems.tags).map((tag, index) => (
                  <Link href={`/blog/tag/${tag.slug}`} key={tag.id}>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "group cursor-pointer hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-700 transition-all text-xs px-3 py-1",
                        index < 3 && "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                      )}
                      data-testid={`hot-tag-${tag.id}`}
                    >
                      <Hash className="w-3 h-3 ml-1" />
                      <span>{tag.name}</span>
                      {tag.postCount > 0 && (
                        <span className="mr-1 opacity-70">
                          ({tag.postCount})
                        </span>
                      )}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">تگی یافت نشد.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// Loading component for PopularContent
export function PopularContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Popular Posts Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Authors Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hot Tags Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Popular Content with more sections
export function EnhancedPopularContent(props: PopularContentProps) {
  return (
    <div className="space-y-6">
      <PopularContent {...props} />
      
      {/* Latest Comments Section */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span>آخرین نظرات</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">قابلیت نظردهی به‌زودی...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}