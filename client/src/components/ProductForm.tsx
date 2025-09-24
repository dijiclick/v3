import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/lib/content-service";
import { apiRequest } from "@/lib/queryClient";
import { RichTextEditor } from "@/components/RichTextEditor";
import SEOPreview from "@/components/SEOPreview";
import { type Product, insertProductSchema } from "@shared/schema";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";

// English-localized form validation schema based on shared schema
const productFormSchema = insertProductSchema.extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
  price: z.string().min(1, "Price is required"),
  categoryId: z.string().min(1, "Category is required"),
  featuredFeatures: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditMode = !!product;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [activeTab, setActiveTab] = useState("basic");
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditMode ? {
      title: product.title || "",
      slug: product.slug || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      mainDescription: (product.mainDescription as string) || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      buyLink: product.buyLink || "",
      categoryId: product.categoryId || "",
      image: product.image || "",
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      featuredTitle: product.featuredTitle || "",
      featuredFeatures: Array.isArray(product.featuredFeatures) ? product.featuredFeatures : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
    } : {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      mainDescription: "",
      price: "",
      originalPrice: "",
      buyLink: "",
      categoryId: "",
      image: "",
      inStock: true,
      featured: false,
      featuredTitle: "",
      featuredFeatures: [],
      tags: [],
    },
  });

  // Watch form values for auto-generation features
  const watchedTitle = form.watch("title");
  const watchedFeatured = form.watch("featured");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !isEditMode) {
      const slug = watchedTitle.toLowerCase()
        // Handle Persian characters - convert to equivalent or remove
        .replace(/[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]/g, (match) => {
          const persianToEng: { [key: string]: string } = {
            'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
            'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
            'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
            'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
            'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
            'و': 'v', 'ه': 'h', 'ی': 'y'
          };
          return persianToEng[match] || '';
        })
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim() || 'product'; // Fallback to 'product' if empty

      form.setValue("slug", slug);
    }
  }, [watchedTitle, isEditMode, form]);

  // Auto-sync featured title with main title when featured is enabled
  useEffect(() => {
    if (watchedFeatured && watchedTitle && !form.getValues("featuredTitle")) {
      form.setValue("featuredTitle", watchedTitle);
    }
  }, [watchedFeatured, watchedTitle, form]);

  // Field arrays for dynamic inputs
  const featuredFeatures = useFieldArray({
    control: form.control,
    name: "featuredFeatures",
  });

  const tags = useFieldArray({
    control: form.control,
    name: "tags",
  });

  // Auto-save functionality (visual indicator only)
  useEffect(() => {
    const subscription = form.watch(() => {
      setAutoSaveIndicator(true);
      const timer = setTimeout(() => setAutoSaveIndicator(false), 2000);
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Generate slug for new products if not provided
      const slug = isEditMode ? undefined : (data.slug || data.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim() || 'product');

      const productData = {
        ...data,
        ...(isEditMode ? {} : { slug }),
        // Ensure prices are strings for decimal fields
        price: data.price || "0",
        originalPrice: data.originalPrice || undefined,
        // Clean up empty values
        buyLink: data.buyLink || undefined,
        shortDescription: data.shortDescription || undefined,
        mainDescription: data.mainDescription || undefined,
        featuredTitle: data.featuredTitle || undefined,
        // Convert arrays properly
        featuredFeatures: data.featuredFeatures?.filter(Boolean) || undefined,
        tags: data.tags?.filter(Boolean) || undefined,
      };

      return apiRequest(
        isEditMode ? 'PUT' : 'POST', 
        isEditMode ? `/api/products/${product.id}` : '/api/products', 
        productData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}`] });
      }
      toast({
        title: "Success",
        description: isEditMode ? "Product updated successfully!" : "Product created successfully!",
      });
      if (!isEditMode) {
        form.reset();
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error ${isEditMode ? 'updating' : 'creating'} product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    productMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {autoSaveIndicator && (
              <Badge variant="secondary" className="animate-pulse">
                Auto-saving...
              </Badge>
            )}
            {productMutation.isPending && (
              <Badge variant="default">
                Processing...
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-auto p-1">
              <TabsTrigger 
                value="basic" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-basic"
              >
                <span className="text-sm font-medium">Basic Information</span>
                <span className="text-xs opacity-70">Title, slug, description</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pricing" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-pricing"
              >
                <span className="text-sm font-medium">Pricing</span>
                <span className="text-xs opacity-70">Price, discount, stock</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-content"
              >
                <span className="text-sm font-medium">Content</span>
                <span className="text-xs opacity-70">Full description, images</span>
              </TabsTrigger>
              <TabsTrigger 
                value="featured" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-featured"
              >
                <span className="text-sm font-medium">Featured Product</span>
                <span className="text-xs opacity-70">Feature settings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seo" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-seo"
              >
                <span className="text-sm font-medium">SEO Preview</span>
                <span className="text-xs opacity-70">Search engine optimization</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Product Title *
                  </Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Enter product title"
                    className="mt-1"
                    data-testid="input-title"
                    dir="ltr"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1" dir="ltr">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm font-medium">
                    Slug *
                  </Label>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    placeholder="product-slug"
                    className="mt-1"
                    data-testid="input-slug"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">
                    Auto-generated from title
                  </p>
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-600 mt-1" dir="ltr">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium block mb-3">
                  Short Description
                </Label>
                <RichTextEditor
                  value={form.watch("shortDescription")}
                  onChange={(value) => form.setValue("shortDescription", value)}
                  placeholder="Brief product description with rich text formatting..."
                  className="min-h-[120px]"
                  productId={product?.id}
                  data-testid="rich-editor-short-description"
                />
                <p className="text-xs text-gray-500 mt-2" dir="ltr">
                  This text is displayed under the product title
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="buyLink" className="text-sm font-medium">
                    Purchase Link
                  </Label>
                  <Input
                    id="buyLink"
                    type="url"
                    {...form.register("buyLink")}
                    placeholder="https://example.com/buy"
                    className="mt-1"
                    data-testid="input-buy-link"
                    dir="ltr"
                  />
                  {form.formState.errors.buyLink && (
                    <p className="text-sm text-red-600 mt-1" dir="ltr">
                      {form.formState.errors.buyLink.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select 
                    value={form.watch("categoryId") || ""} 
                    onValueChange={(value) => form.setValue("categoryId", value)}
                  >
                    <SelectTrigger className="mt-1" data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1" dir="ltr">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => tags.append("")}
                    data-testid="button-add-tag"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {tags.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...form.register(`tags.${index}` as const)}
                        placeholder="New tag"
                        className="flex-1"
                        data-testid={`input-tag-${index}`}
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tags.remove(index)}
                        data-testid={`button-remove-tag-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {tags.fields.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4" dir="ltr">
                      No tags added yet. Click "Add Tag" to get started.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    Current Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register("price")}
                    placeholder="0.00"
                    className="mt-1"
                    data-testid="input-price"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">
                    Product's current price
                  </p>
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-600 mt-1" dir="ltr">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="originalPrice" className="text-sm font-medium">
                    Original Price
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...form.register("originalPrice")}
                    placeholder="0.00"
                    className="mt-1"
                    data-testid="input-original-price"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">
                    Price before discount (optional)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <Label htmlFor="inStock" className="text-sm font-medium">
                    Stock Status
                  </Label>
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">
                    Is this product currently available?
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${!form.watch("inStock") ? "font-medium text-red-600" : "text-gray-500"}`}>
                    Out of Stock
                  </span>
                  <Switch
                    checked={form.watch("inStock") ?? true}
                    onCheckedChange={(checked) => form.setValue("inStock", checked)}
                    data-testid="switch-in-stock"
                  />
                  <span className={`text-sm ${form.watch("inStock") ? "font-medium text-green-600" : "text-gray-500"}`}>
                    In Stock
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              <div>
                <Label htmlFor="image" className="text-sm font-medium">
                  Product Main Image
                </Label>
                <Input
                  id="image"
                  type="url"
                  {...form.register("image")}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                  data-testid="input-image"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1" dir="ltr">
                  URL to the product's main image
                </p>
              </div>

              {/* Backward compatibility description field */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Simple Description (Legacy Compatibility)
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Simple product description"
                  rows={4}
                  className="mt-1"
                  data-testid="textarea-description"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1" dir="ltr">
                  This field is kept for backward compatibility
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium block mb-3">
                  Full Product Description
                </Label>
                <RichTextEditor
                  value={form.watch("mainDescription")}
                  onChange={(value) => form.setValue("mainDescription", value)}
                  placeholder="Enter full product description with image upload support..."
                  className="min-h-[300px]"
                  productId={product?.id}
                  data-testid="rich-editor-main-description"
                />
                <p className="text-xs text-gray-500 mt-2" dir="ltr">
                  Use the rich text editor for formatting and image uploads
                </p>
              </div>
            </TabsContent>

            {/* Featured Product Tab */}
            <TabsContent value="featured" className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div>
                  <Label htmlFor="featured" className="text-sm font-medium">
                    Featured Product
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1" dir="ltr">
                    Should this product be displayed as a featured product?
                  </p>
                </div>
                <Switch
                  checked={form.watch("featured") ?? false}
                  onCheckedChange={(checked) => form.setValue("featured", checked)}
                  data-testid="switch-featured"
                />
              </div>

              {form.watch("featured") && (
                <div className="space-y-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <Label htmlFor="featuredTitle" className="text-sm font-medium">
                      Featured Product Title
                    </Label>
                    <Input
                      id="featuredTitle"
                      {...form.register("featuredTitle")}
                      placeholder="Special title (default: main product title)"
                      className="mt-1"
                      data-testid="input-featured-title"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1" dir="ltr">
                      If left empty, the main product title will be used
                    </p>
                  </div>

                  {/* Featured Features Array */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Featured Area Text</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => featuredFeatures.append("")}
                        data-testid="button-add-featured-feature"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {featuredFeatures.fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <Input
                            {...form.register(`featuredFeatures.${index}` as const)}
                            placeholder="New feature"
                            className="flex-1"
                            data-testid={`input-featured-feature-${index}`}
                            dir="ltr"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => featuredFeatures.remove(index)}
                            data-testid={`button-remove-featured-feature-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {featuredFeatures.fields.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-4" dir="ltr">
                          No features added yet. Click "Add Feature" to get started.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </TabsContent>

            {/* SEO Preview Tab */}
            <TabsContent value="seo" className="space-y-6 mt-6">
              <SEOPreview 
                product={{
                  title: form.watch("title"),
                  slug: form.watch("slug"),
                  shortDescription: form.watch("shortDescription"),
                  description: form.watch("description"),
                  mainDescription: form.watch("mainDescription"),
                  featured: form.watch("featured"),
                  featuredTitle: form.watch("featuredTitle"),
                  image: form.watch("image"),
                  price: form.watch("price") || "0"
                }}
                categoryName={categories.find(cat => cat.id === form.watch("categoryId"))?.name}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={productMutation.isPending}
              className="flex-1 sm:flex-none sm:min-w-[120px]"
              data-testid="button-submit"
            >
              {productMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={productMutation.isPending}
              className="flex-1 sm:flex-none sm:min-w-[120px]"
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={productMutation.isPending}
                className="flex-1 sm:flex-none sm:min-w-[120px]"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}