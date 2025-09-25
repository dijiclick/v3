import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Clock, Eye, Calendar, ArrowUp, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BlogNavigationProps {
  currentPost: BlogPost;
  className?: string;
  showProgress?: boolean;
  showFloatingNav?: boolean;
}

interface NavigationResponse {
  previous: BlogPost | null;
  next: BlogPost | null;
}

export default function BlogNavigation({ 
  currentPost, 
  className, 
  showProgress = true,
  showFloatingNav = true 
}: BlogNavigationProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);

  // Fetch navigation data
  const { data: navigation } = useQuery<NavigationResponse>({
    queryKey: ['/api/blog/posts', currentPost.slug, 'navigation'],
    enabled: Boolean(currentPost.slug),
  });

  // Calculate reading progress and time left
  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      
      setReadingProgress(progress);
      setShowScrollToTop(scrollTop > 300);

      // Calculate estimated time left based on reading progress and total reading time
      if (currentPost.readingTime && progress > 0) {
        const timeLeft = Math.max(0, currentPost.readingTime * (1 - progress / 100));
        setEstimatedTimeLeft(Math.ceil(timeLeft));
      }
    };

    window.addEventListener('scroll', calculateProgress);
    calculateProgress(); // Calculate initial state

    return () => window.removeEventListener('scroll', calculateProgress);
  }, [currentPost.readingTime]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const NavigationCard = ({ post, direction }: { post: BlogPost; direction: 'previous' | 'next' }) => (
    <Link href={`/blog/${post.slug}`}>
      <Card 
        className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 group"
        data-testid={`nav-${direction}-post`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-reverse space-x-3">
            {direction === 'previous' && (
              <ChevronRight className="w-5 h-5 text-blue-500 mt-1 group-hover:transform group-hover:translate-x-1 transition-transform" />
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">
                {direction === 'previous' ? 'مطلب قبلی' : 'مطلب بعدی'}
              </p>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center space-x-reverse space-x-4 mt-2 text-xs text-gray-500">
                {post.publishedAt && (
                  <div className="flex items-center space-x-reverse space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                )}
                {post.readingTime && (
                  <div className="flex items-center space-x-reverse space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readingTime} دقیقه</span>
                  </div>
                )}
                {post.viewCount && post.viewCount > 0 && (
                  <div className="flex items-center space-x-reverse space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.viewCount.toLocaleString('fa-IR')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {direction === 'next' && (
              <ChevronLeft className="w-5 h-5 text-blue-500 mt-1 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const FloatingProgress = () => (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
        showProgress ? "translate-y-0" : "-translate-y-full"
      )}
      data-testid="reading-progress-bar"
    >
      <Progress 
        value={readingProgress} 
        className="h-1 rounded-none bg-gray-200 dark:bg-gray-800"
      />
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-reverse space-x-4">
            <span className="text-gray-600 dark:text-gray-400">
              {Math.round(readingProgress)}% مطالعه شده
            </span>
            {estimatedTimeLeft > 0 && (
              <div className="flex items-center space-x-reverse space-x-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{estimatedTimeLeft} دقیقه باقی مانده</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-reverse space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className={cn(
                "transition-opacity duration-300",
                showScrollToTop ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              data-testid="scroll-to-top-button"
            >
              <ArrowUp className="w-4 h-4 ml-1" />
              بازگشت به بالا
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Reading Progress (Floating) */}
      {showFloatingNav && <FloatingProgress />}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="blog-post-navigation">
        {navigation?.previous && (
          <div className="order-2 md:order-1">
            <NavigationCard post={navigation.previous} direction="previous" />
          </div>
        )}
        
        {navigation?.next && (
          <div className="order-1 md:order-2">
            <NavigationCard post={navigation.next} direction="next" />
          </div>
        )}
      </div>

      {/* Current Post Summary */}
      <Card className="bg-gray-50 dark:bg-gray-800" data-testid="current-post-summary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">مطلب فعلی</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {currentPost.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4 text-sm text-gray-500">
              {currentPost.publishedAt && (
                <div className="flex items-center space-x-reverse space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(currentPost.publishedAt)}</span>
                </div>
              )}
              {currentPost.readingTime && (
                <div className="flex items-center space-x-reverse space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{currentPost.readingTime} دقیقه</span>
                </div>
              )}
              {currentPost.viewCount && currentPost.viewCount > 0 && (
                <div className="flex items-center space-x-reverse space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{currentPost.viewCount.toLocaleString('fa-IR')}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Reading Progress Bar (Static) */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>پیشرفت مطالعه</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-reverse space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          data-testid="go-back-button"
        >
          بازگشت
        </Button>
        
        <Link href="/blog">
          <Button variant="outline" size="sm" data-testid="blog-list-button">
            فهرست مطالب
          </Button>
        </Link>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: currentPost.title,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          data-testid="share-post-button"
        >
          اشتراک‌گذاری
        </Button>
      </div>
    </div>
  );
}