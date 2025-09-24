import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Helper function to get CSRF token from cookies (same as queryClient.ts)
function getCSRFToken(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}
import SEOPreview from "@/components/SEOPreview";
import { type Product, insertProductSchema, insertProductPlanSchema, type ProductPlan } from "@shared/schema";
import { Plus, Trash2, Save, RotateCcw, Upload, Image as ImageIcon, X, Eye, ArrowUp, ArrowDown, Edit, CheckCircle, XCircle, DollarSign, Star } from "lucide-react";

// English-localized form validation schema based on shared schema
const getProductFormSchema = (isEditMode: boolean) => {
  const baseSchema = insertProductSchema.extend({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
    categoryId: z.string().min(1, "Category is required"),
    featuredFeatures: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string()).optional(),
  });
  
  if (isEditMode) {
    // In edit mode, remove price fields since plans handle pricing
    return baseSchema.omit({ price: true, originalPrice: true });
  } else {
    // In create mode, require price fields
    return baseSchema.extend({
      price: z.string().min(1, "Price is required"),
    });
  }
};

type ProductFormData = z.infer<ReturnType<typeof getProductFormSchema>>;

// Product plan form data and schema
const productPlanFormSchema = insertProductPlanSchema.extend({
  name: z.string().min(1, "نام پلان الزامی است"),
  price: z.string().min(1, "قیمت الزامی است").regex(/^\d+(\.\d{1,2})?$/, "فرمت قیمت نامعتبر است"),
  originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "فرمت قیمت نامعتبر است").optional().or(z.literal("")),
  description: z.string().optional(),
});

type ProductPlanFormData = z.infer<typeof productPlanFormSchema>;

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
  
  // Image upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(getProductFormSchema(isEditMode)),
    defaultValues: isEditMode ? {
      title: product.title || "",
      slug: product.slug || "",
      description: product.description || "",
      mainDescription: (product.mainDescription as string) || "",
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
      description: "",
      mainDescription: "",
      buyLink: "",
      categoryId: "",
      image: "",
      inStock: true,
      featured: false,
      featuredTitle: "",
      featuredFeatures: [],
      tags: [],
      ...(isEditMode ? {} : {
        price: "",
        originalPrice: "",
      }),
    } as any,
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

  // Plans-related hooks and state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  
  // Plans form for adding/editing plans
  const planForm = useForm<ProductPlanFormData>({
    resolver: zodResolver(productPlanFormSchema),
    defaultValues: {
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      isDefault: false,
      isActive: true,
      sortOrder: 0,
    },
  });

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

  // Fetch product plans when in edit mode
  const { 
    data: plans = [], 
    isLoading: plansLoading, 
    error: plansError 
  } = useQuery<ProductPlan[]>({
    queryKey: ['/api/products', product?.id, 'plans'],
    enabled: isEditMode && !!product?.id,
  });

  // Get default plan for price synchronization
  const defaultPlan = plans.find((plan: ProductPlan) => plan.isDefault);
  
  // Auto-save functionality (visual indicator only)
  useEffect(() => {
    const subscription = form.watch(() => {
      setAutoSaveIndicator(true);
      const timer = setTimeout(() => setAutoSaveIndicator(false), 2000);
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Set image preview when form image value changes
  useEffect(() => {
    const imageValue = form.watch("image");
    if (imageValue && imageValue !== imagePreview) {
      setImagePreview(imageValue);
    }
  }, [form.watch("image"), imagePreview]);

  // Image upload mutation
  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Get CSRF token for authenticated image upload
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {};
      
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      
      // Use fetch directly for file upload with progress
      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل رفع فایل');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const imageUrl = data.imageUrl;
      form.setValue("image", imageUrl);
      setImagePreview(imageUrl);
      setUploadingImage(false);
      toast({
        title: "موفقیت",
        description: "تصویر با موفقیت آپلود شد",
      });
    },
    onError: (error) => {
      setUploadingImage(false);
      
      // Check for authentication errors and provide helpful message
      if (error.message.includes('Invalid or expired session')) {
        toast({
          title: "جلسه منقضی شده",
          description: "لطفاً دوباره وارد پنل مدیریت شوید و سپس تصویر را آپلود کنید.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا",
          description: `خطا در آپلود تصویر: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  // File validation function
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'لطفاً فقط فایل‌های تصویری انتخاب کنید';
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'حجم فایل نباید بیشتر از ۵ مگابایت باشد';
    }
    
    return null;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      toast({
        title: "خطا",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    
    // Create preview immediately for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    imageUploadMutation.mutate(file);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    form.setValue("image", "");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "تصویر حذف شد",
      description: "تصویر محصول با موفقیت حذف شد",
    });
  };

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
        // In create mode, ensure prices are included
        ...(!isEditMode && {
          price: (data as any).price || "0",
          originalPrice: (data as any).originalPrice || undefined,
        }),
        // Clean up empty values
        buyLink: data.buyLink || undefined,
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

  // Plans mutations
  const createPlanMutation = useMutation({
    mutationFn: async (planData: ProductPlanFormData) => {
      if (!product?.id) throw new Error("Product ID is required");
      return apiRequest('POST', `/api/products/${product.id}/plans`, planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', product?.id, 'plans'] });
      toast({
        title: "موفقیت",
        description: "پلان جدید با موفقیت اضافه شد",
      });
      planForm.reset();
      setShowAddPlan(false);
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: `خطا در ایجاد پلان: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation<ProductPlan, Error, ProductPlanFormData & { id: string }>({
    mutationFn: async ({ id, ...planData }: ProductPlanFormData & { id: string }) => {
      const response = await apiRequest('PUT', `/api/product-plans/${id}`, planData);
      return response as unknown as ProductPlan;
    },
    onSuccess: (updatedPlan: ProductPlan) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', product?.id, 'plans'] });
      
      // If this plan became default, sync product price
      if (updatedPlan.isDefault) {
        syncProductPrice(updatedPlan);
      }
      
      toast({
        title: "موفقیت",
        description: "پلان با موفقیت به‌روزرسانی شد",
      });
      setEditingPlanId(null);
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: `خطا در به‌روزرسانی پلان: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('DELETE', `/api/product-plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', product?.id, 'plans'] });
      toast({
        title: "موفقیت",
        description: "پلان با موفقیت حذف شد",
      });
      setDeletingPlanId(null);
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: `خطا در حذف پلان: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Price synchronization function
  const syncProductPrice = async (plan: ProductPlan) => {
    if (!product?.id) return;
    
    try {
      await apiRequest('PATCH', `/api/products/${product.id}`, {
        price: plan.price,
        originalPrice: plan.originalPrice || undefined,
      });
      
      // Invalidate product cache
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}`] });
    } catch (error) {
      console.error('Failed to sync product price:', error);
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    productMutation.mutate(data);
  };

  const onPlanSubmit: SubmitHandler<ProductPlanFormData> = (data) => {
    if (editingPlanId) {
      updatePlanMutation.mutate({ ...data, id: editingPlanId });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  // Start editing a plan
  const startEditingPlan = (plan: ProductPlan) => {
    setEditingPlanId(plan.id);
    planForm.reset({
      name: plan.name,
      price: plan.price.toString(),
      originalPrice: plan.originalPrice?.toString() || "",
      description: plan.description || "",
      isDefault: plan.isDefault,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder ?? 0,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPlanId(null);
    planForm.reset();
  };

  // Handle add new plan
  const handleAddPlan = () => {
    setShowAddPlan(true);
    planForm.reset({
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      isDefault: plans.length === 0, // First plan is default
      isActive: true,
      sortOrder: Math.max(...plans.map((p: ProductPlan) => p.sortOrder ?? 0), -1) + 1,
    });
  };

  // Handle plan default toggle
  const handleToggleDefault = async (planId: string, currentDefault: boolean) => {
    if (currentDefault) {
      toast({
        title: "هشدار",
        description: "حداقل یک پلان باید به عنوان پیش‌فرض انتخاب شود",
        variant: "destructive",
      });
      return;
    }

    // First, set all other plans to non-default
    const otherPlans = plans.filter((plan: ProductPlan) => plan.id !== planId && plan.isDefault);
    for (const otherPlan of otherPlans) {
      await updatePlanMutation.mutateAsync({ 
        id: otherPlan.id, 
        productId: product!.id,
        isDefault: false,
        name: otherPlan.name,
        price: otherPlan.price.toString(),
        originalPrice: otherPlan.originalPrice?.toString() || "",
        description: otherPlan.description || "",
        isActive: otherPlan.isActive,
        sortOrder: otherPlan.sortOrder ?? 0,
      });
    }

    // Then set this plan as default
    const plan = plans.find((p: ProductPlan) => p.id === planId);
    if (plan) {
      await updatePlanMutation.mutateAsync({ 
        id: planId, 
        productId: product!.id,
        isDefault: true,
        name: plan.name,
        price: plan.price.toString(),
        originalPrice: plan.originalPrice?.toString() || "",
        description: plan.description || "",
        isActive: plan.isActive,
        sortOrder: plan.sortOrder ?? 0,
      });
    }
  };

  // Handle plan reordering
  const handleReorderPlan = async (planId: string, direction: 'up' | 'down') => {
    const plan = plans.find((p: ProductPlan) => p.id === planId);
    if (!plan) return;

    const currentOrder = plan.sortOrder ?? 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find plan to swap with
    const swapPlan = plans.find((p: ProductPlan) => p.sortOrder === newOrder);
    
    if (swapPlan) {
      // Swap sort orders
      await Promise.all([
        updatePlanMutation.mutateAsync({ 
          id: plan.id, 
          productId: product!.id,
          sortOrder: newOrder,
          name: plan.name,
          price: plan.price.toString(),
          originalPrice: plan.originalPrice?.toString() || "",
          description: plan.description || "",
          isDefault: plan.isDefault,
          isActive: plan.isActive,
        }),
        updatePlanMutation.mutateAsync({ 
          id: swapPlan.id, 
          productId: product!.id,
          sortOrder: currentOrder ?? 0,
          name: swapPlan.name,
          price: swapPlan.price.toString(),
          originalPrice: swapPlan.originalPrice?.toString() || "",
          description: swapPlan.description || "",
          isDefault: swapPlan.isDefault,
          isActive: swapPlan.isActive,
        }),
      ]);
    }
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
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
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
              {!isEditMode ? (
                /* Create Mode - Show pricing fields */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">
                      Current Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register("price" as any)}
                      placeholder="0.00"
                      className="mt-1"
                      data-testid="input-price"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1" dir="ltr">
                      Product's current price
                    </p>
                    {(form.formState.errors as any).price && (
                      <p className="text-sm text-red-600 mt-1" dir="ltr">
                        {(form.formState.errors as any).price?.message}
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
                      {...form.register("originalPrice" as any)}
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
              ) : (
                /* Edit Mode - Complete Plans Manager Interface */
                <div className="space-y-6">
                  {/* Default Plan Info - Keep existing */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                      مدیریت پلان‌های قیمت‌گذاری
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300" dir="rtl">
                      در حالت ویرایش، قیمت‌گذاری از طریق پلان‌های محصول مدیریت می‌شود. از بخش زیر برای ایجاد و مدیریت گزینه‌های قیمت‌گذاری مختلف استفاده کنید.
                    </p>
                    {defaultPlan && (
                      <div className="mt-3 p-3 bg-white dark:bg-blue-900 rounded border" dir="rtl">
                        <p className="text-sm font-medium">پلان پیش‌فرض: {defaultPlan.name}</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${defaultPlan.price}
                          {defaultPlan.originalPrice && (
                            <span className="text-sm text-gray-500 line-through mr-2">
                              ${defaultPlan.originalPrice}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Plans List Interface */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between" dir="rtl">
                      <h4 className="text-lg font-semibold">لیست پلان‌ها</h4>
                      <Button
                        type="button"
                        onClick={handleAddPlan}
                        disabled={showAddPlan}
                        className="gap-2"
                        data-testid="button-add-plan"
                      >
                        <Plus className="h-4 w-4" />
                        اضافه کردن پلان جدید
                      </Button>
                    </div>

                    {/* Loading State */}
                    {plansLoading && (
                      <div className="flex items-center justify-center p-8" data-testid="plans-loading">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="mr-3">در حال بارگذاری پلان‌ها...</span>
                      </div>
                    )}

                    {/* Error State */}
                    {plansError && (
                      <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800" dir="rtl">
                        <p className="text-red-600 dark:text-red-400">خطا در بارگذاری پلان‌ها: {plansError.message}</p>
                      </div>
                    )}

                    {/* Plans List */}
                    {!plansLoading && !plansError && (
                      <>
                        {plans.length === 0 ? (
                          /* Empty State */
                          <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600" dir="rtl" data-testid="plans-empty-state">
                            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                              هیچ پلانی تعریف نشده
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                              برای شروع، اولین پلان قیمت‌گذاری خود را ایجاد کنید
                            </p>
                            <Button
                              type="button"
                              onClick={handleAddPlan}
                              variant="outline"
                              className="gap-2"
                              data-testid="button-add-first-plan"
                            >
                              <Plus className="h-4 w-4" />
                              ایجاد پلان جدید
                            </Button>
                          </div>
                        ) : (
                          /* Plans Table/Cards */
                          <div className="space-y-3">
                            {plans
                              .sort((a: ProductPlan, b: ProductPlan) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                              .map((plan: ProductPlan) => (
                              <Card key={plan.id} className="p-4" data-testid={`plan-card-${plan.id}`}>
                                <div className="flex items-center justify-between gap-4" dir="rtl">
                                  {/* Plan Info */}
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                      <h5 className="font-semibold text-lg" data-testid={`plan-name-${plan.id}`}>
                                        {plan.name}
                                      </h5>
                                      <div className="flex gap-2">
                                        {plan.isDefault && (
                                          <Badge variant="default" data-testid={`plan-default-badge-${plan.id}`}>
                                            <Star className="h-3 w-3 ml-1" />
                                            پیش‌فرض
                                          </Badge>
                                        )}
                                        <Badge variant={plan.isActive ? "secondary" : "outline"} data-testid={`plan-status-badge-${plan.id}`}>
                                          {plan.isActive ? (
                                            <>
                                              <CheckCircle className="h-3 w-3 ml-1" />
                                              فعال
                                            </>
                                          ) : (
                                            <>
                                              <XCircle className="h-3 w-3 ml-1" />
                                              غیرفعال
                                            </>
                                          )}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span data-testid={`plan-price-${plan.id}`}>
                                        <strong>قیمت:</strong> ${plan.price}
                                      </span>
                                      {plan.originalPrice && (
                                        <span data-testid={`plan-original-price-${plan.id}`}>
                                          <strong>قیمت اصلی:</strong> <span className="line-through">${plan.originalPrice}</span>
                                        </span>
                                      )}
                                    </div>
                                    
                                    {plan.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`plan-description-${plan.id}`}>
                                        {plan.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    {/* Reorder buttons */}
                                    <div className="flex flex-col gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReorderPlan(plan.id, 'up')}
                                        disabled={updatePlanMutation.isPending}
                                        className="h-6 w-6 p-0"
                                        data-testid={`button-move-up-${plan.id}`}
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReorderPlan(plan.id, 'down')}
                                        disabled={updatePlanMutation.isPending}
                                        className="h-6 w-6 p-0"
                                        data-testid={`button-move-down-${plan.id}`}
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {/* Set as Default Button */}
                                    {!plan.isDefault && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleDefault(plan.id, Boolean(plan.isDefault))}
                                        disabled={updatePlanMutation.isPending}
                                        className="gap-1"
                                        data-testid={`button-set-default-${plan.id}`}
                                      >
                                        <Star className="h-3 w-3" />
                                        تنظیم به عنوان پیش‌فرض
                                      </Button>
                                    )}

                                    {/* Active/Inactive Toggle */}
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor={`plan-active-${plan.id}`} className="text-xs">فعال</Label>
                                      <Switch
                                        id={`plan-active-${plan.id}`}
                                        checked={Boolean(plan.isActive)}
                                        onCheckedChange={async (checked) => {
                                          await updatePlanMutation.mutateAsync({
                                            id: plan.id,
                                            productId: product!.id,
                                            isActive: checked,
                                            name: plan.name,
                                            price: plan.price.toString(),
                                            originalPrice: plan.originalPrice?.toString() || "",
                                            description: plan.description || "",
                                            isDefault: plan.isDefault,
                                            sortOrder: plan.sortOrder ?? 0,
                                          });
                                        }}
                                        disabled={updatePlanMutation.isPending}
                                        data-testid={`switch-active-${plan.id}`}
                                      />
                                    </div>

                                    {/* Edit Button */}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startEditingPlan(plan)}
                                      disabled={updatePlanMutation.isPending || editingPlanId === plan.id}
                                      className="gap-1"
                                      data-testid={`button-edit-${plan.id}`}
                                    >
                                      <Edit className="h-3 w-3" />
                                      ویرایش
                                    </Button>

                                    {/* Delete Button */}
                                    <AlertDialog open={deletingPlanId === plan.id} onOpenChange={() => setDeletingPlanId(null)}>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setDeletingPlanId(plan.id)}
                                          disabled={deletePlanMutation.isPending || plans.length === 1}
                                          className="gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800"
                                          data-testid={`button-delete-${plan.id}`}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          حذف
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent dir="rtl">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>تأیید حذف پلان</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            آیا مطمئن هستید که می‌خواهید پلان "{plan.name}" را حذف کنید؟ این عمل قابل بازگشت نیست.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel data-testid={`button-cancel-delete-${plan.id}`}>
                                            انصراف
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => deletePlanMutation.mutate(plan.id)}
                                            disabled={deletePlanMutation.isPending}
                                            className="bg-red-600 hover:bg-red-700"
                                            data-testid={`button-confirm-delete-${plan.id}`}
                                          >
                                            {deletePlanMutation.isPending ? "در حال حذف..." : "حذف"}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Add New Plan Form */}
                    {(showAddPlan || editingPlanId) && (
                      <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" data-testid="plan-form-card">
                        <div className="space-y-4" dir="rtl">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold">
                              {editingPlanId ? "ویرایش پلان" : "اضافه کردن پلان جدید"}
                            </h5>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowAddPlan(false);
                                cancelEditing();
                              }}
                              data-testid="button-cancel-plan-form"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <Form {...planForm}>
                            <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={planForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>نام پلان *</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="پلان فوری، پلان مشترک، ..."
                                          data-testid="input-plan-name"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={planForm.control}
                                  name="price"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>قیمت *</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          placeholder="19.99"
                                          data-testid="input-plan-price"
                                          dir="ltr"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={planForm.control}
                                  name="originalPrice"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>قیمت اصلی</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          placeholder="29.99"
                                          data-testid="input-plan-original-price"
                                          dir="ltr"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={planForm.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>توضیحات</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="توضیحات اختیاری پلان"
                                          data-testid="input-plan-description"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="flex items-center gap-4">
                                <FormField
                                  control={planForm.control}
                                  name="isDefault"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={Boolean(field.value)}
                                          onCheckedChange={field.onChange}
                                          data-testid="checkbox-plan-default"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>پلان پیش‌فرض</FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={planForm.control}
                                  name="isActive"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={Boolean(field.value)}
                                          onCheckedChange={field.onChange}
                                          data-testid="checkbox-plan-active"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>پلان فعال</FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="flex gap-3 pt-2">
                                <Button
                                  type="submit"
                                  disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                                  className="gap-2"
                                  data-testid="button-save-plan"
                                >
                                  {(createPlanMutation.isPending || updatePlanMutation.isPending) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      در حال ذخیره...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4" />
                                      {editingPlanId ? "به‌روزرسانی پلان" : "ذخیره پلان"}
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setShowAddPlan(false);
                                    cancelEditing();
                                  }}
                                  disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                                  data-testid="button-cancel-plan"
                                >
                                  انصراف
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}

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
              {/* Modern Image Upload Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium" dir="rtl">
                  تصویر اصلی محصول
                </Label>
                
                <div className="border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                  {imagePreview ? (
                    /* Image Management Layout */
                    <div className="flex gap-4" dir="rtl">
                      {/* Image Preview - Left Side */}
                      <div className="relative">
                        <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                          <img
                            src={imagePreview}
                            alt="پیش‌نمای تصویر محصول"
                            className="w-full h-full object-cover"
                            data-testid="image-preview"
                          />
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls and Info - Right Side */}
                      <div className="flex-1 space-y-3">
                        {/* File Information - Inline */}
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-600 dark:text-gray-400">
                            <span>وضعیت: </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">✓ آپلود شده</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span>نوع فایل: </span>
                            <span className="font-mono text-xs">
                              {imagePreview.includes('.png') ? 'PNG' : 
                               imagePreview.includes('.jpg') || imagePreview.includes('.jpeg') ? 'JPEG' : 
                               imagePreview.includes('.gif') ? 'GIF' : 
                               imagePreview.includes('.webp') ? 'WebP' : 'Image'}
                            </span>
                          </div>
                          {uploadingImage && (
                            <div className="text-gray-600 dark:text-gray-400">
                              <span>پیشرفت: </span>
                              <span className="text-blue-600 dark:text-blue-400">در حال آپلود...</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons - 2x2 Grid */}
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800"
                              data-testid="button-replace-image"
                            >
                              <Upload className="h-4 w-4 ml-1" />
                              تغییر
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (imagePreview.startsWith('http')) {
                                  window.open(imagePreview, '_blank');
                                }
                              }}
                              className="flex-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400"
                              data-testid="button-view-image"
                            >
                              <Eye className="h-4 w-4 ml-1" />
                              مشاهده
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(imagePreview);
                                toast({
                                  title: "کپی شد",
                                  description: "آدرس تصویر در کلیپ‌بورد کپی شد"
                                });
                              }}
                              className="flex-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400"
                            >
                              📋 کپی
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleImageRemove}
                              disabled={uploadingImage}
                              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800"
                              data-testid="button-remove-image"
                            >
                              <X className="h-4 w-4 ml-1" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Upload Zone - Compact Design */
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                        dragActive 
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="image-upload-zone"
                      dir="rtl"
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">در حال آپلود تصویر...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              تصویر محصول را آپلود کنید
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PNG، JPG، GIF • حداکثر ۵ مگابایت
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                            data-testid="button-select-image"
                          >
                            <Upload className="h-4 w-4 ml-1" />
                            انتخاب فایل
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  data-testid="file-input"
                />
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
                  description: form.watch("description"),
                  mainDescription: form.watch("mainDescription"),
                  featured: form.watch("featured"),
                  featuredTitle: form.watch("featuredTitle"),
                  image: form.watch("image"),
                  price: isEditMode 
                    ? (defaultPlan?.price?.toString() || "0") 
                    : (form.watch("price" as any) || "0")
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