import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sparkles, History, BookOpen, Clock, Eye, Trash2, RefreshCw } from "lucide-react";
import { BlogPost } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { contentRecommendationEngine } from "@/lib/content-recommendations";

interface ContentDiscoveryProps {
  currentPost?: BlogPost;
  className?: string;
  showRecommendations?: boolean;
  showRecentlyViewed?: boolean;
  showRecentlyUpdated?: boolean;
  maxItems?: {
    recommendations?: number;
    recentlyViewed?: number;
    recentlyUpdated?: number;
  };
}

export default function ContentDiscovery({ 
  currentPost,
  className,
  showRecommendations = true,
  showRecentlyViewed = true,
  showRecentlyUpdated = true,
  maxItems = { recommendations: 6, recentlyViewed: 5, recentlyUpdated: 4 }
}: ContentDiscoveryProps) {
  
  const [viewedPosts, setViewedPosts] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load user data on mount
  useEffect(() => {
    setViewedPosts(contentRecommendationEngine.getViewedPosts());
    setBookmarks(contentRecommendationEngine.getBookmarks());
  }, []);

  // Track current post view
  useEffect(() => {
    if (currentPost) {
      contentRecommendationEngine.trackPostView(currentPost);
      setViewedPosts(contentRecommendationEngine.getViewedPosts());
    }
  }, [currentPost]);

  // Fetch personalized recommendations
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/recommendations', viewedPosts.slice(0, 5).join(',')],
    queryFn: async () => {
      const basedOn = viewedPosts.slice(0, 5).join(',');
      const response = await fetch(
        `/api/blog/recommendations?basedOn=${basedOn}&limit=${maxItems.recommendations}`
      );
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: showRecommendations && viewedPosts.length > 0,
  });

  // Fetch recently viewed posts details
  const { data: recentlyViewedDetails, isLoading: loadingViewed } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts', 'recently-viewed', viewedPosts.slice(0, maxItems.recentlyViewed).join(',')],
    queryFn: async () => {
      const postIds = viewedPosts.slice(0, maxItems.recentlyViewed);
      if (postIds.length === 0) return [];
      
      const posts = await Promise.all(
        postIds.map(async (id) => {
          try {
            const response = await fetch(`/api/blog/posts/${id}`);
            if (response.ok) return response.json();
            return null;
          } catch {
            return null;
          }
        })
      );
      
      return posts.filter(Boolean);
    },
    enabled: showRecentlyViewed && viewedPosts.length > 0,
  });

  // Fetch recently updated posts
  const { data: recentlyUpdated, isLoading: loadingUpdated } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/recently-updated'],
    queryFn: async () => {
      const response = await fetch(`/api/blog/recently-updated?limit=${maxItems.recentlyUpdated}`);
      if (!response.ok) throw new Error('Failed to fetch recently updated posts');
      return response.json();
    },
    enabled: showRecentlyUpdated,
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const clearViewHistory = () => {
    contentRecommendationEngine.clearAllData();
    setViewedPosts([]);
    setBookmarks([]);
  };

  const toggleBookmark = (postId: string) => {
    if (contentRecommendationEngine.isBookmarked(postId)) {
      contentRecommendationEngine.removeBookmark(postId);
    } else {
      contentRecommendationEngine.addBookmark(postId);
    }
    setBookmarks(contentRecommendationEngine.getBookmarks());
  };

  const CompactPostCard = ({ 
    post, 
    showBookmark = false,
    showRemove = false,
    onRemove 
  }: { 
    post: BlogPost; 
    showBookmark?: boolean;
    showRemove?: boolean;
    onRemove?: () => void;
  }) => (
    <div 
      className="flex items-start space-x-reverse space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
      data-testid={`discovery-post-${post.id}`}
    >
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`} className="flex-shrink-0">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="w-16 h-16 object-cover rounded-lg"
            loading="lazy"
          />
        </Link>
      )}
      
      <div className="flex-1 min-w-0">
        <Link href={`/blog/${post.slug}`}>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm leading-snug">
            {post.title}
          </h4>
        </Link>
        
        <div className="flex items-center space-x-reverse space-x-3 mt-1 text-xs text-gray-500">
          {post.readingTime && (
            <div className="flex items-center space-x-reverse space-x-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime} دقیقه</span>
            </div>
          )}
          {post.publishedAt && (
            <span>{formatDate(post.publishedAt)}</span>
          )}
          {post.viewCount && post.viewCount > 0 && (
            <div className="flex items-center space-x-reverse space-x-1">
              <Eye className="w-3 h-3" />
              <span>{post.viewCount.toLocaleString('fa-IR')}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-reverse space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showBookmark && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleBookmark(post.id)}
            className="h-8 w-8 p-0"
            data-testid={`bookmark-button-${post.id}`}
          >
            <BookOpen 
              className={cn(
                "w-4 h-4",
                contentRecommendationEngine.isBookmarked(post.id) 
                  ? "fill-blue-500 text-blue-500" 
                  : "text-gray-400"
              )} 
            />
          </Button>
        )}
        
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            data-testid={`remove-button-${post.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const SkeletonCompactCard = () => (
    <div className="flex items-start space-x-reverse space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)} data-testid="content-discovery">
      {/* Personalized Recommendations */}
      {showRecommendations && (
        <Card data-testid="recommendations-section">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-reverse space-x-2 text-lg">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>پیشنهادات ویژه شما</span>
              {viewedPosts.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  بر اساس {viewedPosts.length} مطلب مطالعه شده
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {loadingRecommendations ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCompactCard key={i} />
              ))
            ) : recommendations && recommendations.length > 0 ? (
              recommendations.map(post => (
                <CompactPostCard 
                  key={post.id} 
                  post={post} 
                  showBookmark 
                />
              ))
            ) : viewedPosts.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">پس از مطالعه چند مطلب، پیشنهادات شخصی‌سازی شده دریافت خواهید کرد.</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">در حال به‌روزرسانی پیشنهادات...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recently Viewed */}
      {showRecentlyViewed && viewedPosts.length > 0 && (
        <Card data-testid="recently-viewed-section">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-reverse space-x-2 text-lg">
                <History className="w-5 h-5 text-blue-500" />
                <span>مطالب اخیر شما</span>
                <Badge variant="outline" className="text-xs">
                  {viewedPosts.length}
                </Badge>
              </CardTitle>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearViewHistory}
                className="text-red-500 hover:text-red-600"
                data-testid="clear-history-button"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                پاک کردن
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {loadingViewed ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCompactCard key={i} />
              ))
            ) : recentlyViewedDetails && recentlyViewedDetails.length > 0 ? (
              recentlyViewedDetails.map(post => (
                <CompactPostCard 
                  key={post.id} 
                  post={post}
                  showRemove
                  onRemove={() => {
                    const updated = viewedPosts.filter(id => id !== post.id);
                    setViewedPosts(updated);
                    localStorage.setItem('blog_viewed_posts', JSON.stringify(updated));
                  }}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">هنوز مطلبی مطالعه نکرده‌اید.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recently Updated */}
      {showRecentlyUpdated && (
        <Card data-testid="recently-updated-section">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-reverse space-x-2 text-lg">
              <RefreshCw className="w-5 h-5 text-green-500" />
              <span>به‌روزرسانی‌های اخیر</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {loadingUpdated ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCompactCard key={i} />
              ))
            ) : recentlyUpdated && recentlyUpdated.length > 0 ? (
              recentlyUpdated.map(post => (
                <CompactPostCard 
                  key={post.id} 
                  post={post} 
                  showBookmark 
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">به‌روزرسانی اخیری یافت نشد.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}