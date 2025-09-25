import { useState } from "react";
import { CalendarDays, Clock, Tag, User, Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export interface SearchFilters {
  scope: 'all' | 'title' | 'content' | 'authors' | 'tags';
  categoryIds: string[];
  authorIds: string[];
  tags: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  readingTimeRange: {
    min?: number;
    max?: number;
  };
  featured?: boolean;
  sortBy: 'relevance' | 'publishedAt' | 'title' | 'readingTime' | 'viewCount';
  sortOrder: 'asc' | 'desc';
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
  facets?: {
    categories: Array<{ id: string; name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ slug: string; name: string; count: number }>;
    readingTimes: Array<{ range: string; count: number }>;
  };
}

export function SearchFilters({
  filters,
  onChange,
  onReset,
  className,
  facets
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get categories for filter options
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/blog/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  const categories = (categoriesData as Array<{ id: string; name: string }>) || [];

  // Get authors for filter options
  const { data: authorsData } = useQuery({
    queryKey: ['/api/blog/authors'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  const authors = (authorsData as Array<{ id: string; name: string }>) || [];

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onChange({ ...filters, ...updates });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter(id => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    updateFilters({ categoryIds: newCategories });
  };

  const toggleAuthor = (authorId: string) => {
    const newAuthors = filters.authorIds.includes(authorId)
      ? filters.authorIds.filter(id => id !== authorId)
      : [...filters.authorIds, authorId];
    updateFilters({ authorIds: newAuthors });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const setDatePreset = (preset: string) => {
    const now = new Date();
    let start: Date | undefined;
    
    switch (preset) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        start = undefined;
        break;
    }
    
    updateFilters({
      dateRange: { start, end: preset === 'all' ? undefined : now }
    });
  };

  const setReadingTimePreset = (preset: string) => {
    let min: number | undefined;
    let max: number | undefined;
    
    switch (preset) {
      case 'quick':
        max = 3;
        break;
      case 'medium':
        min = 3;
        max = 10;
        break;
      case 'long':
        min = 10;
        break;
      case 'all':
      default:
        min = undefined;
        max = undefined;
        break;
    }
    
    updateFilters({ readingTimeRange: { min, max } });
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.scope !== 'all' ? 1 : 0) +
    filters.categoryIds.length +
    filters.authorIds.length +
    filters.tags.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.readingTimeRange.min || filters.readingTimeRange.max ? 1 : 0) +
    (filters.featured !== undefined ? 1 : 0);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Filter className="ml-2 h-4 w-4" />
            فیلترهای جستجو
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="mr-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2"
              disabled={activeFiltersCount === 0}
              data-testid="reset-filters"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 px-2"
              data-testid="toggle-filters"
            >
              <X className={cn("h-3 w-3 transition-transform", isOpen && "rotate-45")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Search Scope */}
            <div>
              <Label className="text-sm font-medium">محدوده جستجو</Label>
              <Select
                value={filters.scope}
                onValueChange={(value: any) => updateFilters({ scope: value })}
              >
                <SelectTrigger className="mt-1" data-testid="scope-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه موارد</SelectItem>
                  <SelectItem value="title">فقط عنوان</SelectItem>
                  <SelectItem value="content">فقط محتوا</SelectItem>
                  <SelectItem value="authors">فقط نویسندگان</SelectItem>
                  <SelectItem value="tags">فقط برچسب‌ها</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <Label className="text-sm font-medium flex items-center">
                <Tag className="ml-1 h-3 w-3" />
                دسته‌بندی‌ها
              </Label>
              <div className="mt-2 space-y-2">
                {(facets?.categories || categories).slice(0, 8).map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categoryIds.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      data-testid={`category-${category.id}`}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      {category.name}
                      {facets?.categories && (
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Authors */}
            <div>
              <Label className="text-sm font-medium flex items-center">
                <User className="ml-1 h-3 w-3" />
                نویسندگان
              </Label>
              <div className="mt-2 space-y-2">
                {(facets?.authors || authors).slice(0, 6).map((author) => (
                  <div key={author.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`author-${author.id}`}
                      checked={filters.authorIds.includes(author.id)}
                      onCheckedChange={() => toggleAuthor(author.id)}
                      data-testid={`author-${author.id}`}
                    />
                    <Label
                      htmlFor={`author-${author.id}`}
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      {author.name}
                      {facets?.authors && (
                        <Badge variant="outline" className="text-xs">
                          {author.count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            {facets?.tags && facets.tags.length > 0 && (
              <>
                <div>
                  <Label className="text-sm font-medium flex items-center">
                    <Tag className="ml-1 h-3 w-3" />
                    برچسب‌ها
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {facets.tags.slice(0, 10).map((tag) => (
                      <Button
                        key={tag.slug}
                        variant={filters.tags.includes(tag.slug) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag.slug)}
                        className="h-7 text-xs"
                        data-testid={`tag-${tag.slug}`}
                      >
                        {tag.name}
                        <Badge variant="secondary" className="mr-1 text-xs">
                          {tag.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium flex items-center">
                <CalendarDays className="ml-1 h-3 w-3" />
                تاریخ انتشار
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant={!filters.dateRange.start && !filters.dateRange.end ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatePreset('all')}
                  data-testid="date-all"
                >
                  همه زمان‌ها
                </Button>
                <Button
                  variant={filters.dateRange.start && 
                          Math.abs(new Date().getTime() - filters.dateRange.start.getTime()) <= 7.5 * 24 * 60 * 60 * 1000 
                          ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatePreset('week')}
                  data-testid="date-week"
                >
                  هفته گذشته
                </Button>
                <Button
                  variant={filters.dateRange.start && 
                          Math.abs(new Date().getTime() - filters.dateRange.start.getTime()) <= 35 * 24 * 60 * 60 * 1000 
                          ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatePreset('month')}
                  data-testid="date-month"
                >
                  ماه گذشته
                </Button>
                <Button
                  variant={filters.dateRange.start && 
                          Math.abs(new Date().getTime() - filters.dateRange.start.getTime()) <= 370 * 24 * 60 * 60 * 1000 
                          ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDatePreset('year')}
                  data-testid="date-year"
                >
                  سال گذشته
                </Button>
              </div>
            </div>

            <Separator />

            {/* Reading Time */}
            <div>
              <Label className="text-sm font-medium flex items-center">
                <Clock className="ml-1 h-3 w-3" />
                زمان مطالعه
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant={!filters.readingTimeRange.min && !filters.readingTimeRange.max ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReadingTimePreset('all')}
                  data-testid="reading-time-all"
                >
                  همه
                </Button>
                <Button
                  variant={filters.readingTimeRange.max === 3 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReadingTimePreset('quick')}
                  data-testid="reading-time-quick"
                >
                  سریع (≤3 دقیقه)
                </Button>
                <Button
                  variant={filters.readingTimeRange.min === 3 && filters.readingTimeRange.max === 10 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReadingTimePreset('medium')}
                  data-testid="reading-time-medium"
                >
                  متوسط (3-10 دقیقه)
                </Button>
                <Button
                  variant={filters.readingTimeRange.min === 10 && !filters.readingTimeRange.max ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReadingTimePreset('long')}
                  data-testid="reading-time-long"
                >
                  طولانی (≥10 دقیقه)
                </Button>
              </div>
            </div>

            <Separator />

            {/* Featured Posts */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featured === true}
                onCheckedChange={(checked) => 
                  updateFilters({ featured: checked ? true : undefined })
                }
                data-testid="featured-checkbox"
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">
                فقط مقالات ویژه
              </Label>
            </div>

            <Separator />

            {/* Sort Options */}
            <div>
              <Label className="text-sm font-medium">مرتب‌سازی بر اساس</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger data-testid="sort-by-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">مرتبط‌ترین</SelectItem>
                    <SelectItem value="publishedAt">تاریخ انتشار</SelectItem>
                    <SelectItem value="title">عنوان</SelectItem>
                    <SelectItem value="readingTime">زمان مطالعه</SelectItem>
                    <SelectItem value="viewCount">بازدید</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) => updateFilters({ sortOrder: value })}
                >
                  <SelectTrigger data-testid="sort-order-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">نزولی</SelectItem>
                    <SelectItem value="asc">صعودی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}