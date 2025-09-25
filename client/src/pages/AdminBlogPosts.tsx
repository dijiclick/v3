import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Eye, BookOpen, X, Filter, MoreHorizontal, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useBlogPosts, useBlogAuthors, useBlogCategories } from "@/lib/content-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { BlogPost } from "@shared/schema";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

export default function AdminBlogPosts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [bulkAction, setBulkAction] = useState("");
  const [, setLocation] = useLocation();
  const { t } = useAdminLanguage();
  
  const postsPerPage = 10;
  const offset = (currentPage - 1) * postsPerPage;

  // Build query options
  const queryOptions = {
    limit: postsPerPage,
    offset,
    ...(selectedStatus !== "all" && { status: selectedStatus }),
    ...(selectedCategory !== "all" && { categoryIds: [selectedCategory] }),
    ...(selectedAuthor !== "all" && { authorIds: [selectedAuthor] }),
    ...(searchTerm && { search: searchTerm }),
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  };

  const { data: postsResponse, isLoading } = useBlogPosts(queryOptions);
  const { data: authorsData = { authors: [], total: 0 } } = useBlogAuthors();
  const { data: categories = [] } = useBlogCategories();
  
  const authors = authorsData.authors || [];
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const posts = postsResponse?.posts || [];
  const totalPosts = postsResponse?.total || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const getAuthorName = (authorId: string | null) => {
    if (!authorId) return t('blog.unknown_author');
    const author = authors.find(a => a.id === authorId);
    return author?.name || t('blog.unknown_author');
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return t('blog.uncategorized');
    const category = categories.find(c => c.id === categoryId);
    return category?.name || t('blog.uncategorized');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return t('blog.never');
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return t('blog.invalid_date');
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest('DELETE', `/api/blog/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: t('message.success.deleted', { item: 'Blog post' }),
        description: t('blog.post_deleted'),
      });
      setDeletingPost(null);
    },
    onError: (error: any) => {
      toast({
        title: t('message.error.delete', { item: 'Blog post' }),
        description: t('blog.delete_error', { error: error.message }),
        variant: "destructive",
      });
    },
  });

  // Bulk status update mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ postIds, status }: { postIds: string[]; status: string }) => {
      const promises = postIds.map(id => {
        const updateData: Partial<BlogPost> = { status };
        if (status === 'published') {
          updateData.publishedAt = new Date().toISOString() as any;
        }
        return apiRequest('PUT', `/api/blog/posts/${id}`, updateData);
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: "Success",
        description: `Posts updated successfully!`,
      });
      setSelectedPosts(new Set());
      setBulkAction("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update posts: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (postIds: string[]) => {
      const promises = postIds.map(id => apiRequest('DELETE', `/api/blog/posts/${id}`));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: "Success",
        description: `Posts deleted successfully!`,
      });
      setSelectedPosts(new Set());
      setBulkAction("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete posts: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeletePost = (post: BlogPost) => {
    setDeletingPost(post);
  };

  const confirmDelete = () => {
    if (deletingPost) {
      deleteMutation.mutate(deletingPost.id);
    }
  };

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    }
  };

  const handleBulkAction = () => {
    const postIds = Array.from(selectedPosts);
    if (postIds.length === 0) return;

    switch (bulkAction) {
      case 'publish':
        bulkStatusMutation.mutate({ postIds, status: 'published' });
        break;
      case 'draft':
        bulkStatusMutation.mutate({ postIds, status: 'draft' });
        break;
      case 'archive':
        bulkStatusMutation.mutate({ postIds, status: 'archived' });
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${postIds.length} selected posts?`)) {
          bulkDeleteMutation.mutate(postIds);
        }
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setSelectedAuthor("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedStatus !== "all" || selectedCategory !== "all" || selectedAuthor !== "all";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-blog-posts-title">
            Blog Posts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your blog content ({totalPosts} posts)
          </p>
        </div>
        <Button 
          className="sm:w-auto" 
          onClick={() => setLocation("/admin/blog/new")}
          data-testid="add-post-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]" data-testid="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]" data-testid="category-filter">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Author Filter */}
            <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
              <SelectTrigger className="w-[180px]" data-testid="author-filter">
                <SelectValue placeholder="All authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                data-testid="clear-filters-button"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedPosts.size} selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[180px]" data-testid="bulk-action-select">
                  <SelectValue placeholder="Bulk actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="draft">Move to Draft</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkStatusMutation.isPending || bulkDeleteMutation.isPending}
                data-testid="apply-bulk-action"
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Posts</span>
            {posts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
                data-testid="select-all-button"
              >
                {selectedPosts.size === posts.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {hasActiveFilters ? "No posts match your filters" : "No blog posts yet"}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clear the filters."
                  : "Get started by creating your first blog post."
                }
              </p>
              {!hasActiveFilters && (
                <Button
                  className="mt-6"
                  onClick={() => setLocation("/admin/blog/new")}
                  data-testid="create-first-post-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`post-row-${post.id}`}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedPosts.has(post.id)}
                    onCheckedChange={() => handleSelectPost(post.id)}
                    data-testid={`select-post-${post.id}`}
                  />

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <Badge className={getStatusColor(post.status)} data-testid={`post-status-badge-${post.id}`}>
                        {post.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {getAuthorName(post.authorId)}</span>
                      <span>{getCategoryName(post.categoryId)}</span>
                      <span>Created {formatDate(post.createdAt)}</span>
                      {post.publishedAt && (
                        <span>Published {formatDate(post.publishedAt)}</span>
                      )}
                      {post.viewCount !== undefined && (
                        <span>{post.viewCount} views</span>
                      )}
                    </div>

                    {post.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/admin/blog/edit/${post.id}`)}
                      data-testid={`edit-post-${post.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {post.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        data-testid={`view-post-${post.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`post-menu-${post.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDeletePost(post)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {offset + 1}-{Math.min(offset + postsPerPage, totalPosts)} of {totalPosts} posts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  data-testid="prev-page-button"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="next-page-button"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPost} onOpenChange={() => setDeletingPost(null)}>
        <AlertDialogContent data-testid="delete-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}