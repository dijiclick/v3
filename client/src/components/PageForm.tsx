import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPageSchema, type Page } from "@shared/schema";
import { Loader } from "lucide-react";

// Create form schema based on insertPageSchema
const pageFormSchema = insertPageSchema.extend({
  content: z.string().optional(), // Handle content as string in form, convert to JSON on submit
  seoKeywords: z.string().optional(), // Handle as comma-separated string in form
});

type PageFormData = z.infer<typeof pageFormSchema>;

interface PageFormProps {
  page?: Page;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PageForm({ page, onSuccess, onCancel }: PageFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!page;
  
  const form = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: page?.title || "",
      slug: page?.slug || "",
      excerpt: page?.excerpt || "",
      content: typeof page?.content === 'string' 
        ? page.content 
        : (page?.content ? JSON.stringify(page.content, null, 2) : ""),
      status: page?.status || "draft",
      showInNavigation: page?.showInNavigation || false,
      navigationOrder: page?.navigationOrder || 0,
      featuredImage: page?.featuredImage || "",
      seoTitle: page?.seoTitle || "",
      seoDescription: page?.seoDescription || "",
      seoKeywords: page?.seoKeywords?.join(', ') || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const pageData = {
        ...data,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        content: data.content ? (() => {
          // If editing and content hasn't changed, preserve original structure
          if (isEditing && page?.content && data.content === 
              (typeof page.content === 'string' 
                ? page.content 
                : JSON.stringify(page.content, null, 2))) {
            return page.content;
          }
          // Try to parse as JSON first, fallback to simple text structure
          try {
            return JSON.parse(data.content);
          } catch {
            return { type: "page", content: [{ text: data.content }] };
          }
        })() : null,
        seoKeywords: typeof data.seoKeywords === 'string' 
          ? (data.seoKeywords as string).split(',').map((k: string) => k.trim()).filter(Boolean)
          : data.seoKeywords || [],
      };
      
      if (isEditing) {
        return apiRequest('PUT', `/api/pages/${page.id}`, pageData);
      } else {
        return apiRequest('POST', '/api/pages', pageData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Success",
        description: `Page ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} page: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PageFormData) => {
    mutation.mutate(data);
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!form.getValues("slug") || !isEditing) {
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      form.setValue("slug", slug);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Page' : 'Add New Page'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                {...form.register("title", { onChange: handleTitleChange })}
                placeholder="Enter page title"
                data-testid="page-title-input"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="page-url-slug"
                data-testid="page-slug-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /{form.watch("slug") || "page-url"}
              </p>
              {form.formState.errors.slug && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="excerpt">Description</Label>
              <Textarea
                id="excerpt"
                {...form.register("excerpt")}
                placeholder="Brief description of the page"
                rows={3}
                data-testid="page-excerpt-input"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...form.register("content")}
                placeholder="Page content..."
                rows={8}
                data-testid="page-content-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Basic text content. Rich formatting coming soon.
              </p>
            </div>
          </div>

          {/* Status and Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status & Navigation</h3>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status") || "draft"}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger data-testid="page-status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showInNavigation"
                checked={form.watch("showInNavigation") || false}
                onCheckedChange={(checked) => form.setValue("showInNavigation", !!checked)}
                data-testid="page-navigation-checkbox"
              />
              <Label htmlFor="showInNavigation">Show in main navigation</Label>
            </div>

            {form.watch("showInNavigation") && (
              <div>
                <Label htmlFor="navigationOrder">Navigation Order</Label>
                <Input
                  id="navigationOrder"
                  type="number"
                  {...form.register("navigationOrder", { valueAsNumber: true })}
                  placeholder="0"
                  data-testid="page-nav-order-input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Lower numbers appear first in navigation
                </p>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO (Optional)</h3>
            
            <div>
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                {...form.register("seoTitle")}
                placeholder="Custom title for search engines"
                data-testid="page-seo-title-input"
              />
            </div>

            <div>
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                {...form.register("seoDescription")}
                placeholder="Meta description for search engines"
                rows={3}
                data-testid="page-seo-description-input"
              />
            </div>

            <div>
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <Input
                id="seoKeywords"
                {...form.register("seoKeywords")}
                placeholder="keyword1, keyword2, keyword3"
                data-testid="page-seo-keywords-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="page-cancel-button"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="page-submit-button"
            >
              {mutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Page' : 'Create Page'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}