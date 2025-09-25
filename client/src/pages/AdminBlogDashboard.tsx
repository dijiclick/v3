import { BookOpen, Edit, Eye, TrendingUp, Users, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useBlogPosts, useBlogAuthors, useBlogCategories } from "@/lib/content-service";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@shared/schema";

export default function AdminBlogDashboard() {
  const { data: allPosts = [], isLoading: postsLoading } = useBlogPosts({ 
    limit: 1000, // Get all posts for statistics
    status: 'all' 
  });
  const { data: recentPostsResponse, isLoading: recentLoading } = useBlogPosts({ 
    limit: 10,
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { data: authors = [] } = useBlogAuthors();
  const { data: categories = [] } = useBlogCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishedPosts = allPosts.posts?.filter(post => post.status === 'published') || [];
  const draftPosts = allPosts.posts?.filter(post => post.status === 'draft') || [];
  const totalViews = allPosts.posts?.reduce((sum, post) => sum + (post.viewCount || 0), 0) || 0;
  const recentPosts = recentPostsResponse?.posts || [];

  // Mutation for quick status updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: string }) => {
      const updateData: Partial<BlogPost> = { status };
      if (status === 'published') {
        updateData.publishedAt = new Date().toISOString() as any;
      }
      return apiRequest('PUT', `/api/blog/posts/${postId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({
        title: "Success",
        description: "Post status updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update post status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const stats = [
    {
      title: "Total Posts",
      value: allPosts.total || 0,
      description: "All blog posts",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/blog/posts"
    },
    {
      title: "Published Posts",
      value: publishedPosts.length,
      description: "Live on website",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/blog/posts?status=published"
    },
    {
      title: "Draft Posts",
      value: draftPosts.length,
      description: "Unpublished drafts",
      icon: Edit,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/admin/blog/posts?status=draft"
    },
    {
      title: "Total Views",
      value: totalViews,
      description: "All-time page views",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/blog/posts"
    }
  ];

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

  const getAuthorName = (authorId: string | null) => {
    if (!authorId) return "Unknown Author";
    const author = authors.find(a => a.id === authorId);
    return author?.name || "Unknown Author";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const handleStatusChange = (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate({ postId, status: newStatus });
  };

  if (postsLoading || recentLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-blog-dashboard-title">
            Blog Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your blog content and track performance
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="sm:w-auto" data-testid="add-post-button">
            <Plus className="mr-2 h-4 w-4" />
            Add New Post
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`stats-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Posts and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Recent Posts
                </CardTitle>
                <CardDescription>
                  Latest blog posts and their status
                </CardDescription>
              </div>
              <Link href="/admin/blog/posts">
                <Button variant="outline" size="sm" data-testid="view-all-posts">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating your first blog post.
                </p>
                <div className="mt-6">
                  <Link href="/admin/blog/new">
                    <Button data-testid="create-first-post">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid={`recent-post-${post.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h4>
                        <Badge className={getStatusColor(post.status)} data-testid={`post-status-${post.id}`}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>By {getAuthorName(post.authorId)}</span>
                        <span>{getCategoryName(post.categoryId)}</span>
                        <span>{formatDate(post.createdAt)}</span>
                        {post.viewCount !== undefined && (
                          <span>{post.viewCount} views</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(post.id, post.status)}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`toggle-status-${post.id}`}
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Link href={`/admin/blog/edit/${post.id}`}>
                        <Button variant="ghost" size="sm" data-testid={`edit-post-${post.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {post.status === 'published' && (
                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="ghost" size="sm" data-testid={`view-post-${post.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Overview
            </CardTitle>
            <CardDescription>
              Authors, categories and content overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Authors & Categories */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {authors.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Authors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Categories
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/admin/blog/new" className="block">
                    <Button variant="outline" className="w-full justify-start" data-testid="quick-create-post">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Post
                    </Button>
                  </Link>
                  <Link href="/admin/blog/posts" className="block">
                    <Button variant="outline" className="w-full justify-start" data-testid="quick-manage-posts">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage All Posts
                    </Button>
                  </Link>
                  <Link href="/admin/blog/categories" className="block">
                    <Button variant="outline" className="w-full justify-start" data-testid="quick-manage-categories">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Categories
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Performance Insights */}
              {publishedPosts.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Avg. views per post</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Published vs Draft ratio</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round((publishedPosts.length / (allPosts.total || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}