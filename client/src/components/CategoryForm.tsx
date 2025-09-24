import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader } from "lucide-react";
import type { Category } from "@shared/schema";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  slug: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!category;
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      slug: category?.slug || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const categoryData = {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      };
      
      if (isEditing) {
        return apiRequest('PUT', `/api/categories/${category.id}`, categoryData);
      } else {
        return apiRequest('POST', '/api/categories', categoryData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: `Category ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
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

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              {...form.register("name", { onChange: handleNameChange })}
              placeholder="Enter category name"
              data-testid="category-name-input"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-green-600 mt-1">
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
              data-testid="category-slug-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Will be auto-generated from name if left blank
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter category description"
              rows={3}
              data-testid="category-description-input"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="submit-category"
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
              data-testid="cancel-category"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}