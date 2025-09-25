import { useState } from "react";
import { Plus, Search, Edit, Trash2, FolderTree, Hash, Loader, TreePine, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BlogCategoryForm from "@/components/BlogCategoryForm";
import type { BlogCategory } from "@shared/schema";

type BlogCategoryWithStats = BlogCategory & { postCount: number };

export default function AdminBlogCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [filterParent, setFilterParent] = useState<string>("all");
  const [filterFeatured, setFilterFeatured] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: categoriesWithStats = [], isLoading: categoriesLoading } = useQuery<BlogCategoryWithStats[]>({
    queryKey: ['/api/blog/categories/with-stats'],
  });

  const filteredCategories = categoriesWithStats.filter((category: BlogCategoryWithStats) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParent = filterParent === "all" || 
                         (filterParent === "top-level" && !category.parentId) ||
                         (filterParent === "sub-categories" && category.parentId);
    const matchesFeatured = filterFeatured === "all" ||
                           (filterFeatured === "featured" && category.featured) ||
                           (filterFeatured === "regular" && !category.featured);
    
    return matchesSearch && matchesParent && matchesFeatured;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categoriesWithStats.find((cat: BlogCategory) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => apiRequest('DELETE', `/api/blog/categories/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories/with-stats'] });
      toast({ title: "Blog category deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting blog category", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (categoryIds: string[]) => apiRequest('POST', '/api/blog/categories/bulk-delete', { ids: categoryIds }),
    onSuccess: (data: { deletedCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories/with-stats'] });
      toast({ 
        title: "Bulk delete completed", 
        description: `${data.deletedCount} blog categories deleted successfully`
      });
      setSelectedCategories([]);
      setShowBulkDelete(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error bulk deleting blog categories", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this blog category?")) {
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

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((cat: BlogCategory) => cat.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return;
    setShowBulkDelete(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedCategories);
  };

  const topLevelCategories = categoriesWithStats.filter((cat: BlogCategory) => !cat.parentId);
  const subCategories = categoriesWithStats.filter((cat: BlogCategory) => cat.parentId);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-blog-categories-title">
            Blog Categories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize your blog posts into categories ({filteredCategories.length} categories)
          </p>
        </div>
        <Button 
          className="sm:w-auto" 
          onClick={() => setShowAddForm(true)}
          data-testid="add-blog-category-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Blog Category
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search blog categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-blog-categories"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterParent} onValueChange={setFilterParent}>
                <SelectTrigger className="w-40" data-testid="filter-parent">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="top-level">Top Level</SelectItem>
                  <SelectItem value="sub-categories">Sub Categories</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                <SelectTrigger className="w-32" data-testid="filter-featured">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {filteredCategories.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onCheckedChange={handleSelectAll}
                    data-testid="select-all-blog-categories"
                  />
                  <label className="text-sm font-medium">
                    Select All ({selectedCategories.length} selected)
                  </label>
                </div>
              </div>
              {selectedCategories.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  data-testid="bulk-delete-blog-categories"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedCategories.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderTree className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoriesWithStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TreePine className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Level</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{topLevelCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Hash className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sub Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoriesWithStats.reduce((total: number, cat: BlogCategoryWithStats) => total + cat.postCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderTree className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No blog categories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? "No categories match your search criteria." : "Get started by creating your first blog category."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)} data-testid="create-first-blog-category">
                <Plus className="mr-2 h-4 w-4" />
                Create First Blog Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category: BlogCategoryWithStats) => (
            <Card key={category.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleSelectCategory(category.id)}
                      data-testid={`select-blog-category-${category.id}`}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      data-testid={`edit-blog-category-${category.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      data-testid={`delete-blog-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.name}
                    {category.featured && (
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    )}
                  </CardTitle>
                  {category.parentId && (
                    <CardDescription className="text-sm">
                      Parent: {getCategoryName(category.parentId)}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{category.postCount}</span> post{category.postCount !== 1 ? 's' : ''}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    /{category.slug}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Blog Category</DialogTitle>
          </DialogHeader>
          <BlogCategoryForm
            onSuccess={handleSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={!!editingCategory} onOpenChange={handleCloseEditModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Category</DialogTitle>
          </DialogHeader>
          <BlogCategoryForm
            category={editingCategory || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCloseEditModal}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Blog Categories</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCategories.length} selected blog categories? 
              This action cannot be undone and will affect all associated blog posts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Categories'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}