import { useState } from "react";
import { Plus, Search, Edit, Trash2, FileText, Eye, Loader, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PageForm from "@/components/PageForm";
import type { Page, InsertPage } from "@shared/schema";


export default function AdminPages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [viewingPage, setViewingPage] = useState<Page | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  
  // Fetch pages from API
  const { data: pages = [], isLoading, error } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
  });
  
  // Delete page mutation
  const deleteMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest('DELETE', `/api/pages/${pageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({ title: "Page deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting page", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });
  
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (page.excerpt && page.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || page.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleDeletePage = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate(pageId);
    }
  };

  const handleViewPage = (page: Page) => {
    setViewingPage(page);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
  };

  const handleCloseViewModal = () => {
    setViewingPage(null);
  };

  const handleCloseEditModal = () => {
    setEditingPage(null);
  };

  const handleAddPageSuccess = () => {
    setShowAddForm(false);
    setEditingPage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-pages-title">
            Pages
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your website content pages ({filteredPages.length} pages)
          </p>
        </div>
        <Button 
          className="sm:w-auto" 
          data-testid="add-page-button"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Page
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
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-pages"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="filter-status"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Card className="text-center py-12">
          <CardContent>
            <Loader className="mx-auto h-8 w-8 text-gray-400 mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading pages...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium text-green-600 mb-2">
              Error loading pages
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {(error as Error).message || "Something went wrong"}
            </p>
          </CardContent>
        </Card>
      ) : filteredPages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No pages found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters" 
                : "Get started by creating your first page"}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Button 
                data-testid="add-first-page"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Page
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" data-testid="pages-list">
          {filteredPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleEditPage(page)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleEditPage(page);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        data-testid={`page-title-${page.id}`}
                        aria-label={`Edit page: ${page.title}`}
                      >
                        {page.title}
                      </h3>
                      <Badge 
                        variant={page.status === "published" ? "default" : "secondary"}
                        className={page.status === "published" 
                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }
                      >
                        {page.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {page.excerpt || 'No description'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Slug: /{page.slug}</span>
                      <span>•</span>
                      <span>Created {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span>•</span>
                      <span>Updated {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      data-testid={`view-page-${page.id}`}
                      onClick={() => handleViewPage(page)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      data-testid={`edit-page-${page.id}`}
                      onClick={() => handleEditPage(page)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      data-testid={`delete-page-${page.id}`}
                      onClick={() => handleDeletePage(page.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Page Dialog */}
      <Dialog open={!!viewingPage} onOpenChange={(open) => { if (!open) setViewingPage(null); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Page Preview: {viewingPage?.title}</DialogTitle>
            <DialogDescription>
              Preview of page content and metadata
            </DialogDescription>
          </DialogHeader>
          {viewingPage && (
            <div className="space-y-6">
              {/* Page Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Page Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Title:</strong> {viewingPage.title}</p>
                    <p><strong>Slug:</strong> /{viewingPage.slug}</p>
                    <p><strong>Status:</strong> 
                      <Badge className="ml-2" variant={viewingPage.status === "published" ? "default" : "secondary"}>
                        {viewingPage.status}
                      </Badge>
                    </p>
                    <p><strong>Show in Navigation:</strong> {viewingPage.showInNavigation ? "Yes" : "No"}</p>
                    {viewingPage.navigationOrder !== undefined && viewingPage.showInNavigation && (
                      <p><strong>Navigation Order:</strong> {viewingPage.navigationOrder}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Dates</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Created:</strong> {viewingPage.createdAt ? new Date(viewingPage.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Updated:</strong> {viewingPage.updatedAt ? new Date(viewingPage.updatedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {viewingPage.excerpt || 'No description'}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {typeof viewingPage.content === 'string' 
                      ? viewingPage.content 
                      : JSON.stringify(viewingPage.content, null, 2) || 'No content'}
                  </pre>
                </div>
              </div>

              {/* SEO Info */}
              {(viewingPage.seoTitle || viewingPage.seoDescription || viewingPage.seoKeywords?.length) && (
                <div>
                  <h4 className="font-medium mb-2">SEO Information</h4>
                  <div className="space-y-1 text-sm">
                    {viewingPage.seoTitle && <p><strong>SEO Title:</strong> {viewingPage.seoTitle}</p>}
                    {viewingPage.seoDescription && <p><strong>SEO Description:</strong> {viewingPage.seoDescription}</p>}
                    {viewingPage.seoKeywords?.length && (
                      <p><strong>SEO Keywords:</strong> {viewingPage.seoKeywords.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseViewModal}>
                  Close
                </Button>
                <Button onClick={() => { setViewingPage(null); handleEditPage(viewingPage); }}>
                  Edit Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => { if (!open) setEditingPage(null); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>
              Update the page content and settings
            </DialogDescription>
          </DialogHeader>
          {editingPage && (
            <PageForm
              page={editingPage}
              onSuccess={handleAddPageSuccess}
              onCancel={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Page Dialog */}
      <Dialog open={showAddForm} onOpenChange={(open) => setShowAddForm(open)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new content page for your website
            </DialogDescription>
          </DialogHeader>
          <PageForm
            onSuccess={handleAddPageSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}