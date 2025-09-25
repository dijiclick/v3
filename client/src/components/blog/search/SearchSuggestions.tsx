import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, TrendingUp, History, Search, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  onClearHistory?: () => void;
  className?: string;
  showHistory?: boolean;
  showPopular?: boolean;
  showRelated?: boolean;
}

interface Suggestion {
  query: string;
  type: 'spelling' | 'related' | 'popular' | 'history';
  score?: number;
  frequency?: number;
}

export function SearchSuggestions({
  query,
  onSuggestionClick,
  onClearHistory,
  className,
  showHistory = true,
  showPopular = true,
  showRelated = true
}: SearchSuggestionsProps) {
  const [localHistory, setLocalHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('blog-search-history') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  // Get popular searches
  const { data: popularSearches = [] } = useQuery({
    queryKey: ['/api/blog/search/popular'],
    enabled: showPopular,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Generate spelling suggestions (simple implementation)
  const getSpellingSuggestions = (query: string): string[] => {
    if (!query || query.length < 3) return [];
    
    const suggestions: string[] = [];
    const common = ['React', 'جاوا اسکریپت', 'TypeScript', 'Next.js', 'پایتون', 'برنامه نویسی'];
    
    for (const term of common) {
      if (term.toLowerCase().includes(query.toLowerCase()) && term !== query) {
        suggestions.push(term);
      }
    }
    
    return suggestions.slice(0, 3);
  };

  // Generate related search suggestions
  const getRelatedSuggestions = (query: string): string[] => {
    if (!query || query.length < 3) return [];
    
    const related: Record<string, string[]> = {
      'react': ['React Hooks', 'React Router', 'React Components', 'React State Management'],
      'javascript': ['ES6', 'Async/Await', 'Promises', 'DOM Manipulation'],
      'css': ['CSS Grid', 'Flexbox', 'CSS Animations', 'Responsive Design'],
      'node': ['Express.js', 'Node.js APIs', 'npm packages', 'Node.js security'],
      'database': ['PostgreSQL', 'MongoDB', 'Database Design', 'SQL Queries'],
      'api': ['REST APIs', 'GraphQL', 'API Design', 'API Authentication']
    };
    
    const queryLower = query.toLowerCase();
    for (const [key, suggestions] of Object.entries(related)) {
      if (queryLower.includes(key) || key.includes(queryLower)) {
        return suggestions.slice(0, 4);
      }
    }
    
    return [];
  };

  const spellingSuggestions = getSpellingSuggestions(query);
  const relatedSuggestions = showRelated ? getRelatedSuggestions(query) : [];
  const recentHistory = showHistory ? localHistory.slice(0, 5) : [];

  const handleSuggestionClick = (suggestion: string) => {
    // Add to history
    if (typeof window !== 'undefined') {
      const newHistory = [suggestion, ...localHistory.filter(h => h !== suggestion)].slice(0, 10);
      setLocalHistory(newHistory);
      localStorage.setItem('blog-search-history', JSON.stringify(newHistory));
    }
    
    onSuggestionClick(suggestion);
  };

  const handleClearHistory = () => {
    setLocalHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blog-search-history');
    }
    onClearHistory?.();
  };

  const hasAnySuggestions = 
    spellingSuggestions.length > 0 || 
    relatedSuggestions.length > 0 || 
    recentHistory.length > 0 || 
    popularSearches.length > 0;

  if (!hasAnySuggestions) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Lightbulb className="ml-2 h-4 w-4" />
          پیشنهادات جستجو
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Spelling Corrections */}
        {spellingSuggestions.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              منظورتان این بود؟
            </div>
            <div className="space-y-1">
              {spellingSuggestions.map((suggestion, index) => (
                <Button
                  key={`spelling-${index}`}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start text-primary"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`spelling-suggestion-${index}`}
                >
                  <Search className="ml-2 h-3 w-3" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {spellingSuggestions.length > 0 && (relatedSuggestions.length > 0 || recentHistory.length > 0 || popularSearches.length > 0) && (
          <Separator />
        )}

        {/* Related Searches */}
        {relatedSuggestions.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              جستجوهای مرتبط
            </div>
            <div className="space-y-1">
              {relatedSuggestions.map((suggestion, index) => (
                <Button
                  key={`related-${index}`}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`related-suggestion-${index}`}
                >
                  <Search className="ml-2 h-3 w-3" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {relatedSuggestions.length > 0 && (recentHistory.length > 0 || popularSearches.length > 0) && (
          <Separator />
        )}

        {/* Recent Search History */}
        {recentHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <History className="ml-1 h-3 w-3" />
                جستجوهای اخیر
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="h-6 px-2 text-xs"
                data-testid="clear-history"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {recentHistory.map((suggestion, index) => (
                <Button
                  key={`history-${index}`}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start text-muted-foreground"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`history-suggestion-${index}`}
                >
                  <History className="ml-2 h-3 w-3" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {recentHistory.length > 0 && popularSearches.length > 0 && (
          <Separator />
        )}

        {/* Popular Searches */}
        {popularSearches.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
              <TrendingUp className="ml-1 h-3 w-3" />
              جستجوهای محبوب
            </div>
            <div className="space-y-1">
              {popularSearches.slice(0, 6).map((item: any, index: number) => (
                <Button
                  key={`popular-${index}`}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-between"
                  onClick={() => handleSuggestionClick(item.query)}
                  data-testid={`popular-suggestion-${index}`}
                >
                  <Badge variant="secondary" className="text-xs">
                    {item.frequency}
                  </Badge>
                  <span className="flex items-center">
                    <TrendingUp className="ml-1 h-3 w-3" />
                    {item.query}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Help */}
        {query && !spellingSuggestions.length && !relatedSuggestions.length && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground mb-3">
              نتیجه‌ای یافت نشد؟
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• کلمات ساده‌تر امتحان کنید</p>
              <p>• املای کلمات را بررسی کنید</p>
              <p>• از فیلترهای کمتر استفاده کنید</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}