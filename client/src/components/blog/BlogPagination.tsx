import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { BlogPaginationInfo } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogPaginationProps {
  pagination: BlogPaginationInfo;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export default function BlogPagination({
  pagination,
  onPageChange,
  showPageInfo = true,
  maxVisiblePages = 5,
  className = ""
}: BlogPaginationProps) {
  const { page, totalPages, total, limit, hasNext, hasPrev } = pagination;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, page + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Calculate result range
  const startResult = (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, total);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`} dir="rtl">
      {/* Page Info */}
      {showPageInfo && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600 dark:text-muted-foreground">
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

      {/* Pagination Controls */}
      <nav className="flex justify-center" aria-label="نوار صفحه‌بندی" data-testid="blog-pagination">
        <div className="flex items-center space-x-1 space-x-reverse">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
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
                  onClick={() => onPageChange(pageNum)}
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
            onClick={() => onPageChange(page + 1)}
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
            <span className="text-gray-600 dark:text-muted-foreground">رفتن به صفحه:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={page}
              onChange={(e) => {
                const newPage = parseInt(e.target.value);
                if (newPage >= 1 && newPage <= totalPages) {
                  onPageChange(newPage);
                }
              }}
              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-border rounded-md bg-white dark:bg-card focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="pagination-jump-input"
            />
            <span className="text-gray-600 dark:text-muted-foreground">
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