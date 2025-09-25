import { useState } from "react";
import { X, Filter, Calendar, User, Tag as TagIcon } from "lucide-react";
import { BlogCategory, BlogTag, BlogAuthor, BlogFilters } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlogFiltersProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  authors: BlogAuthor[];
  filters: BlogFilters;
  onFiltersChange: (filters: BlogFilters) => void;
  isLoading?: boolean;
  className?: string;
}

export default function BlogFiltersComponent({
  categories,
  tags,
  authors,
  filters,
  onFiltersChange,
  isLoading = false,
  className = ""
}: BlogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleTagChange = (tagSlug: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tagSlug]
      : filters.tags.filter(slug => slug !== tagSlug);
    
    onFiltersChange({
      ...filters,
      tags: newTags
    });
  };

  const handleAuthorChange = (authorId: string, checked: boolean) => {
    const newAuthors = checked
      ? [...filters.authors, authorId]
      : filters.authors.filter(id => id !== authorId);
    
    onFiltersChange({
      ...filters,
      authors: newAuthors
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [BlogFilters['sortBy'], BlogFilters['sortOrder']];
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      categories: [],
      tags: [],
      authors: [],
      dateRange: {
        start: null,
        end: null
      },
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                         filters.tags.length > 0 || 
                         filters.authors.length > 0 || 
                         filters.dateRange.start || 
                         filters.dateRange.end;

  const getSelectedCategoryNames = () => {
    return categories.filter(cat => filters.categories.includes(cat.id)).map(cat => cat.name);
  };

  const getSelectedTagNames = () => {
    return tags.filter(tag => filters.tags.includes(tag.slug)).map(tag => tag.name);
  };

  const getSelectedAuthorNames = () => {
    return authors.filter(author => filters.authors.includes(author.id)).map(author => author.name);
  };

  return (
    <div className={`bg-white dark:bg-card rounded-lg border p-4 ${className}`} dir="rtl">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">فیلترها</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="filter-toggle"
        >
          <Filter className="w-4 h-4 ml-2" />
          {isOpen ? 'بستن' : 'باز کردن'}
        </Button>
      </div>

      {/* Desktop Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4 hidden lg:block">
        فیلتر و مرتب‌سازی
      </h3>

      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">مرتب‌سازی براساس</Label>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger data-testid="sort-select">
              <SelectValue placeholder="انتخاب مرتب‌سازی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publishedAt-desc">جدیدترین</SelectItem>
              <SelectItem value="publishedAt-asc">قدیمی‌ترین</SelectItem>
              <SelectItem value="title-asc">عنوان (الف - ی)</SelectItem>
              <SelectItem value="title-desc">عنوان (ی - الف)</SelectItem>
              <SelectItem value="readingTime-asc">کمترین زمان مطالعه</SelectItem>
              <SelectItem value="readingTime-desc">بیشترین زمان مطالعه</SelectItem>
              <SelectItem value="viewCount-desc">محبوب‌ترین</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            بازه زمانی
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start text-right">
                  {filters.dateRange.start 
                    ? filters.dateRange.start.toLocaleDateString('fa-IR')
                    : 'از تاریخ'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.start || undefined}
                  onSelect={(date) => onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: date || null }
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start text-right">
                  {filters.dateRange.end 
                    ? filters.dateRange.end.toLocaleDateString('fa-IR')
                    : 'تا تاریخ'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.end || undefined}
                  onSelect={(date) => onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: date || null }
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              دسته‌بندی
            </Label>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      disabled={isLoading}
                      data-testid={`category-filter-${category.slug}`}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      {category.color && (
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Tags Filter */}
        {tags.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                برچسب‌ها
              </Label>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={filters.tags.includes(tag.slug)}
                        onCheckedChange={(checked) => handleTagChange(tag.slug, checked as boolean)}
                        disabled={isLoading}
                        data-testid={`tag-filter-${tag.slug}`}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        {tag.color && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Authors Filter */}
        {authors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                نویسندگان
              </Label>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {authors.map((author) => (
                    <div key={author.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`author-${author.id}`}
                        checked={filters.authors.includes(author.id)}
                        onCheckedChange={(checked) => handleAuthorChange(author.id, checked as boolean)}
                        disabled={isLoading}
                        data-testid={`author-filter-${author.id}`}
                      />
                      <label
                        htmlFor={`author-${author.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {author.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">فیلترهای فعال</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  data-testid="clear-filters"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 ml-1" />
                  پاک کردن همه
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Category Badges */}
                {getSelectedCategoryNames().map((name, index) => (
                  <Badge key={`category-${index}`} variant="secondary" className="text-xs">
                    دسته: {name}
                    <X 
                      className="w-3 h-3 mr-1 cursor-pointer" 
                      onClick={() => {
                        const categoryId = categories.find(c => c.name === name)?.id;
                        if (categoryId) handleCategoryChange(categoryId, false);
                      }}
                    />
                  </Badge>
                ))}
                
                {/* Tag Badges */}
                {getSelectedTagNames().map((name, index) => (
                  <Badge key={`tag-${index}`} variant="secondary" className="text-xs">
                    برچسب: {name}
                    <X 
                      className="w-3 h-3 mr-1 cursor-pointer" 
                      onClick={() => {
                        const tagSlug = tags.find(t => t.name === name)?.slug;
                        if (tagSlug) handleTagChange(tagSlug, false);
                      }}
                    />
                  </Badge>
                ))}
                
                {/* Author Badges */}
                {getSelectedAuthorNames().map((name, index) => (
                  <Badge key={`author-${index}`} variant="secondary" className="text-xs">
                    نویسنده: {name}
                    <X 
                      className="w-3 h-3 mr-1 cursor-pointer" 
                      onClick={() => {
                        const authorId = authors.find(a => a.name === name)?.id;
                        if (authorId) handleAuthorChange(authorId, false);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}