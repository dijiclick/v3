import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Eye, ArrowLeft, Plus, X, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlogPost, useBlogAuthors, useBlogCategories, useBlogTags } from "@/lib/content-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogPostSchema } from "@shared/schema";
import type { BlogPost } from "@shared/schema";
import AdvancedBlogEditor from "@/components/AdvancedBlogEditor";
import BlogContentRenderer from "@/components/BlogContentRenderer";

// Form schema extending the base schema with UI-specific fields
const blogPostFormSchema = insertBlogPostSchema.extend({
  publishNow: z.boolean().optional().default(false),
  newTags: z.array(z.string()).optional().default([]),
});

type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

export default function AdminBlogEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/blog/edit/:id");
  const [newTagInput, setNewTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const isEditing = Boolean(params?.id);
  const postId = params?.id;
  
  const { data: post, isLoading: postLoading } = useBlogPost(postId || "");
  const { data: authorsData = { authors: [], total: 0 } } = useBlogAuthors();
  const { data: categories = [] } = useBlogCategories();
  const { data: tags = [] } = useBlogTags();
  
  const authors = authorsData.authors || [];
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: {},
      authorId: "",
      categoryId: "",
      tags: [],
      featuredImage: "",
      featuredImageAlt: "",
      status: "draft",
      featured: false,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      publishNow: false,
      newTags: [],
    },
  });

  // Update available tags when tags data changes
  useEffect(() => {
    if (tags.length > 0) {
      setAvailableTags(tags.map(tag => tag.slug));
    }
  }, [tags]);

  // Load post data when editing
  useEffect(() => {
    if (post && isEditing) {
      form.reset({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || {},
        authorId: post.authorId || "",
        categoryId: post.categoryId || "",
        tags: post.tags || [],
        featuredImage: post.featuredImage || "",
        featuredImageAlt: post.featuredImageAlt || "",
        status: post.status || "draft",
        featured: post.featured || false,
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        seoKeywords: post.seoKeywords || [],
        ogTitle: post.ogTitle || "",
        ogDescription: post.ogDescription || "",
        ogImage: post.ogImage || "",
        publishNow: false,
        newTags: [],
      });
    }
  }, [post, isEditing, form]);

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle && !isEditing) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchTitle, form, isEditing]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const submitData = {
        ...data,
        // Handle publish now logic
        status: data.publishNow ? 'published' : data.status,
        // Remove UI-only fields
        publishNow: undefined,
        newTags: undefined,
      };

      if (isEditing && postId) {
        const response = await apiRequest('PUT', `/api/blog/posts/${postId}`, submitData);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/blog/posts', submitData);
        return response.json();
      }
    },
    onSuccess: (savedPost) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      if (!isEditing && savedPost?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/blog/posts', savedPost.id] });
      }
      toast({
        title: "Success",
        description: `Blog post ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      setLocation("/admin/blog/posts");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} blog post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BlogPostFormData) => {
    // Add any new tags to the tags array
    const allTags = [...(data.tags || []), ...(data.newTags || [])];
    const uniqueTags = Array.from(new Set(allTags.filter(Boolean)));
    
    saveMutation.mutate({
      ...data,
      tags: uniqueTags,
    });
  };

  const addNewTag = () => {
    if (!newTagInput.trim()) return;
    
    const slug = newTagInput.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const currentNewTags = form.getValues("newTags") || [];
    const currentTags = form.getValues("tags") || [];
    
    if (!currentTags.includes(slug) && !currentNewTags.includes(slug)) {
      form.setValue("newTags", [...currentNewTags, slug]);
      setNewTagInput("");
    }
  };

  const removeNewTag = (tagToRemove: string) => {
    const currentNewTags = form.getValues("newTags") || [];
    form.setValue("newTags", currentNewTags.filter(tag => tag !== tagToRemove));
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addExistingTag = (tagSlug: string) => {
    const currentTags = form.getValues("tags") || [];
    const newTags = form.getValues("newTags") || [];
    
    if (!currentTags.includes(tagSlug) && !newTags.includes(tagSlug)) {
      form.setValue("tags", [...currentTags, tagSlug]);
    }
  };

  if (postLoading && isEditing) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin/blog/posts")}
            data-testid="back-to-posts"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="editor-title">
              {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? `Editing: ${post?.title}` : "Create and publish your blog post"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && post?.status === 'published' && (
            <Button
              variant="outline"
              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              data-testid="preview-post"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={saveMutation.isPending}
            data-testid="save-post"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                  <CardDescription>
                    Basic information about your blog post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter post title" data-testid="title-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="post-url-slug" data-testid="slug-input" />
                        </FormControl>
                        <FormDescription>
                          URL-friendly version of the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description of your post"
                            className="min-h-[100px]"
                            data-testid="excerpt-textarea"
                          />
                        </FormControl>
                        <FormDescription>
                          Short summary that appears in post listings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Advanced Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>محتوای مطلب</CardTitle>
                  <CardDescription>
                    ویرایشگر پیشرفته برای نوشتن محتوای وبلاگ با پشتیبانی کامل از زبان فارسی
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <AdvancedBlogEditor
                            value={typeof field.value === 'string' ? field.value : 
                                   (field.value && typeof field.value === 'object' ? JSON.stringify(field.value) : '')}
                            onChange={(htmlContent) => {
                              // Store as HTML string for better compatibility with React Quill
                              field.onChange(htmlContent);
                            }}
                            placeholder="شروع به نوشتن محتوای وبلاگ خود کنید..."
                            onAutoSave={(content) => {
                              // Auto-save functionality - could trigger a draft save API call
                              console.log('Auto-saving content:', content.length, 'characters');
                              // You could add draft saving here:
                              // saveDraft({ ...form.getValues(), content });
                            }}
                            autoSaveInterval={30000} // 30 seconds
                            data-testid="advanced-content-editor"
                          />
                        </FormControl>
                        <FormDescription className="p-4 text-xs text-gray-500 dark:text-gray-400">
                          ویرایشگر پیشرفته با پشتیبانی از آپلود تصویر، پیش‌نمایش زنده، حالت تمام‌صفحه و ذخیره خودکار
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Social</CardTitle>
                  <CardDescription>
                    Optimize your post for search engines and social media
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="seo">
                    <TabsList>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                      <TabsTrigger value="social">Social Media</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="seo" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="seoTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SEO Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="SEO optimized title" data-testid="seo-title-input" />
                            </FormControl>
                            <FormDescription>
                              Title tag for search engines (leave empty to use post title)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seoDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="SEO meta description"
                                className="min-h-[80px]"
                                data-testid="seo-description-textarea"
                              />
                            </FormControl>
                            <FormDescription>
                              Description for search engine results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="social" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="ogTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Social Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Title for social media shares" data-testid="og-title-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ogDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Social Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Description for social media shares"
                                className="min-h-[80px]"
                                data-testid="og-description-textarea"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ogImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Social Image URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/image.jpg" data-testid="og-image-input" />
                            </FormControl>
                            <FormDescription>
                              Image for social media shares
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="status-select">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publishNow"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publish Now</FormLabel>
                          <FormDescription>
                            Override status and publish immediately
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="publish-now-switch"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Post</FormLabel>
                          <FormDescription>
                            Show in featured section
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="featured-switch"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Author & Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="authorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="author-select">
                              <SelectValue placeholder="Select author" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="category-select">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Categorize your post with tags
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Tags */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {form.watch("tags")?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1" data-testid={`tag-${tag}`}>
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                      {form.watch("newTags")?.map((tag) => (
                        <Badge key={tag} variant="outline" className="flex items-center gap-1" data-testid={`new-tag-${tag}`}>
                          {tag} (new)
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeNewTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Add New Tag */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addNewTag();
                        }
                      }}
                      data-testid="new-tag-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addNewTag}
                      data-testid="add-tag-button"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Existing Tags */}
                  {availableTags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Available Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tagSlug) => {
                          const isSelected = form.watch("tags")?.includes(tagSlug) || form.watch("newTags")?.includes(tagSlug);
                          return (
                            <Badge
                              key={tagSlug}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer ${!isSelected ? "hover:bg-gray-100 dark:hover:bg-gray-800" : ""}`}
                              onClick={() => !isSelected && addExistingTag(tagSlug)}
                              data-testid={`available-tag-${tagSlug}`}
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {tagSlug}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" data-testid="featured-image-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featuredImageAlt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Describe the image" data-testid="featured-image-alt-input" />
                        </FormControl>
                        <FormDescription>
                          Alt text for accessibility
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}