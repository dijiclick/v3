import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2, RefreshCw, Grid, List } from "lucide-react";
import { BlogPaginationInfo, BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type PaginationMode = 'traditional' | 'infinite' | 'load-more';

interface BlogPaginationProps {
  pagination: BlogPaginationInfo;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
  posts?: BlogPost[];
  mode?: PaginationMode;
  isLoading?: boolean;
  hasMore?: boolean;
  showPageInfo?: boolean;
  showPostPreviews?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export default function BlogPagination({
  pagination,
  onPageChange,
  onLoadMore,
  posts = [],
  mode = 'traditional',
  isLoading = false,
  hasMore = false,
  showPageInfo = true,
  showPostPreviews = false,
  maxVisiblePages = 5,
  className = ""
}: BlogPaginationProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { page, totalPages, total, limit, hasNext, hasPrev } = pagination;

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (mode !== 'infinite' || !onLoadMore) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [mode, onLoadMore]);

  // Auto-load more when intersecting (infinite scroll)
  useEffect(() => {
    if (mode === 'infinite' && isIntersecting && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore, mode]);

  // Traditional pagination functions
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, page + halfVisible);

    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const PostPreview = ({ post }: { post: BlogPost }) => (
    <Card className="mb-2 last:mb-0">
      <CardContent className="p-3">
        <div className="flex items-start space-x-reverse space-x-3">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 text-sm">
              {post.title}
            </h4>
            {post.excerpt && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingState = () => (
    <div className="flex flex-col items-center space-y-4 py-8" data-testid="pagination-loading">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-sm text-gray-600 dark:text-gray-400">در حال بارگذاری مطالب...</p>
    </div>
  );

  const visiblePages = getVisiblePages();
  const startResult = (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, total);

  // Render based on mode
  if (mode === 'infinite') {
    return (
      <div className={cn("space-y-4", className)} data-testid="infinite-scroll-pagination">
        {/* Page Info */}
        {showPageInfo && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-gray-400" dir="rtl">
            <div className="flex items-center gap-2">
              <span>
                {posts.length.toLocaleString('fa-IR')} از {total.toLocaleString('fa-IR')} مطلب نمایش داده شده
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              <span>نمایش خودکار</span>
            </div>
          </div>
        )}

        {/* Post Previews */}
        {showPostPreviews && posts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مطالب بارگذاری شده:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {posts.slice(-5).map(post => (
                <PostPreview key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="w-full">
          {isLoading && <LoadingState />}
          {hasMore && !isLoading && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500">ادامه مطالب در حال بارگذاری...</div>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 mb-2">همه مطالب نمایش داده شد</div>
              <Badge variant="outline" className="text-xs">
                {posts.length.toLocaleString('fa-IR')} مطلب
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'load-more') {
    return (
      <div className={cn("space-y-4", className)} data-testid="load-more-pagination">
        {/* Page Info */}
        {showPageInfo && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-gray-400" dir="rtl">
            <div className="flex items-center gap-2">
              <span>
                {posts.length.toLocaleString('fa-IR')} از {total.toLocaleString('fa-IR')} مطلب نمایش داده شده
              </span>
            </div>
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span>بارگذاری دستی</span>
            </div>
          </div>
        )}

        {/* Post Previews */}
        {showPostPreviews && posts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مطالب بارگذاری شده:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {posts.slice(-5).map(post => (
                <PostPreview key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : hasMore ? (
            <Button
              onClick={onLoadMore}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
              data-testid="load-more-button"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بارگذاری مطالب بیشتر
            </Button>
          ) : posts.length > 0 ? (
            <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 mb-2">همه مطالب نمایش داده شد</div>
              <Badge variant="outline" className="text-xs">
                {posts.length.toLocaleString('fa-IR')} مطلب
              </Badge>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Traditional pagination mode
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)} dir="rtl" data-testid="traditional-pagination">
      {/* Page Info */}
      {showPageInfo && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>
              نمایش {startResult.toLocaleString('fa-IR')} تا {endResult.toLocaleString('fa-IR')} از {total.toLocaleString('fa-IR')} نتیجه
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>صفحه</span>
            <Badge variant="secondary" className="px-2 py-1">
              {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
            </Badge>
          </div>
        </div>
      )}

      {/* Post Previews for current page */}
      {showPostPreviews && posts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مطالب این صفحه:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {posts.map(post => (
              <PostPreview key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="flex justify-center" aria-label="نوار صفحه‌بندی" data-testid="blog-pagination">
        <div className="flex items-center space-x-1 space-x-reverse">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page - 1)}
            disabled={!hasPrev}
            className="flex items-center gap-1 px-3"
            data-testid="pagination-prev"
            aria-label="صفحه قبلی"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">قبلی</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1 space-x-reverse">
            {visiblePages.map((pageNum, index) => (
              pageNum === 'ellipsis' ? (
                <div key={`ellipsis-${index}`} className="px-2 py-1">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  className="min-w-[2.5rem] h-9"
                  data-testid={`pagination-page-${pageNum}`}
                  aria-label={`صفحه ${pageNum}`}
                  aria-current={pageNum === page ? "page" : undefined}
                >
                  {(pageNum as number).toLocaleString('fa-IR')}
                </Button>
              )
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={!hasNext}
            className="flex items-center gap-1 px-3"
            data-testid="pagination-next"
            aria-label="صفحه بعدی"
          >
            <span className="hidden sm:inline">بعدی</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Quick Jump (for large datasets) */}
      {totalPages > 10 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">رفتن به صفحه:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={page}
              onChange={(e) => {
                const newPage = parseInt(e.target.value);
                if (newPage >= 1 && newPage <= totalPages) {
                  onPageChange?.(newPage);
                }
              }}
              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="pagination-jump-input"
            />
            <span className="text-gray-600 dark:text-gray-400">
              از {totalPages.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>
      )}

      {/* SEO-friendly links for crawler */}
      <div className="hidden">
        {hasPrev && (
          <link rel="prev" href={`?page=${page - 1}`} />
        )}
        {hasNext && (
          <link rel="next" href={`?page=${page + 1}`} />
        )}
        <link rel="canonical" href={`?page=${page}`} />
      </div>
    </div>
  );
}