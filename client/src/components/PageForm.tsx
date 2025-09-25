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
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

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
  const { t } = useAdminLanguage();
  
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
        <CardTitle>{isEditing ? t('page.edit') : t('page.add')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('page.basic_info')}</h3>
            
            <div>
              <Label htmlFor="title">{t('page.title')} *</Label>
              <Input
                id="title"
                {...form.register("title", { onChange: handleTitleChange })}
                placeholder={t('page.title_placeholder')}
                data-testid="page-title-input"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">{t('page.slug')}</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder={t('page.slug_placeholder')}
                data-testid="page-slug-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('page.url_preview', { slug: form.watch("slug") || "page-url" })}
              </p>
              {form.formState.errors.slug && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="excerpt">{t('page.description')}</Label>
              <Textarea
                id="excerpt"
                {...form.register("excerpt")}
                placeholder={t('page.description_placeholder')}
                rows={3}
                data-testid="page-excerpt-input"
              />
            </div>

            <div>
              <Label htmlFor="content">{t('page.content')}</Label>
              <Textarea
                id="content"
                {...form.register("content")}
                placeholder={t('page.content_placeholder')}
                rows={8}
                data-testid="page-content-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('page.content_note')}
              </p>
            </div>
          </div>

          {/* Status and Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('page.status_nav')}</h3>
            
            <div>
              <Label htmlFor="status">{t('page.status')}</Label>
              <Select
                value={form.watch("status") || "draft"}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger data-testid="page-status-select">
                  <SelectValue placeholder={t('page.status_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t('page.status_draft')}</SelectItem>
                  <SelectItem value="published">{t('page.status_published')}</SelectItem>
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
              <Label htmlFor="showInNavigation">{t('page.show_in_nav')}</Label>
            </div>

            {form.watch("showInNavigation") && (
              <div>
                <Label htmlFor="navigationOrder">{t('page.nav_order')}</Label>
                <Input
                  id="navigationOrder"
                  type="number"
                  {...form.register("navigationOrder", { valueAsNumber: true })}
                  placeholder="0"
                  data-testid="page-nav-order-input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('page.nav_order_note')}
                </p>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('page.seo_optional')}</h3>
            
            <div>
              <Label htmlFor="seoTitle">{t('page.seo_title')}</Label>
              <Input
                id="seoTitle"
                {...form.register("seoTitle")}
                placeholder={t('page.seo_title_placeholder')}
                data-testid="page-seo-title-input"
              />
            </div>

            <div>
              <Label htmlFor="seoDescription">{t('page.seo_description')}</Label>
              <Textarea
                id="seoDescription"
                {...form.register("seoDescription")}
                placeholder={t('page.seo_description_placeholder')}
                rows={3}
                data-testid="page-seo-description-input"
              />
            </div>

            <div>
              <Label htmlFor="seoKeywords">{t('page.seo_keywords')}</Label>
              <Input
                id="seoKeywords"
                {...form.register("seoKeywords")}
                placeholder={t('page.seo_keywords_placeholder')}
                data-testid="page-seo-keywords-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('page.seo_keywords_note')}
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
                {t('action.cancel')}
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
                  {isEditing ? t('page.updating') : t('page.creating')}
                </>
              ) : (
                isEditing ? t('page.update') : t('page.create')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}