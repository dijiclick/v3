import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, X, Loader2, Package, FileText, Clock, User, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

interface ProductResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  price: string;
  originalPrice?: string;
  categoryId: string;
  featured: boolean;
  type: 'product';
}

interface BlogResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt: Date;
  readingTime?: number;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  snippet: string;
  highlightedTitle: string;
  type: 'blog';
}

interface ComprehensiveSearchResponse {
  products: ProductResult[];
  blogArticles: BlogResult[];
  total: number;
}

interface ComprehensiveSearchProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function ComprehensiveSearch({
  placeholder = "جستجو در محصولات و مقالات...",
  className = "",
  autoFocus = false
}: ComprehensiveSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Debounced search query
  const debouncedQuery = useDebounce(query, 300);

  // Get search results
  const { data: searchData, isLoading } = useQuery<ComprehensiveSearchResponse>({
    queryKey: ['/api/search/comprehensive', debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // All results (products + blog articles) for keyboard navigation
  const allResults = [
    ...(searchData?.products || []).map(item => ({ ...item, resultType: 'product' as const })),
    ...(searchData?.blogArticles || []).map(item => ({ ...item, resultType: 'blog' as const }))
  ];

  // Auto focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Navigate to result
  const navigateToResult = useCallback((result: ProductResult | BlogResult) => {
    if (result.type === 'product') {
      // Navigate to product page (assuming the route structure)
      setLocation(`/product/${result.slug}`);
    } else {
      // Navigate to blog post page
      setLocation(`/blog/${result.slug}`);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [setLocation]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || allResults.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        // Redirect to full search page
        setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setSelectedIndex(-1);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allResults.length) {
          navigateToResult(allResults[selectedIndex]);
        } else if (query.trim()) {
          // Redirect to full search page
          setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        if (inputRef.current) {
          inputRef.current.blur();
        }
        break;
    }
  };

  // Format price for display
  const formatPrice = (price: string): string => {
    const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
    return Math.round(numericPrice).toLocaleString('fa-IR');
  };

  const shouldShowDropdown = isOpen && debouncedQuery.length >= 2;
  const hasResults = searchData && (searchData.products.length > 0 || searchData.blogArticles.length > 0);

  return (
    <div className={cn("relative", className)} ref={dropdownRef} dir="rtl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" data-testid="search-loading" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-12 pl-12 h-14 text-right text-lg bg-white dark:bg-card border-2 border-gray-200 dark:border-border focus:border-blue-400 dark:focus:border-blue-500 transition-colors rounded-xl shadow-sm"
          data-testid="comprehensive-search-input"
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="clear-search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {shouldShowDropdown && (
        <Card className="absolute top-full right-0 left-0 mt-2 border-2 border-gray-200 dark:border-border shadow-xl z-50 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                در حال جستجو...
              </p>
            </div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Products Section */}
              {searchData.products.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-muted-foreground">
                      محصولات ({searchData.products.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchData.products.map((product, index) => {
                      const globalIndex = index;
                      const isSelected = selectedIndex === globalIndex;
                      
                      return (
                        <div
                          key={`product-${product.id}`}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                          onClick={() => navigateToResult(product)}
                          data-testid={`product-result-${index}`}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {product.title}
                            </h4>
                            {product.description && (
                              <p className="text-sm text-gray-500 dark:text-muted-foreground truncate">
                                {product.description.substring(0, 60)}...
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatPrice(product.price)} تومان
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                              {product.featured && (
                                <Badge variant="secondary" className="text-xs">
                                  ویژه
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Separator between sections */}
              {searchData.products.length > 0 && searchData.blogArticles.length > 0 && (
                <Separator />
              )}

              {/* Blog Articles Section */}
              {searchData.blogArticles.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-muted-foreground">
                      مقالات ({searchData.blogArticles.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchData.blogArticles.map((article, index) => {
                      const globalIndex = searchData.products.length + index;
                      const isSelected = selectedIndex === globalIndex;
                      
                      return (
                        <div
                          key={`blog-${article.id}`}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isSelected ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                          onClick={() => navigateToResult(article)}
                          data-testid={`blog-result-${index}`}
                        >
                          {article.featuredImage ? (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-medium text-gray-900 dark:text-white truncate"
                              dangerouslySetInnerHTML={{ __html: article.highlightedTitle }}
                            />
                            {article.snippet && (
                              <p 
                                className="text-sm text-gray-500 dark:text-muted-foreground truncate"
                                dangerouslySetInnerHTML={{ __html: article.snippet.substring(0, 80) + '...' }}
                              />
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              {article.readingTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{article.readingTime} دقیقه</span>
                                </div>
                              )}
                              {article.author && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{article.author.name}</span>
                                </div>
                              )}
                              {article.category && (
                                <Badge variant="outline" className="text-xs">
                                  {article.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View All Results Footer */}
              <div className="border-t border-gray-200 dark:border-border p-3">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  onClick={() => {
                    setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
                    setIsOpen(false);
                    setSelectedIndex(-1);
                  }}
                  data-testid="view-all-results"
                >
                  مشاهده همه نتایج ({searchData.total})
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                نتیجه‌ای برای "{query}" یافت نشد
              </p>
              <p className="text-xs text-gray-400 mt-1">
                کلمات کلیدی دیگری امتحان کنید
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Search Tips */}
      {isOpen && !query && (
        <Card className="absolute top-full right-0 left-0 mt-2 border-2 border-gray-200 dark:border-border shadow-xl z-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2">
              نکات جستجو
            </h4>
            <div className="space-y-1 text-xs text-gray-500 dark:text-muted-foreground">
              <p>• جستجو در محصولات و مقالات همزمان انجام می‌شود</p>
              <p>• از کلمات کلیدی مرتبط با موضوع استفاده کنید</p>
              <p>• برای نتایج بهتر، حداقل 2 کاراکتر وارد کنید</p>
              <p>• از کلیدهای بالا/پایین برای حرکت استفاده کنید</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}