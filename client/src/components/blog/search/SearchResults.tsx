import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, User, Eye, Bookmark, ExternalLink, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SearchResult {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: any;
    publishedAt: Date;
    readingTime?: number;
    viewCount?: number;
    featured: boolean;
    featuredImage?: string;
    tags?: string[];
    relevanceScore?: number;
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
  };
  relevanceScore: number;
  snippet: string;
  highlightedTitle: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  total: number;
  query: string;
  loading?: boolean;
  searchTime?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function SearchResults({
  results,
  total,
  query,
  loading = false,
  searchTime,
  onLoadMore,
  hasMore = false,
  className
}: SearchResultsProps) {
  if (loading && results.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
                <div className="h-4 bg-muted rounded w-3/5"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground text-lg mb-4">
          نتیجه‌ای برای جستجوی "{query}" یافت نشد
        </div>
        <div className="text-sm text-muted-foreground mb-6">
          پیشنهادات:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>املای کلمات را بررسی کنید</li>
            <li>کلمات کلیدی دیگر امتحان کنید</li>
            <li>فیلترهای جستجو را کاهش دهید</li>
            <li>از کلمات عمومی‌تر استفاده کنید</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {total} نتیجه برای "{query}"
          {searchTime && (
            <span className="mr-2">
              (در {searchTime} میلی‌ثانیه)
            </span>
          )}
        </div>
        {results.length > 0 && (
          <div className="flex items-center">
            <TrendingUp className="ml-1 h-3 w-3" />
            مرتب شده بر اساس مرتبط‌ترین
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <SearchResultCard
            key={`${result.post.id}-${index}`}
            result={result}
            query={query}
            index={index}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={loading}
            data-testid="load-more-results"
          >
            {loading ? "در حال بارگذاری..." : "نمایش نتایج بیشتر"}
          </Button>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ result, query, index }: {
  result: SearchResult;
  query: string;
  index: number;
}) {
  const { post, relevanceScore, snippet, highlightedTitle } = result;

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`search-result-${index}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/blog/${post.slug}`}
              className="block group"
              data-testid={`result-link-${index}`}
            >
              <h3 
                className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlightedTitle || post.title }}
              />
            </Link>
            
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {post.author && (
                <div className="flex items-center">
                  <User className="ml-1 h-3 w-3" />
                  {post.author.name}
                </div>
              )}
              {post.publishedAt && (
                <div className="flex items-center">
                  <CalendarDays className="ml-1 h-3 w-3" />
                  {format(new Date(post.publishedAt), 'dd/MM/yyyy')}
                </div>
              )}
              {post.readingTime && (
                <div className="flex items-center">
                  <Clock className="ml-1 h-3 w-3" />
                  {post.readingTime} دقیقه
                </div>
              )}
              {post.viewCount && (
                <div className="flex items-center">
                  <Eye className="ml-1 h-3 w-3" />
                  {post.viewCount}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {post.featured && (
              <Badge variant="secondary" className="text-xs">
                ویژه
              </Badge>
            )}
            {relevanceScore && (
              <div className="text-xs text-muted-foreground">
                {Math.round(relevanceScore * 100)}% مرتبط
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Snippet */}
        <div 
          className="text-muted-foreground text-sm line-clamp-3 mb-4"
          dangerouslySetInnerHTML={{ __html: snippet || post.excerpt || '' }}
        />

        {/* Category and Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.category && (
              <Link href={`/blog/category/${post.category.slug}`}>
                <Badge variant="outline" className="text-xs hover:bg-muted">
                  {post.category.name}
                </Badge>
              </Link>
            )}
            
            {post.tags && post.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`}>
                <Badge variant="outline" className="text-xs hover:bg-muted">
                  {tag}
                </Badge>
              </Link>
            ))}
            
            {post.tags && post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              data-testid={`bookmark-${index}`}
            >
              <Bookmark className="h-3 w-3" />
            </Button>
            <Link href={`/blog/${post.slug}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                data-testid={`view-${index}`}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}