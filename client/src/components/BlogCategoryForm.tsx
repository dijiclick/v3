import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader, Palette } from "lucide-react";
import type { BlogCategory } from "@shared/schema";

const blogCategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format").optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

type BlogCategoryFormData = z.infer<typeof blogCategoryFormSchema>;

interface BlogCategoryFormProps {
  category?: BlogCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BlogCategoryForm({ category, onSuccess, onCancel }: BlogCategoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!category;
  
  // Fetch categories for parent selection
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
  });

  const form = useForm<BlogCategoryFormData>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parentId: category?.parentId || undefined,
      color: category?.color || "#3B82F6",
      seoTitle: category?.seoTitle || "",
      seoDescription: category?.seoDescription || "",
      seoKeywords: category?.seoKeywords || [],
      featured: category?.featured || false,
      active: category?.active !== false, // default to true
      sortOrder: category?.sortOrder || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BlogCategoryFormData) => {
      const categoryData = {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        parentId: data.parentId && data.parentId !== "" ? data.parentId : undefined,
        seoKeywords: data.seoKeywords?.filter(keyword => keyword.trim().length > 0),
      };
      
      if (isEditing) {
        return apiRequest('PUT', `/api/blog/categories/${category.id}`, categoryData);
      } else {
        return apiRequest('POST', '/api/blog/categories', categoryData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories/with-stats'] });
      toast({
        title: "Success",
        description: `Blog category ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} blog category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogCategoryFormData) => {
    mutation.mutate(data);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!form.getValues("slug") || !isEditing) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      form.setValue("slug", slug);
    }
  };

  // Handle SEO keywords
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    form.setValue("seoKeywords", keywords);
  };

  const availableParentCategories = categories.filter((cat: BlogCategory) => cat.id !== category?.id);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Blog Category' : 'Add New Blog Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  {...form.register("name", { onChange: handleNameChange })}
                  placeholder="Enter category name"
                  data-testid="blog-category-name-input"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL-friendly name)</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  placeholder="category-slug"
                  data-testid="blog-category-slug-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be auto-generated from name if left blank
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Enter category description"
                rows={3}
                data-testid="blog-category-description-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentId">Parent Category</Label>
                <Select 
                  value={form.watch("parentId") || "none"} 
                  onValueChange={(value) => form.setValue("parentId", value === "none" ? undefined : value)}
                >
                  <SelectTrigger data-testid="blog-category-parent-select">
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (top level)</SelectItem>
                    {availableParentCategories.map((cat: BlogCategory) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Category Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    {...form.register("color")}
                    className="w-12 h-10 p-1 border rounded"
                    data-testid="blog-category-color-input"
                  />
                  <Input
                    {...form.register("color")}
                    placeholder="#3B82F6"
                    className="flex-1"
                    data-testid="blog-category-color-text-input"
                  />
                  <Palette className="h-4 w-4 text-gray-400" />
                </div>
                {form.formState.errors.color && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.color.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO Settings</h3>
            
            <div>
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                {...form.register("seoTitle")}
                placeholder="SEO title for search engines"
                data-testid="blog-category-seo-title-input"
              />
            </div>

            <div>
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                {...form.register("seoDescription")}
                placeholder="SEO description for search engines"
                rows={2}
                data-testid="blog-category-seo-description-input"
              />
            </div>

            <div>
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <Input
                id="seoKeywords"
                onChange={handleKeywordsChange}
                placeholder="keyword1, keyword2, keyword3"
                defaultValue={category?.seoKeywords?.join(', ') || ''}
                data-testid="blog-category-seo-keywords-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  {...form.register("sortOrder", { valueAsNumber: true })}
                  placeholder="0"
                  data-testid="blog-category-sort-order-input"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={form.watch("featured")}
                  onCheckedChange={(checked) => form.setValue("featured", !!checked)}
                  data-testid="blog-category-featured-checkbox"
                />
                <Label htmlFor="featured">Featured category</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={form.watch("active")}
                  onCheckedChange={(checked) => form.setValue("active", !!checked)}
                  data-testid="blog-category-active-checkbox"
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="submit-blog-category"
            >
              {mutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Category' : 'Create Category'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="cancel-blog-category"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}