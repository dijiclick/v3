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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/lib/content-service";
import { apiRequest } from "@/lib/queryClient";
import { 
  insertProductSchema,
  heroSectionSchema,
  pricingPlanSchema,
  screenshotSchema,
  statisticsSectionSchema,
  benefitsSectionSchema,
  footerCTASchema,
  sidebarContentSchema,
  howItWorksStepSchema,
  faqSchema,
  recommendationSchema,
  type Product,
  type InsertProduct
} from "@shared/schema";
import { Plus, Trash2, Move } from "lucide-react";
import { BlogEditor } from "@/components/BlogEditor";

// Create form schema that extends insertProductSchema with proper validation
const productFormSchema = insertProductSchema.omit({
  // Omit slug since it's auto-generated from title
  slug: true,
}).extend({
  // Override price to be string for form input (will convert to decimal on submit)
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  // Override tags to be string for form input (will convert to array on submit)
  tags: z.string().optional(),
  // Override image to allow empty string or valid URL
  image: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    "Must be a valid URL or empty"
  ),
  // Add blog content as string for the editor
  blogContent: z.string().optional(),
}).refine((data) => {
  // Validate that required fields are provided
  return data.title && data.description && data.price && data.categoryId;
}, {
  message: "All required fields must be provided",
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PricingPlanFeaturesProps {
  planIndex: number;
  form: ReturnType<typeof useForm<ProductFormData>>;
}

function PricingPlanFeatures({ planIndex, form }: PricingPlanFeaturesProps) {
  const planFeatures = useFieldArray({
    control: form.control,
    name: `pricingPlans.${planIndex}.features` as any,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm">Plan Features</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => planFeatures.append("" as any)}
          data-testid={`add-plan-feature-${planIndex}`}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Feature
        </Button>
      </div>
      
      <div className="space-y-2">
        {planFeatures.fields.map((field, featureIndex) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...form.register(`pricingPlans.${planIndex}.features.${featureIndex}` as const)}
              placeholder="Enter plan feature"
              className="text-sm"
              data-testid={`plan-feature-${planIndex}-${featureIndex}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => planFeatures.remove(featureIndex)}
              data-testid={`remove-plan-feature-${planIndex}-${featureIndex}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {planFeatures.fields.length === 0 && (
          <p className="text-xs text-gray-500 italic">
            No features added yet. Click "Add Feature" to get started.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditMode = !!product;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditMode ? {
      title: product.title || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      categoryId: product.categoryId || "",
      image: product.image || "",
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      tags: product.tags?.join(", ") || "",
      featuredAreaText: product.featuredAreaText || "",
      layoutStyle: "chatgpt",
      heroSection: product.heroSection ? {
        titleOverride: (product.heroSection as any)?.titleOverride || "",
        subtitle: (product.heroSection as any)?.subtitle || "",
        heroIcon: (product.heroSection as any)?.heroIcon || "",
        features: (product.heroSection as any)?.features || [],
        rtlDirection: (product.heroSection as any)?.rtlDirection || false,
      } : {
        titleOverride: "",
        subtitle: "",
        heroIcon: "",
        features: [],
        rtlDirection: false,
      },
      pricingPlans: Array.isArray(product.pricingPlans) ? product.pricingPlans.map((plan) => ({
        duration: plan?.duration || "",
        price: plan?.price || "",
        originalPrice: plan?.originalPrice || "",
        discount: plan?.discount || "",
        priceNumber: plan?.priceNumber || 0,
        popular: plan?.popular || false,
        features: plan?.features || [],
      })) : [],
      screenshots: Array.isArray(product.screenshots) ? product.screenshots.map((screenshot) => ({
        title: screenshot?.title || "",
        description: screenshot?.description || "",
        image: screenshot?.image || "",
        gradient: screenshot?.gradient || "",
        icon: screenshot?.icon || "",
      })) : [],
      statisticsSection: product.statisticsSection ? {
        title: (product.statisticsSection as any)?.title || "",
        subtitle: (product.statisticsSection as any)?.subtitle || "",
        backgroundGradient: (product.statisticsSection as any)?.backgroundGradient || "",
        statistics: Array.isArray((product.statisticsSection as any)?.statistics) ? ((product.statisticsSection as any).statistics as any[]).map((stat: any) => ({
          icon: stat?.icon || "",
          value: stat?.value || "",
          label: stat?.label || "",
        })) : [],
      } : {
        title: "",
        subtitle: "",
        backgroundGradient: "",
        statistics: [],
      },
      benefitsSection: product.benefitsSection ? {
        title: (product.benefitsSection as any)?.title || "",
        benefits: Array.isArray((product.benefitsSection as any)?.benefits) ? ((product.benefitsSection as any).benefits as any[]).map((benefit: any) => ({
          icon: benefit?.icon || "",
          title: benefit?.title || "",
          description: benefit?.description || "",
          gradient: benefit?.gradient || "",
        })) : [],
      } : {
        title: "",
        benefits: [],
      },
      footerCTA: product.footerCTA ? {
        title: (product.footerCTA as any)?.title || "",
        subtitle: (product.footerCTA as any)?.subtitle || "",
        buttonText: (product.footerCTA as any)?.buttonText || "",
        buttonUrl: (product.footerCTA as any)?.buttonUrl || "",
        supportingLinks: (product.footerCTA as any)?.supportingLinks || {},
      } : {
        title: "",
        subtitle: "",
        buttonText: "",
        buttonUrl: "",
        supportingLinks: {},
      },
      sidebarContent: product.sidebarContent ? {
        howItWorks: Array.isArray((product.sidebarContent as any)?.howItWorks) ? ((product.sidebarContent as any).howItWorks as any[]).map((step: any) => ({
          step: step?.step || "",
          title: step?.title || "",
          description: step?.description || "",
        })) : [],
        faqs: Array.isArray((product.sidebarContent as any)?.faqs) ? ((product.sidebarContent as any).faqs as any[]).map((faq: any) => ({
          question: faq?.question || "",
          answer: faq?.answer || "",
        })) : [],
        recommendations: Array.isArray((product.sidebarContent as any)?.recommendations) ? ((product.sidebarContent as any).recommendations as any[]).map((rec: any) => ({
          icon: rec?.icon || "",
          name: rec?.name || "",
          price: rec?.price || "",
          backgroundColor: rec?.backgroundColor || "",
        })) : [],
      } : {
        howItWorks: [],
        faqs: [],
        recommendations: [],
      },
      blogContent: (product as any).blogContent || "",
    } : {
      title: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      image: "",
      inStock: true,
      featured: false,
      tags: "",
      featuredAreaText: "",
      layoutStyle: "chatgpt",
      heroSection: {
        titleOverride: "",
        subtitle: "",
        heroIcon: "",
        features: [],
        rtlDirection: false,
      },
      pricingPlans: [],
      screenshots: [],
      statisticsSection: {
        title: "",
        subtitle: "",
        backgroundGradient: "",
        statistics: [],
      },
      benefitsSection: {
        title: "",
        benefits: [],
      },
      footerCTA: {
        title: "",
        subtitle: "",
        buttonText: "",
        buttonUrl: "",
        supportingLinks: {},
      },
      sidebarContent: {
        howItWorks: [],
        faqs: [],
        recommendations: [],
      },
      blogContent: "",
    },
  });

  // Watch for layout style changes and populate defaults for ChatGPT layout
  const layoutStyle = form.watch("layoutStyle");
  useEffect(() => {
    if (layoutStyle === "chatgpt") {
      // Only populate if fields are empty to avoid overwriting user data
      const currentHeroSection = form.getValues("heroSection");
      const currentPricingPlans = form.getValues("pricingPlans");
      const currentStatistics = form.getValues("statisticsSection.statistics");
      const currentBenefits = form.getValues("benefitsSection.benefits");
      const currentFooterCTA = form.getValues("footerCTA");
      
      // Populate hero section defaults if empty
      if (!currentHeroSection?.features?.length) {
        form.setValue("heroSection.features", [
          "Advanced AI-powered functionality",
          "Easy to use interface",
          "24/7 customer support"
        ]);
      }
      if (!currentHeroSection?.subtitle) {
        form.setValue("heroSection.subtitle", "Transform your workflow with our innovative solution");
      }

      // Populate default pricing plan if none exist
      if (!currentPricingPlans?.length) {
        form.setValue("pricingPlans", [{
          duration: "Monthly",
          price: "$29",
          originalPrice: "$39",
          discount: "25% OFF",
          priceNumber: 29,
          popular: true,
          features: ["All core features", "Priority support", "Advanced analytics"]
        }]);
      }

      // Populate default statistics if none exist
      if (!currentStatistics?.length) {
        form.setValue("statisticsSection", {
          title: "Trusted by thousands",
          subtitle: "Join the growing community of satisfied customers",
          backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          statistics: [
            { icon: "👥", value: "10K+", label: "Active Users" },
            { icon: "⭐", value: "4.9", label: "Rating" },
            { icon: "🚀", value: "99%", label: "Uptime" }
          ]
        });
      }

      // Populate default benefits if none exist
      if (!currentBenefits?.length) {
        form.setValue("benefitsSection", {
          title: "Why choose us?",
          benefits: [
            {
              icon: "⚡",
              title: "Lightning Fast",
              description: "Get results in seconds, not minutes",
              gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            {
              icon: "🔒",
              title: "Secure & Private",
              description: "Your data is protected with enterprise-grade security",
              gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            }
          ]
        });
      }

      // Populate default footer CTA if empty
      if (!currentFooterCTA?.title) {
        form.setValue("footerCTA", {
          title: "Ready to get started?",
          subtitle: "Join thousands of satisfied customers today",
          buttonText: "Start Free Trial",
          buttonUrl: "#signup",
          supportingLinks: {
            "Contact Sales": "#contact",
            "View Documentation": "#docs"
          }
        });
      }
    }
  }, [layoutStyle, form]);

  // Field arrays for dynamic sections
  const heroFeatures = useFieldArray({
    control: form.control,
    name: "heroSection.features" as any,
  });

  const pricingPlans = useFieldArray({
    control: form.control,
    name: "pricingPlans" as const,
  });

  const screenshots = useFieldArray({
    control: form.control,
    name: "screenshots" as const,
  });

  const statistics = useFieldArray({
    control: form.control,
    name: "statisticsSection.statistics" as const,
  });

  const benefits = useFieldArray({
    control: form.control,
    name: "benefitsSection.benefits" as const,
  });

  // Field arrays for sidebarContent sections
  const howItWorksSteps = useFieldArray({
    control: form.control,
    name: "sidebarContent.howItWorks" as const,
  });

  const faqs = useFieldArray({
    control: form.control,
    name: "sidebarContent.faqs" as const,
  });

  const recommendations = useFieldArray({
    control: form.control,
    name: "sidebarContent.recommendations" as const,
  });

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Handle supportingLinks JSON parsing for footerCTA
      let parsedSupportingLinks;
      try {
        parsedSupportingLinks = data.footerCTA?.supportingLinks 
          ? (typeof data.footerCTA.supportingLinks === 'string' 
              ? JSON.parse(data.footerCTA.supportingLinks)
              : data.footerCTA.supportingLinks)
          : undefined;
      } catch (e) {
        // If JSON parsing fails, store as string
        parsedSupportingLinks = data.footerCTA?.supportingLinks;
      }

      // Generate slug from title if not in edit mode
      const slug = isEditMode ? undefined : data.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim() || 'product'; // Fallback to 'product' if empty

      const productData = {
        ...data,
        // Add slug for new products (always include for new products)
        ...(isEditMode ? {} : { slug }),
        // Keep prices as strings for decimal fields in database
        price: data.price || "0",
        originalPrice: data.originalPrice || undefined,
        // Convert tags from comma-separated string to array for server
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        
        // Handle conditional ChatGPT-style fields
        ...(data.layoutStyle === 'chatgpt' && {
          heroSection: data.heroSection,
          pricingPlans: data.pricingPlans,
          screenshots: data.screenshots,
          statisticsSection: data.statisticsSection,
          benefitsSection: data.benefitsSection,
          footerCTA: data.footerCTA ? {
            ...data.footerCTA,
            supportingLinks: parsedSupportingLinks,
          } : undefined,
        }),
        
        // Clean up empty values for traditional layout
        ...(data.layoutStyle === 'traditional' && {
          heroSection: undefined,
          pricingPlans: undefined,
          screenshots: undefined,
          statisticsSection: undefined,
          benefitsSection: undefined,
          footerCTA: undefined,
          sidebarContent: undefined,
        }),
      };
      
      // Clean up empty arrays and objects
      if (productData.pricingPlans && productData.pricingPlans.length === 0) {
        productData.pricingPlans = undefined;
      }
      if (productData.screenshots && productData.screenshots.length === 0) {
        productData.screenshots = undefined;
      }
      if (productData.statisticsSection?.statistics && productData.statisticsSection.statistics.length === 0) {
        productData.statisticsSection.statistics = undefined;
      }
      if (productData.benefitsSection?.benefits && productData.benefitsSection.benefits.length === 0) {
        productData.benefitsSection.benefits = undefined;
      }
      
      return apiRequest(isEditMode ? 'PUT' : 'POST', isEditMode ? `/api/products/${product.id}` : '/api/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['/api/products', product.id] });
      }
      toast({
        title: "Success",
        description: isEditMode ? "Product updated successfully!" : "Product created successfully with all configured sections!",
      });
      if (!isEditMode) {
        form.reset();
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    productMutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic fields - always shown */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter product title"
                data-testid="product-title-input"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="0.00"
                data-testid="product-price-input"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                {...form.register("originalPrice")}
                placeholder="0.00"
                data-testid="product-original-price-input"
              />
            </div>

            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select 
                value={form.watch("categoryId") || ""} 
                onValueChange={(value) => form.setValue("categoryId", value)}
              >
                <SelectTrigger data-testid="product-category-select">
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
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter product description"
              rows={4}
              data-testid="product-description-input"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              {...form.register("image")}
              placeholder="https://example.com/image.jpg"
              data-testid="product-image-input"
            />
            {form.formState.errors.image && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.image.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...form.register("tags")}
              placeholder="electronics, smartphone, featured"
              data-testid="product-tags-input"
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={form.watch("inStock") ?? true}
                onCheckedChange={(checked) => form.setValue("inStock", checked as boolean)}
                data-testid="product-in-stock-checkbox"
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={form.watch("featured") ?? false}
                onCheckedChange={(checked) => form.setValue("featured", checked as boolean)}
                data-testid="product-featured-checkbox"
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
          </div>

          {/* Featured Area Text Field */}
          {form.watch("featured") && (
            <div>
              <Label htmlFor="featuredAreaText">Featured Area Text</Label>
              <Textarea
                id="featuredAreaText"
                {...form.register("featuredAreaText")}
                placeholder="Enter text to display when this product is featured on the homepage"
                rows={3}
                data-testid="product-featured-area-text"
              />
              <p className="text-sm text-gray-500 mt-1">
                This text will appear on the homepage when the product is featured
              </p>
            </div>
          )}

          {/* ChatGPT-style fields - always shown */}
          <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  ChatGPT-style Layout Configuration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure additional sections for the enhanced product layout
                </p>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="hero">Hero</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
                    <TabsTrigger value="footer">Footer CTA</TabsTrigger>
                    <TabsTrigger value="blog">Blog Content</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4">
                    <h4 className="text-md font-medium mb-4">Basic Product Information</h4>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="basic-title">Product Title *</Label>
                        <Input
                          id="basic-title"
                          {...form.register("title")}
                          placeholder="Enter product title"
                          data-testid="product-title-input"
                        />
                        {form.formState.errors.title && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="basic-price">Price *</Label>
                        <Input
                          id="basic-price"
                          type="number"
                          step="0.01"
                          {...form.register("price")}
                          placeholder="0.00"
                          data-testid="product-price-input"
                        />
                        {form.formState.errors.price && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.price.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="basic-originalPrice">Original Price</Label>
                        <Input
                          id="basic-originalPrice"
                          type="number"
                          step="0.01"
                          {...form.register("originalPrice")}
                          placeholder="0.00"
                          data-testid="product-original-price-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="basic-categoryId">Category *</Label>
                        <Select 
                          value={form.watch("categoryId") || ""} 
                          onValueChange={(value) => form.setValue("categoryId", value)}
                        >
                          <SelectTrigger data-testid="product-category-select">
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
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.categoryId.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="basic-description">Description *</Label>
                      <Textarea
                        id="basic-description"
                        {...form.register("description")}
                        placeholder="Enter product description"
                        rows={4}
                        data-testid="product-description-input"
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="basic-image">Image URL</Label>
                      <Input
                        id="basic-image"
                        type="url"
                        {...form.register("image")}
                        placeholder="https://example.com/image.jpg"
                        data-testid="product-image-input"
                      />
                      {form.formState.errors.image && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.image.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="basic-tags">Tags (comma-separated)</Label>
                      <Input
                        id="basic-tags"
                        {...form.register("tags")}
                        placeholder="electronics, smartphone, featured"
                        data-testid="product-tags-input"
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="basic-inStock"
                          checked={!!form.watch("inStock")}
                          onCheckedChange={(checked) => form.setValue("inStock", checked as boolean)}
                          data-testid="product-in-stock-checkbox"
                        />
                        <Label htmlFor="basic-inStock">In Stock</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="basic-featured"
                          checked={!!form.watch("featured")}
                          onCheckedChange={(checked) => form.setValue("featured", checked as boolean)}
                          data-testid="product-featured-checkbox"
                        />
                        <Label htmlFor="basic-featured">Featured Product</Label>
                      </div>
                    </div>

                    {/* Featured Area Text Field */}
                    {form.watch("featured") && (
                      <div>
                        <Label htmlFor="basic-featuredAreaText">Featured Area Text</Label>
                        <Textarea
                          id="basic-featuredAreaText"
                          {...form.register("featuredAreaText")}
                          placeholder="Enter text to display when this product is featured on the homepage"
                          rows={3}
                          data-testid="product-featured-area-text"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          This text will appear on the homepage when the product is featured
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Hero Section Tab */}
                  <TabsContent value="hero" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="heroTitleOverride">Title Override</Label>
                        <Input
                          id="heroTitleOverride"
                          {...form.register("heroSection.titleOverride")}
                          placeholder="Override the main product title"
                          data-testid="hero-title-override-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="heroIcon">Hero Icon</Label>
                        <Input
                          id="heroIcon"
                          {...form.register("heroSection.heroIcon")}
                          placeholder="Icon class or URL"
                          data-testid="hero-icon-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="heroSubtitle">Subtitle</Label>
                      <Input
                        id="heroSubtitle"
                        {...form.register("heroSection.subtitle")}
                        placeholder="Enter hero subtitle"
                        data-testid="hero-subtitle-input"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rtlDirection"
                        checked={form.watch("heroSection.rtlDirection")}
                        onCheckedChange={(checked) => form.setValue("heroSection.rtlDirection", checked as boolean)}
                        data-testid="hero-rtl-direction-checkbox"
                      />
                      <Label htmlFor="rtlDirection">Right-to-left Direction</Label>
                    </div>

                    {/* Hero Features Array */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Hero Features</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => heroFeatures.append("")}
                          data-testid="add-hero-feature"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Feature
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {heroFeatures.fields.map((field, index) => (
                          <div key={field.id} className="flex gap-2">
                            <Input
                              {...form.register(`heroSection.features.${index}` as const)}
                              placeholder="Enter feature description"
                              data-testid={`hero-feature-${index}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => heroFeatures.remove(index)}
                              data-testid={`remove-hero-feature-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {heroFeatures.fields.length === 0 && (
                          <p className="text-sm text-gray-500 italic">
                            No features added yet. Click "Add Feature" to get started.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Pricing Plans Tab */}
                  <TabsContent value="pricing" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium">Pricing Plans</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pricingPlans.append({
                          duration: "",
                          price: "",
                          originalPrice: "",
                          discount: "",
                          priceNumber: 0,
                          popular: false,
                          features: []
                        })}
                        data-testid="add-pricing-plan"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Plan
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {pricingPlans.fields.map((field, planIndex) => (
                        <Card key={field.id} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-medium">Plan {planIndex + 1}</h5>
                            <div className="flex gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={form.watch(`pricingPlans.${planIndex}.popular`)}
                                  onCheckedChange={(checked) => 
                                    form.setValue(`pricingPlans.${planIndex}.popular`, checked as boolean)
                                  }
                                  data-testid={`pricing-plan-popular-${planIndex}`}
                                />
                                <Label className="text-sm">Popular</Label>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => pricingPlans.remove(planIndex)}
                                data-testid={`remove-pricing-plan-${planIndex}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                            <div>
                              <Label htmlFor={`duration-${planIndex}`}>Duration</Label>
                              <Input
                                id={`duration-${planIndex}`}
                                {...form.register(`pricingPlans.${planIndex}.duration` as const)}
                                placeholder="e.g. Monthly, Yearly"
                                data-testid={`pricing-plan-duration-${planIndex}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`price-${planIndex}`}>Price</Label>
                              <Input
                                id={`price-${planIndex}`}
                                {...form.register(`pricingPlans.${planIndex}.price` as const)}
                                placeholder="e.g. $9.99"
                                data-testid={`pricing-plan-price-${planIndex}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`originalPrice-${planIndex}`}>Original Price</Label>
                              <Input
                                id={`originalPrice-${planIndex}`}
                                {...form.register(`pricingPlans.${planIndex}.originalPrice` as const)}
                                placeholder="e.g. $19.99"
                                data-testid={`pricing-plan-original-price-${planIndex}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                            <div>
                              <Label htmlFor={`discount-${planIndex}`}>Discount</Label>
                              <Input
                                id={`discount-${planIndex}`}
                                {...form.register(`pricingPlans.${planIndex}.discount` as const)}
                                placeholder="e.g. 50% OFF"
                                data-testid={`pricing-plan-discount-${planIndex}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`priceNumber-${planIndex}`}>Price Number</Label>
                              <Input
                                id={`priceNumber-${planIndex}`}
                                type="number"
                                step="0.01"
                                {...form.register(`pricingPlans.${planIndex}.priceNumber` as const, { valueAsNumber: true })}
                                placeholder="9.99"
                                data-testid={`pricing-plan-price-number-${planIndex}`}
                              />
                            </div>
                          </div>

                          {/* Plan Features */}
                          <PricingPlanFeatures planIndex={planIndex} form={form} />
                        </Card>
                      ))}

                      {pricingPlans.fields.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="mb-2">No pricing plans added yet.</p>
                          <p className="text-sm">Click "Add Plan" to create your first pricing plan.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Features Grid Tab */}
                  <TabsContent value="features" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium">Features Grid</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => screenshots.append({
                          title: "",
                          description: "",
                          image: "",
                          gradient: "",
                          icon: ""
                        })}
                        data-testid="add-feature"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {screenshots.fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-medium">Feature {index + 1}</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => screenshots.remove(index)}
                              data-testid={`remove-screenshot-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                            <div>
                              <Label htmlFor={`screenshot-title-${index}`}>Title</Label>
                              <Input
                                id={`screenshot-title-${index}`}
                                {...form.register(`screenshots.${index}.title` as const)}
                                placeholder="Feature title"
                                data-testid={`screenshot-title-${index}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`screenshot-icon-${index}`}>Icon</Label>
                              <Input
                                id={`screenshot-icon-${index}`}
                                {...form.register(`screenshots.${index}.icon` as const)}
                                placeholder="Icon class or URL"
                                data-testid={`screenshot-icon-${index}`}
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <Label htmlFor={`screenshot-description-${index}`}>Description</Label>
                            <Textarea
                              id={`screenshot-description-${index}`}
                              {...form.register(`screenshots.${index}.description` as const)}
                              placeholder="Feature description"
                              rows={3}
                              data-testid={`screenshot-description-${index}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <Label htmlFor={`screenshot-image-${index}`}>Image URL</Label>
                              <Input
                                id={`screenshot-image-${index}`}
                                type="url"
                                {...form.register(`screenshots.${index}.image` as const)}
                                placeholder="https://example.com/image.jpg"
                                data-testid={`screenshot-image-${index}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`screenshot-gradient-${index}`}>Gradient</Label>
                              <Input
                                id={`screenshot-gradient-${index}`}
                                {...form.register(`screenshots.${index}.gradient` as const)}
                                placeholder="e.g. linear-gradient(45deg, #ff0000, #0000ff)"
                                data-testid={`screenshot-gradient-${index}`}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}

                      {screenshots.fields.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="mb-2">No features added yet.</p>
                          <p className="text-sm">Click "Add Feature" to showcase your product features with visual elements and descriptions.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Statistics Tab */}
                  <TabsContent value="statistics" className="space-y-4">
                    <h4 className="text-md font-medium mb-4">Statistics Section</h4>

                    {/* Section Header Fields */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                      <div>
                        <Label htmlFor="statisticsTitle">Section Title</Label>
                        <Input
                          id="statisticsTitle"
                          {...form.register("statisticsSection.title")}
                          placeholder="Statistics section title"
                          data-testid="statistics-section-title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="statisticsSubtitle">Section Subtitle</Label>
                        <Input
                          id="statisticsSubtitle"
                          {...form.register("statisticsSection.subtitle")}
                          placeholder="Statistics section subtitle"
                          data-testid="statistics-section-subtitle"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="statisticsGradient">Background Gradient</Label>
                      <Input
                        id="statisticsGradient"
                        {...form.register("statisticsSection.backgroundGradient")}
                        placeholder="e.g. linear-gradient(45deg, #ff0000, #0000ff)"
                        data-testid="statistics-section-gradient"
                      />
                    </div>

                    <Separator />

                    {/* Statistics Array */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-medium">Statistics</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => statistics.append({
                            icon: "",
                            value: "",
                            label: ""
                          })}
                          data-testid="add-statistic"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Statistic
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {statistics.fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h6 className="text-sm font-medium">Statistic {index + 1}</h6>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => statistics.remove(index)}
                                data-testid={`remove-statistic-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div>
                                <Label htmlFor={`statistic-icon-${index}`}>Icon</Label>
                                <Input
                                  id={`statistic-icon-${index}`}
                                  {...form.register(`statisticsSection.statistics.${index}.icon` as const)}
                                  placeholder="Icon class or URL"
                                  data-testid={`statistic-icon-${index}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`statistic-value-${index}`}>Value *</Label>
                                <Input
                                  id={`statistic-value-${index}`}
                                  {...form.register(`statisticsSection.statistics.${index}.value` as const)}
                                  placeholder="e.g. 10K+, 99%"
                                  data-testid={`statistic-value-${index}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`statistic-label-${index}`}>Label *</Label>
                                <Input
                                  id={`statistic-label-${index}`}
                                  {...form.register(`statisticsSection.statistics.${index}.label` as const)}
                                  placeholder="e.g. Happy customers"
                                  data-testid={`statistic-label-${index}`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}

                        {statistics.fields.length === 0 && (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="mb-2">No statistics added yet.</p>
                            <p className="text-sm">Click "Add Statistic" to showcase key numbers about your product.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Benefits Tab */}
                  <TabsContent value="benefits" className="space-y-4">
                    <h4 className="text-md font-medium mb-4">Benefits Section</h4>

                    {/* Section Title Field */}
                    <div className="mb-6">
                      <Label htmlFor="benefitsTitle">Section Title</Label>
                      <Input
                        id="benefitsTitle"
                        {...form.register("benefitsSection.title")}
                        placeholder="Benefits section title"
                        data-testid="benefits-section-title"
                      />
                    </div>

                    <Separator />

                    {/* Benefits Array */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-medium">Benefits</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => benefits.append({
                            icon: "",
                            title: "",
                            description: "",
                            gradient: ""
                          })}
                          data-testid="add-benefit"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Benefit
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {benefits.fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h6 className="text-sm font-medium">Benefit {index + 1}</h6>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => benefits.remove(index)}
                                data-testid={`remove-benefit-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                              <div>
                                <Label htmlFor={`benefit-title-${index}`}>Title *</Label>
                                <Input
                                  id={`benefit-title-${index}`}
                                  {...form.register(`benefitsSection.benefits.${index}.title` as const)}
                                  placeholder="Benefit title"
                                  data-testid={`benefit-title-${index}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`benefit-icon-${index}`}>Icon</Label>
                                <Input
                                  id={`benefit-icon-${index}`}
                                  {...form.register(`benefitsSection.benefits.${index}.icon` as const)}
                                  placeholder="Icon class or URL"
                                  data-testid={`benefit-icon-${index}`}
                                />
                              </div>
                            </div>

                            <div className="mb-4">
                              <Label htmlFor={`benefit-description-${index}`}>Description *</Label>
                              <Textarea
                                id={`benefit-description-${index}`}
                                {...form.register(`benefitsSection.benefits.${index}.description` as const)}
                                placeholder="Describe this benefit"
                                rows={3}
                                data-testid={`benefit-description-${index}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`benefit-gradient-${index}`}>Background Gradient</Label>
                              <Input
                                id={`benefit-gradient-${index}`}
                                {...form.register(`benefitsSection.benefits.${index}.gradient` as const)}
                                placeholder="e.g. linear-gradient(45deg, #ff0000, #0000ff)"
                                data-testid={`benefit-gradient-${index}`}
                              />
                            </div>
                          </Card>
                        ))}

                        {benefits.fields.length === 0 && (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="mb-2">No benefits added yet.</p>
                            <p className="text-sm">Click "Add Benefit" to highlight your product's advantages.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Footer CTA Tab */}
                  <TabsContent value="footer" className="space-y-4">
                    <h4 className="text-md font-medium mb-4">Footer CTA Section</h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                      <div>
                        <Label htmlFor="footerCtaTitle">CTA Title</Label>
                        <Input
                          id="footerCtaTitle"
                          {...form.register("footerCTA.title")}
                          placeholder="Call-to-action title"
                          data-testid="footer-cta-title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="footerCtaSubtitle">CTA Subtitle</Label>
                        <Input
                          id="footerCtaSubtitle"
                          {...form.register("footerCTA.subtitle")}
                          placeholder="Call-to-action subtitle"
                          data-testid="footer-cta-subtitle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                      <div>
                        <Label htmlFor="footerCtaButtonText">Button Text</Label>
                        <Input
                          id="footerCtaButtonText"
                          {...form.register("footerCTA.buttonText")}
                          placeholder="e.g. Get Started Now"
                          data-testid="footer-cta-button-text"
                        />
                      </div>

                      <div>
                        <Label htmlFor="footerCtaButtonUrl">Button URL</Label>
                        <Input
                          id="footerCtaButtonUrl"
                          type="url"
                          {...form.register("footerCTA.buttonUrl")}
                          placeholder="https://example.com/signup"
                          data-testid="footer-cta-button-url"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="footerCtaSupportingLinks">Supporting Links (JSON)</Label>
                      <Textarea
                        id="footerCtaSupportingLinks"
                        {...form.register("footerCTA.supportingLinks")}
                        placeholder='{"help": "https://example.com/help", "contact": "https://example.com/contact"}'
                        rows={4}
                        data-testid="footer-cta-supporting-links"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Optional: Enter JSON object with supporting links (e.g., help, contact, documentation)
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h6 className="text-sm font-medium mb-2">Preview</h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This section will appear at the bottom of your ChatGPT-style product page with a prominent call-to-action button and optional supporting links.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Sidebar Content Tab */}
                  <TabsContent value="sidebar" className="space-y-6">
                    <h4 className="text-md font-medium mb-4">Sidebar Content Configuration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure additional content sections that appear in the product details sidebar.
                    </p>

                    {/* How It Works Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">How It Works Steps</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => howItWorksSteps.append({
                            step: (howItWorksSteps.fields.length + 1).toString(),
                            title: "",
                            description: "",
                          })}
                          data-testid="add-how-it-works-step"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Step
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {howItWorksSteps.fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">Step {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => howItWorksSteps.remove(index)}
                                data-testid={`remove-how-it-works-step-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <Label htmlFor={`how-it-works-step-${index}`}>Step Number</Label>
                                <Input
                                  id={`how-it-works-step-${index}`}
                                  {...form.register(`sidebarContent.howItWorks.${index}.step` as const)}
                                  placeholder="1"
                                  data-testid={`how-it-works-step-number-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`how-it-works-title-${index}`}>Title</Label>
                                <Input
                                  id={`how-it-works-title-${index}`}
                                  {...form.register(`sidebarContent.howItWorks.${index}.title` as const)}
                                  placeholder="Step title"
                                  data-testid={`how-it-works-title-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`how-it-works-description-${index}`}>Description</Label>
                                <Textarea
                                  id={`how-it-works-description-${index}`}
                                  {...form.register(`sidebarContent.howItWorks.${index}.description` as const)}
                                  placeholder="Step description"
                                  rows={2}
                                  data-testid={`how-it-works-description-${index}`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                        {howItWorksSteps.fields.length === 0 && (
                          <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>No steps added yet. Click "Add Step" to get started.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* FAQs Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Frequently Asked Questions</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => faqs.append({
                            question: "",
                            answer: "",
                          })}
                          data-testid="add-faq"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add FAQ
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {faqs.fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">FAQ {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => faqs.remove(index)}
                                data-testid={`remove-faq-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <Label htmlFor={`faq-question-${index}`}>Question</Label>
                                <Input
                                  id={`faq-question-${index}`}
                                  {...form.register(`sidebarContent.faqs.${index}.question` as const)}
                                  placeholder="Frequently asked question"
                                  data-testid={`faq-question-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                                <Textarea
                                  id={`faq-answer-${index}`}
                                  {...form.register(`sidebarContent.faqs.${index}.answer` as const)}
                                  placeholder="Answer to the question"
                                  rows={3}
                                  data-testid={`faq-answer-${index}`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                        {faqs.fields.length === 0 && (
                          <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Recommendations Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Recommendations</h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => recommendations.append({
                            icon: "",
                            name: "",
                            price: "",
                            backgroundColor: "",
                          })}
                          data-testid="add-recommendation"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Recommendation
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {recommendations.fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">Recommendation {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => recommendations.remove(index)}
                                data-testid={`remove-recommendation-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`recommendation-icon-${index}`}>Icon</Label>
                                <Input
                                  id={`recommendation-icon-${index}`}
                                  {...form.register(`sidebarContent.recommendations.${index}.icon` as const)}
                                  placeholder="Icon class or emoji"
                                  data-testid={`recommendation-icon-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`recommendation-name-${index}`}>Name</Label>
                                <Input
                                  id={`recommendation-name-${index}`}
                                  {...form.register(`sidebarContent.recommendations.${index}.name` as const)}
                                  placeholder="Recommendation name"
                                  data-testid={`recommendation-name-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`recommendation-price-${index}`}>Price</Label>
                                <Input
                                  id={`recommendation-price-${index}`}
                                  {...form.register(`sidebarContent.recommendations.${index}.price` as const)}
                                  placeholder="$99"
                                  data-testid={`recommendation-price-${index}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`recommendation-background-${index}`}>Background Color</Label>
                                <Input
                                  id={`recommendation-background-${index}`}
                                  {...form.register(`sidebarContent.recommendations.${index}.backgroundColor` as const)}
                                  placeholder="#ffffff or transparent"
                                  data-testid={`recommendation-background-${index}`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                        {recommendations.fields.length === 0 && (
                          <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>No recommendations added yet. Click "Add Recommendation" to get started.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Blog Content Tab */}
                  <TabsContent value="blog" className="space-y-4">
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2">Blog Content</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create rich content using the WordPress Gutenberg-style editor. This content will be displayed on the product details page.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <BlogEditor
                        content={form.watch('blogContent') || ""}
                        onChange={(content) => {
                          form.setValue('blogContent', content, { shouldValidate: true });
                        }}
                        onSave={() => {
                          // Save handled by main form submission
                          toast({
                            title: "Content Updated",
                            description: "Blog content has been updated in the form. Remember to save the product to persist changes.",
                          });
                        }}
                      />

                      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                        <h5 className="font-medium mb-2">📝 Blog Content Tips:</h5>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Use formatting tools to create engaging content</li>
                          <li>Upload images to enhance your product descriptions</li>
                          <li>Content will appear in the main product details section</li>
                          <li>Don't forget to save the entire product form when done</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={productMutation.isPending}
              data-testid="submit-product"
            >
              {productMutation.isPending 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Product" : "Create Product")
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="cancel-product"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}