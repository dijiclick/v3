import { useState } from "react";
import { Plus, Search, Edit, Trash2, FolderTree, Tag, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCategories, useProducts } from "@/lib/content-service";
import CategoryForm from "@/components/CategoryForm";
import type { Category } from "@shared/schema";

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: products = [] } = useProducts();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId).length;
  };

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => apiRequest('DELETE', `/api/categories/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting category", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(categoryId);
    }
  };

  const handleCloseEditModal = () => {
    setEditingCategory(null);
  };

  const handleSuccess = () => {
    setShowAddForm(false);
    setEditingCategory(null);
  };

  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-categories-title">
            Categories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize your products into categories ({filteredCategories.length} categories)
          </p>
        </div>
        <Button 
          className="sm:w-auto" 
          onClick={() => setShowAddForm(true)}
          data-testid="add-category-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-categories"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderTree className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? "Try a different search term" 
                : "Get started by creating your first category"}
            </p>
            {!searchTerm && (
              <Button data-testid="add-first-category">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="categories-grid">
          {filteredCategories.map((category) => {
            const productCount = getCategoryProductCount(category.id);
            
            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {category.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {productCount} {productCount === 1 ? 'product' : 'products'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        data-testid={`edit-category-${category.id}`}
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700" 
                        data-testid={`delete-category-${category.id}`}
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {category.description && (
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {category.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Created {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`manage-products-${category.id}`}>
                      Manage Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={handleSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => { if (!open) setEditingCategory(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSuccess={handleSuccess}
              onCancel={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}