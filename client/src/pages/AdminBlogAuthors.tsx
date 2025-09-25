import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Eye, User, X, Filter, MoreHorizontal, CheckSquare, Square, Users, FileText, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlogAuthors } from "@/lib/content-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { BlogAuthor } from "@shared/schema";

export default function AdminBlogAuthors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFeatured, setSelectedFeatured] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());
  const [deletingAuthor, setDeletingAuthor] = useState<BlogAuthor | null>(null);
  const [bulkAction, setBulkAction] = useState("");
  const [, setLocation] = useLocation();
  
  const authorsPerPage = 12;
  const offset = (currentPage - 1) * authorsPerPage;

  // Build query options
  const queryOptions = {
    limit: authorsPerPage,
    offset,
    ...(selectedStatus !== "all" && { active: selectedStatus === "active" }),
    ...(selectedFeatured !== "all" && { featured: selectedFeatured === "featured" }),
    ...(searchTerm && { search: searchTerm }),
    sortBy: "name",
    sortOrder: "asc" as const,
  };

  const { data: authorsResponse, isLoading } = useBlogAuthors(queryOptions);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const authors = authorsResponse?.authors || [];
  const totalAuthors = authorsResponse?.total || 0;
  const totalPages = Math.ceil(totalAuthors / authorsPerPage);

  const getStatusColor = (active: boolean) => {
    return active 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (authorId: string) => {
      return apiRequest('DELETE', `/api/blog/authors/${authorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/authors'] });
      toast({
        title: "Success",
        description: "Blog author deleted successfully!",
      });
      setDeletingAuthor(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete blog author: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bulk status update mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ authorIds, active }: { authorIds: string[]; active: boolean }) => {
      const promises = authorIds.map(id => {
        const updateData: Partial<BlogAuthor> = { active };
        return apiRequest('PUT', `/api/blog/authors/${id}`, updateData);
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/authors'] });
      toast({
        title: "Success",
        description: "Authors updated successfully!",
      });
      setSelectedAuthors(new Set());
      setBulkAction("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update authors: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bulk feature update mutation
  const bulkFeatureMutation = useMutation({
    mutationFn: async ({ authorIds, featured }: { authorIds: string[]; featured: boolean }) => {
      const promises = authorIds.map(id => {
        const updateData: Partial<BlogAuthor> = { featured };
        return apiRequest('PUT', `/api/blog/authors/${id}`, updateData);
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/authors'] });
      toast({
        title: "Success",
        description: "Authors updated successfully!",
      });
      setSelectedAuthors(new Set());
      setBulkAction("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update authors: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (authorIds: string[]) => {
      return apiRequest('POST', '/api/blog/authors/bulk-delete', { ids: authorIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/authors'] });
      toast({
        title: "Success",
        description: "Authors deleted successfully!",
      });
      setSelectedAuthors(new Set());
      setBulkAction("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete authors: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedAuthors.size === authors.length) {
      setSelectedAuthors(new Set());
    } else {
      setSelectedAuthors(new Set(authors.map(author => author.id)));
    }
  };

  const handleSelectAuthor = (authorId: string) => {
    const newSelected = new Set(selectedAuthors);
    if (newSelected.has(authorId)) {
      newSelected.delete(authorId);
    } else {
      newSelected.add(authorId);
    }
    setSelectedAuthors(newSelected);
  };

  const handleBulkAction = () => {
    const selectedIds = Array.from(selectedAuthors);
    if (selectedIds.length === 0) return;

    switch (bulkAction) {
      case "activate":
        bulkStatusMutation.mutate({ authorIds: selectedIds, active: true });
        break;
      case "deactivate":
        bulkStatusMutation.mutate({ authorIds: selectedIds, active: false });
        break;
      case "feature":
        bulkFeatureMutation.mutate({ authorIds: selectedIds, featured: true });
        break;
      case "unfeature":
        bulkFeatureMutation.mutate({ authorIds: selectedIds, featured: false });
        break;
      case "delete":
        bulkDeleteMutation.mutate(selectedIds);
        break;
    }
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" data-testid="page-title">Blog Authors</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" data-testid="page-title">Blog Authors</h1>
        <Button 
          onClick={() => setLocation('/admin/blog/authors/new')}
          data-testid="button-add-author"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFeatured} onValueChange={setSelectedFeatured}>
              <SelectTrigger className="w-[140px]" data-testid="select-featured">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAuthors.size > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedAuthors.size} author{selectedAuthors.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[160px]" data-testid="select-bulk-action">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="deactivate">Deactivate</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="unfeature">Unfeature</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  data-testid="button-apply-bulk"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAuthors(new Set())}
                  data-testid="button-clear-selection"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authors Grid */}
      {authors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No authors found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first author"}
            </p>
            <Button onClick={() => setLocation('/admin/blog/authors/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Author
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={selectedAuthors.size === authors.length && authors.length > 0}
              onCheckedChange={handleSelectAll}
              data-testid="checkbox-select-all"
            />
            <span className="text-sm text-gray-600">
              Select all {authors.length} author{authors.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {authors.map((author) => (
              <Card key={author.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Checkbox
                      checked={selectedAuthors.has(author.id)}
                      onCheckedChange={() => handleSelectAuthor(author.id)}
                      data-testid={`checkbox-author-${author.id}`}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`menu-author-${author.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/admin/blog/authors/edit/${author.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/blog/author/${author.slug}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingAuthor(author)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={author.avatar || ''} alt={author.name} />
                      <AvatarFallback className="text-lg">
                        {getAuthorInitials(author.name)}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="font-semibold text-lg mb-1" data-testid={`text-author-name-${author.id}`}>
                      {author.name}
                    </h3>
                    
                    {author.jobTitle && (
                      <p className="text-sm text-gray-600 mb-2" data-testid={`text-author-job-${author.id}`}>
                        {author.jobTitle}
                        {author.company && ` at ${author.company}`}
                      </p>
                    )}

                    {author.bio && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2" data-testid={`text-author-bio-${author.id}`}>
                        {author.bio}
                      </p>
                    )}

                    <div className="flex justify-center gap-2 mb-4">
                      <Badge variant={author.active ? "default" : "secondary"} className={getStatusColor(author.active)}>
                        {author.active ? "Active" : "Inactive"}
                      </Badge>
                      {author.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(author.createdAt)}
                      </div>
                      {author.email && (
                        <div className="truncate" title={author.email}>
                          {author.email}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Showing {offset + 1} to {Math.min(offset + authorsPerPage, totalAuthors)} of {totalAuthors} authors
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAuthor} onOpenChange={() => setDeletingAuthor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAuthor?.name}"? This action cannot be undone.
              All blog posts by this author will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingAuthor && deleteMutation.mutate(deletingAuthor.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}