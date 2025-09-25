import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader, Palette, Hash } from "lucide-react";
import type { BlogTag } from "@shared/schema";

const blogTagFormSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format").optional(),
  featured: z.boolean().optional(),
});

type BlogTagFormData = z.infer<typeof blogTagFormSchema>;

interface BlogTagFormProps {
  tag?: BlogTag & { usageCount?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const predefinedColors = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E", "#6B7280", "#374151", "#1F2937"
];

export default function BlogTagForm({ tag, onSuccess, onCancel }: BlogTagFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!tag;
  
  // Fetch existing tags for duplicate checking
  const { data: existingTags = [] } = useQuery<BlogTag[]>({
    queryKey: ['/api/blog/tags'],
  });

  const form = useForm<BlogTagFormData>({
    resolver: zodResolver(blogTagFormSchema),
    defaultValues: {
      name: tag?.name || "",
      slug: tag?.slug || "",
      description: tag?.description || "",
      color: tag?.color || "#3B82F6",
      featured: tag?.featured || false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BlogTagFormData) => {
      const tagData = {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      };
      
      if (isEditing) {
        return apiRequest('PUT', `/api/blog/tags/${tag.id}`, tagData);
      } else {
        return apiRequest('POST', '/api/blog/tags', tagData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags/with-stats'] });
      toast({
        title: "Success",
        description: `Tag ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogTagFormData) => {
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

  // Handle color selection
  const handleColorSelect = (color: string) => {
    form.setValue("color", color);
  };

  // Check for similar tags
  const currentName = form.watch("name");
  const similarTags = existingTags.filter((existingTag: BlogTag) => 
    existingTag.id !== tag?.id && 
    existingTag.name.toLowerCase().includes(currentName.toLowerCase()) &&
    currentName.length > 2
  );

  const previewColor = form.watch("color");

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {isEditing ? 'Edit Blog Tag' : 'Add New Blog Tag'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tag Preview */}
          {currentName && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-sm font-medium">Tag Preview:</Label>
              <div className="mt-2">
                <Badge 
                  style={{ backgroundColor: previewColor, color: 'white' }}
                  className="text-sm"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {currentName}
                </Badge>
              </div>
            </div>
          )}

          {/* Usage Statistics (for editing) */}
          {isEditing && tag?.usageCount !== undefined && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Label className="text-sm font-medium">Usage Statistics:</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This tag is used in <strong>{tag.usageCount}</strong> blog post{tag.usageCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tag Name *</Label>
                <Input
                  id="name"
                  {...form.register("name", { onChange: handleNameChange })}
                  placeholder="Enter tag name"
                  data-testid="blog-tag-name-input"
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
                  placeholder="tag-slug"
                  data-testid="blog-tag-slug-input"
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
                placeholder="Enter tag description (optional)"
                rows={3}
                data-testid="blog-tag-description-input"
              />
            </div>
          </div>

          {/* Color Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visual Settings</h3>
            
            <div>
              <Label htmlFor="color">Tag Color</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    {...form.register("color")}
                    className="w-12 h-10 p-1 border rounded"
                    data-testid="blog-tag-color-input"
                  />
                  <Input
                    {...form.register("color")}
                    placeholder="#3B82F6"
                    className="flex-1"
                    data-testid="blog-tag-color-text-input"
                  />
                  <Palette className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Predefined Colors */}
                <div>
                  <Label className="text-sm">Quick Colors:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          previewColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                        data-testid={`color-${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {form.formState.errors.color && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.color.message}
                </p>
              )}
            </div>
          </div>

          {/* Similar Tags Warning */}
          {similarTags.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <Label className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Similar Tags Found:
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {similarTags.slice(0, 5).map((similarTag: BlogTag) => (
                  <Badge key={similarTag.id} variant="outline" className="text-xs">
                    {similarTag.name}
                  </Badge>
                ))}
                {similarTags.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{similarTags.length - 5} more
                  </Badge>
                )}
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                Consider using an existing tag or merging similar tags to maintain consistency.
              </p>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={form.watch("featured")}
                onCheckedChange={(checked) => form.setValue("featured", !!checked)}
                data-testid="blog-tag-featured-checkbox"
              />
              <Label htmlFor="featured">Featured tag</Label>
              <p className="text-xs text-gray-500 ml-2">
                Featured tags appear prominently in tag clouds and listings
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="submit-blog-tag"
            >
              {mutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Tag' : 'Create Tag'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="cancel-blog-tag"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}