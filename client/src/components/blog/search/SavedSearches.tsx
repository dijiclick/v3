import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Bookmark, Save, Trash2, Search, Calendar, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SavedSearch {
  id: string;
  name: string;
  searchQuery: string;
  filters?: any;
  createdAt: Date;
  lastUsed: Date;
  isPublic: boolean;
}

interface SavedSearchesProps {
  currentQuery?: string;
  currentFilters?: any;
  onLoadSearch: (query: string, filters: any) => void;
  sessionId?: string;
  className?: string;
}

export function SavedSearches({
  currentQuery = "",
  currentFilters = {},
  onLoadSearch,
  sessionId,
  className
}: SavedSearchesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get saved searches
  const { data: savedSearchesData, isLoading } = useQuery({
    queryKey: ['/api/blog/search/saved', sessionId],
    refetchOnWindowFocus: false,
  });
  const savedSearches = (savedSearchesData as SavedSearch[]) || [];

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: async (data: { name: string; searchQuery: string; filters?: any; sessionId?: string; isPublic?: boolean }) => {
      return apiRequest('POST', '/api/blog/search/saved', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/search/saved'] });
      toast({
        title: "جستجو ذخیره شد",
        description: "جستجوی شما با موفقیت ذخیره شد"
      });
      setSaveDialogOpen(false);
      setSearchName("");
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ذخیره جستجو",
        description: error.message || "مشکلی در ذخیره جستجو رخ داد",
        variant: "destructive"
      });
    }
  });

  // Delete search mutation
  const deleteSearchMutation = useMutation({
    mutationFn: async (searchId: string) => {
      return apiRequest('DELETE', `/api/blog/search/saved/${searchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/search/saved'] });
      toast({
        title: "جستجو حذف شد",
        description: "جستجوی ذخیره شده حذف شد"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف جستجو",
        description: error.message || "مشکلی در حذف جستجو رخ داد",
        variant: "destructive"
      });
    }
  });

  const handleSaveCurrentSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "نام جستجو الزامی است",
        description: "لطفاً نامی برای جستجو انتخاب کنید",
        variant: "destructive"
      });
      return;
    }

    saveSearchMutation.mutate({
      name: searchName.trim(),
      searchQuery: currentQuery,
      filters: currentFilters,
      sessionId: sessionId,
      isPublic: false
    });
  };

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch(search.searchQuery, search.filters || {});
    setIsDialogOpen(false);
    
    // Update last used (could be implemented in backend)
    // For now, just close dialog
  };

  const handleDeleteSearch = (searchId: string) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید این جستجو را حذف کنید؟")) {
      deleteSearchMutation.mutate(searchId);
    }
  };

  const canSaveCurrentSearch = currentQuery.trim().length > 0;
  const activeFiltersCount = Object.keys(currentFilters).filter(key => {
    const value = currentFilters[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).some(k => value[k] !== undefined);
    return value !== undefined && value !== '' && value !== false;
  }).length;

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2">
        {/* Save Current Search */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!canSaveCurrentSearch}
              data-testid="save-search-button"
            >
              <Save className="ml-2 h-4 w-4" />
              ذخیره جستجو
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ذخیره جستجوی فعلی</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-name">نام جستجو</Label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="نام مناسبی برای جستجو انتخاب کنید"
                  className="text-right"
                  dir="rtl"
                  data-testid="search-name-input"
                />
              </div>
              
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="font-medium mb-2">پیش‌نمایش جستجو:</div>
                <div className="space-y-1">
                  <div><strong>عبارت:</strong> "{currentQuery}"</div>
                  {activeFiltersCount > 0 && (
                    <div><strong>فیلترها:</strong> {activeFiltersCount} مورد فعال</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                  data-testid="cancel-save"
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleSaveCurrentSearch}
                  disabled={saveSearchMutation.isPending}
                  data-testid="confirm-save"
                >
                  {saveSearchMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Saved Searches */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              data-testid="view-saved-searches"
            >
              <Bookmark className="ml-2 h-4 w-4" />
              جستجوهای ذخیره شده
              {savedSearches.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {savedSearches.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>جستجوهای ذخیره شده</DialogTitle>
            </DialogHeader>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedSearches.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-lg font-medium mb-2">هیچ جستجوی ذخیره شده‌ای ندارید</div>
                <div className="text-muted-foreground">
                  جستجوهای مفید خود را ذخیره کنید تا بعداً به آنها دسترسی داشته باشید
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search: SavedSearch) => (
                  <Card key={search.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium truncate">{search.name}</h4>
                            {search.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                عمومی
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Search className="ml-1 h-3 w-3" />
                              <span className="truncate">"{search.searchQuery}"</span>
                            </div>
                            
                            {search.filters && Object.keys(search.filters).length > 0 && (
                              <div className="flex items-center">
                                <Filter className="ml-1 h-3 w-3" />
                                {Object.keys(search.filters).length} فیلتر فعال
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Calendar className="ml-1 h-3 w-3" />
                              {format(new Date(search.createdAt), 'dd/MM/yyyy')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadSearch(search)}
                            className="h-8 px-2"
                            data-testid={`load-search-${search.id}`}
                          >
                            <Search className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSearch(search.id)}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            data-testid={`delete-search-${search.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}