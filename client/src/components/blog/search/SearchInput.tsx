import { useState, useEffect, useRef } from "react";
import { Search, X, History, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SearchSuggestion {
  query: string;
  type: 'completion' | 'history' | 'popular';
  frequency?: number;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "جستجو در مقالات...",
  className,
  showSuggestions = true,
  autoFocus = false
}: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get search suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['/api/blog/search/suggestions', localValue],
    enabled: localValue.length >= 2 && isOpen,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const suggestions = (suggestionsData as string[]) || [];

  // Get popular searches when input is empty
  const { data: popularSearchesData } = useQuery({
    queryKey: ['/api/blog/search/popular'],
    enabled: localValue.length === 0 && isOpen,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  const popularSearches = (popularSearchesData as Array<{ query: string; frequency: number }>) || [];

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    onSearch(suggestion);
    setIsOpen(false);
  };

  const handleSearch = () => {
    if (localValue.trim()) {
      onSearch(localValue.trim());
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  // Combine and format suggestions
  const formattedSuggestions: SearchSuggestion[] = [
    ...suggestions.map((query) => ({
      query,
      type: 'completion' as const
    })),
    ...popularSearches.map((item) => ({
      query: item.query,
      type: 'popular' as const,
      frequency: item.frequency
    }))
  ];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={localValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-3 pr-10 text-right"
          dir="rtl"
          autoFocus={autoFocus}
          data-testid="search-input"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            data-testid="clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && showSuggestions && formattedSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto p-2">
          {localValue.length >= 2 && suggestions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                پیشنهادات جستجو
              </div>
              {suggestions.map((suggestion, index) => (
                <Button
                  key={`suggestion-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-right h-8 px-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`suggestion-${index}`}
                >
                  <Search className="ml-2 h-3 w-3 text-muted-foreground" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {localValue.length === 0 && popularSearches.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <TrendingUp className="ml-1 h-3 w-3" />
                جستجوهای محبوب
              </div>
              {popularSearches.slice(0, 8).map((item, index) => (
                <Button
                  key={`popular-${index}`}
                  variant="ghost"
                  className="w-full justify-between text-right h-8 px-2"
                  onClick={() => handleSuggestionClick(item.query)}
                  data-testid={`popular-search-${index}`}
                >
                  <Badge variant="secondary" className="text-xs">
                    {item.frequency}
                  </Badge>
                  <span className="flex items-center">
                    <TrendingUp className="ml-1 h-3 w-3 text-muted-foreground" />
                    {item.query}
                  </span>
                </Button>
              ))}
            </div>
          )}

          {formattedSuggestions.length > 0 && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="w-full text-xs text-muted-foreground"
                disabled={!localValue.trim()}
                data-testid="search-button"
              >
                جستجو برای "{localValue}"
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  );
}