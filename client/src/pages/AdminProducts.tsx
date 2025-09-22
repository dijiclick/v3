import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Star, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProducts, useCategories } from "@/lib/content-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import ProductForm from "@/components/ProductForm";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
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
        title: "Success",
        description: "Product deleted successfully!",
      });
      setDeletingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product as any);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
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
          onClick={() => setShowAddForm(true)}
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

      {/* Products Grid */}
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
              <Button data-testid="add-first-product">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="products-grid">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="destructive">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0" data-testid={`view-product-${product.id}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setEditingProduct(product as any)}
                    data-testid={`edit-product-${product.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-8 w-8 p-0" 
                    onClick={() => handleDeleteProduct(product as any)}
                    data-testid={`delete-product-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryName(product.categoryId)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${product.price}
                      </span>
                      {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    {product.rating && parseFloat(product.rating) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span className="text-xs text-gray-500">
                          {product.rating} ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSuccess={() => setEditingProduct(null)}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-product"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}