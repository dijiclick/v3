import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
  showRecentSearches?: boolean;
  className?: string;
}

export default function BlogSearch({
  value,
  onChange,
  onSearch,
  placeholder = "جستجو در مقالات...",
  suggestions = [],
  isLoading = false,
  showRecentSearches = true,
  className = ""
}: BlogSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('blog-recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load recent searches:', error);
        }
      }
    }
  }, [showRecentSearches]);

  // Debounced search functionality
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim() && onSearch) {
        onSearch(value.trim());
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Add to recent searches
    if (showRecentSearches) {
      const updatedSearches = [
        trimmedQuery,
        ...recentSearches.filter(s => s !== trimmedQuery)
      ].slice(0, 5); // Keep only 5 recent searches

      setRecentSearches(updatedSearches);
      localStorage.setItem('blog-recent-searches', JSON.stringify(updatedSearches));
    }

    // Trigger search
    if (onSearch) {
      onSearch(trimmedQuery);
    }
    
    // Blur input on mobile to hide keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const clearSearch = () => {
    onChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('blog-recent-searches');
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem('blog-recent-searches', JSON.stringify(updatedSearches));
  };

  const shouldShowDropdown = isFocused && (suggestions.length > 0 || recentSearches.length > 0);

  return (
    <div className={`relative ${className}`} dir="rtl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" data-testid="search-loading" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => setIsFocused(false), 150);
          }}
          placeholder={placeholder}
          className="pr-10 pl-10 h-12 text-right bg-white dark:bg-card border-2 border-gray-200 dark:border-border focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          data-testid="blog-search-input"
        />
        
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="clear-search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions & Recent Searches Dropdown */}
      {shouldShowDropdown && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-border">
              <h4 className="text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2">
                پیشنهادات
              </h4>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    data-testid={`suggestion-${index}`}
                  >
                    <Search className="w-4 h-4 inline ml-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                  جستجوهای اخیر
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  data-testid="clear-recent-searches"
                >
                  پاک کردن همه
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md px-3 py-2"
                  >
                    <button
                      onClick={() => {
                        onChange(search);
                        handleSearch(search);
                      }}
                      className="flex-1 text-right text-sm"
                      data-testid={`recent-search-${index}`}
                    >
                      <Search className="w-4 h-4 inline ml-2 text-gray-400" />
                      {search}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(search);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      data-testid={`remove-recent-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {suggestions.length === 0 && recentSearches.length === 0 && value.trim() && (
            <div className="p-6 text-center text-gray-500 dark:text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">نتیجه‌ای یافت نشد</p>
              <p className="text-xs mt-1">کلمات کلیدی دیگری امتحان کنید</p>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {isFocused && !value && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-lg z-50 p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2">
            نکات جستجو
          </h4>
          <div className="space-y-1 text-xs text-gray-500 dark:text-muted-foreground">
            <p>• از کلمات کلیدی مرتبط با موضوع استفاده کنید</p>
            <p>• جستجو در عنوان، محتوا و برچسب‌ها انجام می‌شود</p>
            <p>• برای نتایج بهتر، کلمات کاملتری وارد کنید</p>
          </div>
        </div>
      )}
    </div>
  );
}