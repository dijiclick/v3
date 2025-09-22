import { useState, useMemo } from "react";
import { Search, Grid, List, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductCard from "./ProductCard";
import { Product, Category, FilterState } from "@/types";
import { useProducts, useCategories } from "@/lib/content-service";

export default function ProductCatalog() {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000],
    rating: null,
    search: "",
  });
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (filters.search && !product.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && (!product.categoryId || !filters.categories.includes(product.categoryId))) {
        return false;
      }

      // Price range filter
      const price = parseFloat(product.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.rating && (!product.rating || parseFloat(product.rating) < filters.rating)) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "rating":
        filtered.sort((a, b) => {
          const ratingA = a.rating ? parseFloat(a.rating) : 0;
          const ratingB = b.rating ? parseFloat(b.rating) : 0;
          return ratingB - ratingA;
        });
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      default: // featured
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return filtered;
  }, [products, filters, sortBy]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]]
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000],
      rating: null,
      search: "",
    });
  };

  // Handle loading states
  if (productsLoading || categoriesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error states
  if (productsError || categoriesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="destructive" data-testid="content-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {productsError ? "Failed to load products. " : ""}
            {categoriesError ? "Failed to load categories. " : ""}
            Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4 space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" data-testid="filters-title">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters">
                Clear All
              </Button>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <Label htmlFor="search" className="block text-sm font-medium mb-2">Search</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                  data-testid="filter-search"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-3" data-testid="categories-filter-title">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                      data-testid={`category-filter-${category.id}`}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3" data-testid="price-filter-title">Price Range</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="w-20"
                    data-testid="price-min-input"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([filters.priceRange[0], parseInt(e.target.value) || 1000])}
                    className="w-20"
                    data-testid="price-max-input"
                  />
                </div>
                <Slider
                  value={filters.priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={1000}
                  step={10}
                  className="w-full"
                  data-testid="price-range-slider"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="font-medium mb-3" data-testid="rating-filter-title">Minimum Rating</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, rating: checked ? rating : null }))}
                      data-testid={`rating-filter-${rating}`}
                    />
                    <Label 
                      htmlFor={`rating-${rating}`}
                      className="text-sm cursor-pointer"
                    >
                      {rating}+ Stars
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Section */}
        <div className="lg:w-3/4">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold" data-testid="products-title">Products</h2>
              <p className="text-muted-foreground" data-testid="products-count">
                Showing {filteredAndSortedProducts.length} of {products.length} products
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="grid-view-button"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="list-view-button"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2" data-testid="no-products-title">
                No products found
              </h3>
              <p className="text-muted-foreground" data-testid="no-products-description">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`} data-testid="products-grid">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination - Simple placeholder for now */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <Button variant="outline" size="sm" data-testid="pagination-prev">
                  Previous
                </Button>
                <Button size="sm" data-testid="pagination-1">1</Button>
                <Button variant="outline" size="sm" data-testid="pagination-2">2</Button>
                <Button variant="outline" size="sm" data-testid="pagination-3">3</Button>
                <span className="px-3 py-2 text-muted-foreground">...</span>
                <Button variant="outline" size="sm" data-testid="pagination-last">7</Button>
                <Button variant="outline" size="sm" data-testid="pagination-next">
                  Next
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
