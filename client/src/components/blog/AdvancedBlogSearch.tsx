import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Grid, List, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { SearchInput } from "./search/SearchInput";
import { SearchFilters, type SearchFilters as SearchFiltersType } from "./search/SearchFilters";
import { SearchResults } from "./search/SearchResults";
import { SearchSuggestions } from "./search/SearchSuggestions";
import { SavedSearches } from "./search/SavedSearches";

interface AdvancedBlogSearchProps {
  initialQuery?: string;
  initialFilters?: Partial<SearchFiltersType>;
  onResultClick?: (postId: string) => void;
  showSuggestions?: boolean;
  showSavedSearches?: boolean;
  showFilters?: boolean;
  maxResults?: number;
  className?: string;
  sessionId?: string;
}

const defaultFilters: SearchFiltersType = {
  scope: 'all',
  categoryIds: [],
  authorIds: [],
  tags: [],
  dateRange: {},
  readingTimeRange: {},
  featured: undefined,
  sortBy: 'relevance',
  sortOrder: 'desc'
};

export function AdvancedBlogSearch({
  initialQuery = "",
  initialFilters = {},
  onResultClick,
  showSuggestions = true,
  showSavedSearches = true,
  showFilters = true,
  maxResults = 50,
  className,
  sessionId
}: AdvancedBlogSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFiltersType>({
    ...defaultFilters,
    ...initialFilters
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { toast } = useToast();

  // Debounce search query to reduce API calls
  const debouncedQuery = useDebounce(query, 300);

  // Prepare search parameters
  const searchParams = useMemo(() => ({
    q: debouncedQuery,
    scope: filters.scope,
    categoryIds: filters.categoryIds.join(','),
    authorIds: filters.authorIds.join(','),
    tags: filters.tags.join(','),
    startDate: filters.dateRange.start?.toISOString(),
    endDate: filters.dateRange.end?.toISOString(),
    minReadingTime: filters.readingTimeRange.min,
    maxReadingTime: filters.readingTimeRange.max,
    featured: filters.featured,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: 20,
    offset: currentPage * 20
  }), [debouncedQuery, filters, currentPage]);

  // Main search query
  const {
    data: searchResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/blog/search', searchParams],
    enabled: debouncedQuery.length > 0 || Object.keys(filters).some(key => {
      const value = filters[key as keyof SearchFiltersType];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).some(k => (value as any)[k] !== undefined);
      }
      return value !== undefined && value !== defaultFilters[key as keyof SearchFiltersType];
    }),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Track search analytics
  const trackAnalyticsMutation = useMutation({
    mutationFn: async (analyticsData: any) => {
      return apiRequest({
        endpoint: '/api/blog/search/analytics',
        method: 'POST',
        body: analyticsData
      });
    },
    onError: (error) => {
      console.warn('Failed to track search analytics:', error);
    }
  });

  // Handle search
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(0);
    setAllResults([]);
    
    // Track search analytics
    if (newQuery.trim()) {
      trackAnalyticsMutation.mutate({
        searchQuery: newQuery,
        searchScope: filters.scope,
        filters: {
          categoryIds: filters.categoryIds,
          authorIds: filters.authorIds,
          tags: filters.tags,
          dateRange: filters.dateRange,
          readingTimeRange: filters.readingTimeRange,
          featured: filters.featured
        },
        resultsCount: searchResponse?.total || 0,
        responseTime: searchResponse?.searchTime || 0
      });
    }
  }, [filters, searchResponse, trackAnalyticsMutation]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(0);
    setAllResults([]);
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setCurrentPage(0);
    setAllResults([]);
  }, []);

  // Load more results
  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  // Load saved search
  const handleLoadSavedSearch = useCallback((savedQuery: string, savedFilters: any) => {
    setQuery(savedQuery);
    setFilters({ ...defaultFilters, ...savedFilters });
    setCurrentPage(0);
    setAllResults([]);
  }, []);

  // Update results when new data arrives
  useEffect(() => {
    if (searchResponse?.results) {
      if (currentPage === 0) {
        setAllResults(searchResponse.results);
      } else {
        setAllResults(prev => [...prev, ...searchResponse.results]);
      }
    }
  }, [searchResponse, currentPage]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return (filters.scope !== 'all' ? 1 : 0) +
           filters.categoryIds.length +
           filters.authorIds.length +
           filters.tags.length +
           (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
           (filters.readingTimeRange.min || filters.readingTimeRange.max ? 1 : 0) +
           (filters.featured !== undefined ? 1 : 0);
  }, [filters]);

  const hasResults = allResults.length > 0;
  const hasMore = searchResponse ? allResults.length < searchResponse.total : false;
  const hasActiveSearch = query.trim().length > 0 || activeFiltersCount > 0;

  if (error) {
    toast({
      title: "خطا در جستجو",
      description: "مشکلی در انجام جستجو رخ داد. لطفاً دوباره امتحان کنید.",
      variant: "destructive"
    });
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder="جستجو در مقالات، نویسندگان، برچسب‌ها..."
                showSuggestions={showSuggestions}
                autoFocus={!initialQuery}
              />
            </div>
            
            {showFilters && (
              <Button
                variant={showFiltersPanel ? "default" : "outline"}
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="shrink-0"
                data-testid="toggle-filters-panel"
              >
                <SlidersHorizontal className="ml-2 h-4 w-4" />
                فیلترها
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="mr-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Search Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showSavedSearches && (
                <SavedSearches
                  currentQuery={query}
                  currentFilters={filters}
                  onLoadSearch={handleLoadSavedSearch}
                  sessionId={sessionId}
                />
              )}
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  data-testid="clear-all-filters"
                >
                  <X className="ml-2 h-4 w-4" />
                  پاک کردن همه فیلترها
                </Button>
              )}
            </div>

            {hasResults && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  data-testid="view-grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters Sidebar */}
        {showFilters && showFiltersPanel && (
          <div className="lg:col-span-3">
            <SearchFilters
              filters={filters}
              onChange={handleFiltersChange}
              onReset={handleResetFilters}
              facets={searchResponse?.facets}
            />
          </div>
        )}

        {/* Search Results and Suggestions */}
        <div className={cn(
          "lg:col-span-12",
          showFilters && showFiltersPanel && "lg:col-span-9"
        )}>
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results" className="flex items-center">
                <Search className="ml-2 h-4 w-4" />
                نتایج جستجو
                {searchResponse?.total !== undefined && (
                  <Badge variant="secondary" className="mr-2">
                    {searchResponse.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center">
                <Filter className="ml-2 h-4 w-4" />
                پیشنهادات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {hasActiveSearch ? (
                <SearchResults
                  results={allResults}
                  total={searchResponse?.total || 0}
                  query={query}
                  loading={isLoading}
                  searchTime={searchResponse?.searchTime}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                />
              ) : (
                <Card className="p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">جستجوی پیشرفته مقالات</h3>
                  <p className="text-muted-foreground mb-4">
                    از جستجوی قدرتمند برای یافتن مقالات مورد نظرتان استفاده کنید
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>• جستجو در عنوان، محتوا، نویسندگان و برچسب‌ها</p>
                    <p>• فیلتر بر اساس دسته‌بندی، تاریخ و زمان مطالعه</p>
                    <p>• ذخیره و بازیابی جستجوهای مفید</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="suggestions">
              {showSuggestions && (
                <SearchSuggestions
                  query={query}
                  onSuggestionClick={handleSearch}
                  showHistory={true}
                  showPopular={true}
                  showRelated={true}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Quick Stats */}
      {searchResponse && hasActiveSearch && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <div>
                <strong>{searchResponse.total}</strong> نتیجه یافت شد
              </div>
              {searchResponse.searchTime && (
                <div>
                  زمان جستجو: <strong>{searchResponse.searchTime}ms</strong>
                </div>
              )}
              {activeFiltersCount > 0 && (
                <div>
                  <strong>{activeFiltersCount}</strong> فیلتر فعال
                </div>
              )}
            </div>
            
            {searchResponse.facets && (
              <div className="flex items-center gap-4">
                {searchResponse.facets.categories.length > 0 && (
                  <div>
                    {searchResponse.facets.categories.length} دسته‌بندی
                  </div>
                )}
                {searchResponse.facets.authors.length > 0 && (
                  <div>
                    {searchResponse.facets.authors.length} نویسنده
                  </div>
                )}
                {searchResponse.facets.tags.length > 0 && (
                  <div>
                    {searchResponse.facets.tags.length} برچسب
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}