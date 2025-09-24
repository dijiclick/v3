import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Star, Package, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProducts, useCategories } from "@/lib/content-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [, setLocation] = useLocation();
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "موفق",
        description: "محصول با موفقیت حذف شد!",
      });
      setDeletingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: "خطا در حذف محصول",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ productId, inStock }: { productId: string; inStock: boolean }) => {
      return apiRequest('PATCH', `/api/products/${productId}`, { inStock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product status updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update product status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest('POST', `/api/products/${productId}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "موفق",
        description: "محصول با موفقیت کپی شد!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: `خطا در کپی کردن محصول: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product as any);
  };

  const handleDuplicateProduct = (product: Product) => {
    duplicateMutation.mutate(product.id);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="ltr">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-products-title">
            Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your product catalog ({filteredProducts.length} products)
          </p>
        </div>
        <Button 
          className="sm:w-auto" 
          onClick={() => setLocation("/admin/products/add")}
          data-testid="add-product-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-products"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="filter-category"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your filters" 
                : "Get started by creating your first product"}
            </p>
            {(!searchTerm && selectedCategory === "all") && (
              <Button 
                onClick={() => setLocation("/admin/products/add")}
                data-testid="add-first-product"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-gray-50 dark:bg-gray-800">
              <div className="col-span-4 text-sm font-medium text-gray-700 dark:text-gray-300">Product</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Category</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Price</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">Actions</div>
            </div>
            
            {/* Product List */}
            <div className="divide-y" data-testid="products-list">
              {filteredProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {/* Product Info (Image + Title) */}
                  <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        onClick={() => setLocation(`/admin/products/edit/${product.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setLocation(`/admin/products/edit/${product.id}`);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Edit product: ${product.title}`}
                        data-testid={`product-title-${product.id}`}
                      >
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {product.description?.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.round(parseFloat(product.price)).toLocaleString('fa-IR')} T
                      </span>
                      {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                        <span className="text-sm text-gray-500 line-through">
                          {Math.round(parseFloat(product.originalPrice)).toLocaleString('fa-IR')} T
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <div className="flex flex-col gap-2">
                      {product.featured && (
                        <Badge variant="warning" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Select
                        value={product.inStock ? "published" : "unpublished"}
                        onValueChange={(value) => {
                          const inStock = value === "published";
                          updateStatusMutation.mutate({ productId: product.id, inStock });
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="unpublished">Unpublished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 w-8 p-0" 
                      onClick={() => setLocation(`/admin/products/edit/${product.id}`)}
                      data-testid={`edit-product-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleDuplicateProduct(product as any)}
                      disabled={duplicateMutation.isPending}
                      title="کپی محصول"
                      aria-label="کپی محصول"
                      data-testid={`duplicate-product-${product.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleDeleteProduct(product as any)}
                      title="حذف محصول"
                      aria-label="حذف محصول"
                      data-testid={`delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید محصول "{deletingProduct?.title}" را حذف کنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>لغو</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-product"
            >
              {deleteMutation.isPending ? "در حال حذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}