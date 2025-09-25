import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModernPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalPosts?: number;
  postsPerPage?: number;
}

export function ModernPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalPosts, 
  postsPerPage 
}: ModernPaginationProps) {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Convert numbers to Persian
  const toPersianNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  const startItem = (currentPage - 1) * (postsPerPage || 8) + 1;
  const endItem = Math.min(currentPage * (postsPerPage || 8), totalPosts || 0);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6" dir="rtl" data-testid="modern-pagination">
      {totalPosts && (
        <p className="text-sm text-gray-600 font-vazir">
          نمایش {toPersianNumber(startItem)} تا {toPersianNumber(endItem)} از {toPersianNumber(totalPosts)} نتیجه
        </p>
      )}
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors duration-200"
          data-testid="pagination-prev"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        {getVisiblePages().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400 font-vazir">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className={`w-9 h-9 p-0 transition-all duration-200 font-vazir ${
                  currentPage === page 
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-sm" 
                    : "hover:bg-red-50 hover:text-red-600"
                }`}
                data-testid={`pagination-page-${page}`}
              >
                {typeof page === 'number' ? toPersianNumber(page) : page}
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors duration-200"
          data-testid="pagination-next"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}