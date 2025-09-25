import { useState } from "react";
import { Plus, Search, Edit, Trash2, Hash, Loader, Tags, TrendingUp, Palette } from "lucide-react";
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
import BlogTagForm from "@/components/BlogTagForm";
import type { BlogTag } from "@shared/schema";

type BlogTagWithStats = BlogTag & { usageCount: number };

export default function AdminBlogTags() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTagWithStats | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tagsWithStats = [], isLoading: tagsLoading } = useQuery<BlogTagWithStats[]>({
    queryKey: ['/api/blog/tags/with-stats'],
  });

  const filteredAndSortedTags = tagsWithStats
    .filter((tag: BlogTagWithStats) => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFeatured = filterFeatured === "all" ||
                             (filterFeatured === "featured" && tag.featured) ||
                             (filterFeatured === "regular" && !tag.featured);
      
      return matchesSearch && matchesFeatured;
    })
    .sort((a: BlogTagWithStats, b: BlogTagWithStats) => {
      switch (sortBy) {
        case "usage":
          return b.usageCount - a.usageCount;
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: (tagId: string) => apiRequest('DELETE', `/api/blog/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags/with-stats'] });
      toast({ title: "Blog tag deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting blog tag", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (tagIds: string[]) => apiRequest('POST', '/api/blog/tags/bulk-delete', { ids: tagIds }),
    onSuccess: (data: { deletedCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags/with-stats'] });
      toast({ 
        title: "Bulk delete completed", 
        description: `${data.deletedCount} blog tags deleted successfully`
      });
      setSelectedTags([]);
      setShowBulkDelete(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error bulk deleting blog tags", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const handleEditTag = (tag: BlogTagWithStats) => {
    setEditingTag(tag);
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm("Are you sure you want to delete this blog tag?")) {
      deleteMutation.mutate(tagId);
    }
  };

  const handleCloseEditModal = () => {
    setEditingTag(null);
  };

  const handleSuccess = () => {
    setShowAddForm(false);
    setEditingTag(null);
  };

  const handleSelectTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTags.length === filteredAndSortedTags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(filteredAndSortedTags.map((tag: BlogTag) => tag.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTags.length === 0) return;
    setShowBulkDelete(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedTags);
  };

  const totalUsage = tagsWithStats.reduce((total: number, tag: BlogTagWithStats) => total + tag.usageCount, 0);
  const featuredTags = tagsWithStats.filter((tag: BlogTag) => tag.featured);
  const mostUsedTag = tagsWithStats.reduce((max: BlogTagWithStats | null, tag: BlogTagWithStats) => 
    !max || tag.usageCount > max.usageCount ? tag : max, null);

  if (tagsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-blog-tags-title">
            Blog Tags
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your blog post tags and categorization ({filteredAndSortedTags.length} tags)
          </p>
        </div>
        <Button 
          className="sm:w-auto" 
          onClick={() => setShowAddForm(true)}
          data-testid="add-blog-tag-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Blog Tag
        </Button>
      </div>

      {/* Search, Filters and Sort */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search blog tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-blog-tags"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="sort-tags">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="usage">Most Used</SelectItem>
                  <SelectItem value="created">Recently Created</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                <SelectTrigger className="w-32" data-testid="filter-featured-tags">
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
      {filteredAndSortedTags.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTags.length === filteredAndSortedTags.length && filteredAndSortedTags.length > 0}
                    onCheckedChange={handleSelectAll}
                    data-testid="select-all-blog-tags"
                  />
                  <label className="text-sm font-medium">
                    Select All ({selectedTags.length} selected)
                  </label>
                </div>
              </div>
              {selectedTags.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  data-testid="bulk-delete-blog-tags"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedTags.length})
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
              <Hash className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tags</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tagsWithStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Tags className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured Tags</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{featuredTags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Palette className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Used</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {mostUsedTag ? mostUsedTag.name : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Cloud Visualization */}
      {tagsWithStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Tag Cloud
            </CardTitle>
            <CardDescription>
              Visual representation of tag popularity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tagsWithStats.slice(0, 20).map((tag: BlogTagWithStats) => {
                const maxUsage = Math.max(...tagsWithStats.map((t: BlogTagWithStats) => t.usageCount));
                const size = Math.max(0.8, (tag.usageCount / Math.max(maxUsage, 1)) * 2);
                return (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#3B82F620',
                      borderColor: tag.color || '#3B82F6',
                      fontSize: `${size * 0.75}rem`,
                      padding: `${size * 0.25}rem ${size * 0.5}rem`,
                    }}
                    onClick={() => handleEditTag(tag)}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag.name} ({tag.usageCount})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Grid */}
      {filteredAndSortedTags.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Hash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No blog tags found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? "No tags match your search criteria." : "Get started by creating your first blog tag."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)} data-testid="create-first-blog-tag">
                <Plus className="mr-2 h-4 w-4" />
                Create First Blog Tag
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredAndSortedTags.map((tag: BlogTagWithStats) => (
            <Card key={tag.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleSelectTag(tag.id)}
                      data-testid={`select-blog-tag-${tag.id}`}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color || '#3B82F6' }}
                    />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTag(tag)}
                      data-testid={`edit-blog-tag-${tag.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTag(tag.id)}
                      data-testid={`delete-blog-tag-${tag.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {tag.name}
                    {tag.featured && (
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {tag.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {tag.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{tag.usageCount}</span> usage{tag.usageCount !== 1 ? 's' : ''}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    /{tag.slug}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Tag Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Blog Tag</DialogTitle>
          </DialogHeader>
          <BlogTagForm
            onSuccess={handleSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={!!editingTag} onOpenChange={handleCloseEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Tag</DialogTitle>
          </DialogHeader>
          <BlogTagForm
            tag={editingTag || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCloseEditModal}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Blog Tags</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTags.length} selected blog tags? 
              This action cannot be undone and will remove these tags from all associated blog posts.
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
                'Delete Tags'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}