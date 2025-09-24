import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/lib/content-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plan, insertPlanSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const planFormSchema = insertPlanSchema.extend({
  productId: z.string().min(1, "Product is required"),
});

type PlanFormData = z.infer<typeof planFormSchema>;

export default function AdminPlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all plans
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  const addForm = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      productLink: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const editForm = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema.partial()),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      productLink: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const filteredPlans = plans.filter((plan: Plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === "all" || plan.productId === selectedProduct;
    
    return matchesSearch && matchesProduct;
  });

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.title : "Unknown Product";
  };

  const addMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const { productId, ...planData } = data;
      return apiRequest('POST', `/api/products/${productId}/plans`, planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "موفق",
        description: "پلن با موفقیت اضافه شد!",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: "خطا در افزودن پلن",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlanFormData> }) => {
      return apiRequest('PUT', `/api/plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "موفق",
        description: "پلن با موفقیت به‌روزرسانی شد!",
      });
      setEditingPlan(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی پلن",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('DELETE', `/api/plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "موفق",
        description: "پلن با موفقیت حذف شد!",
      });
      setDeletingPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطا", 
        description: "خطا در حذف پلن",
        variant: "destructive",
      });
    },
  });

  const handleAddPlan = (data: PlanFormData) => {
    addMutation.mutate(data);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    editForm.reset({
      title: plan.title,
      description: plan.description,
      price: plan.price.toString(),
      productLink: plan.productLink,
      sortOrder: plan.sortOrder || 0,
      isActive: plan.isActive,
      productId: plan.productId,
    });
  };

  const handleUpdatePlan = (data: Partial<PlanFormData>) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    }
  };

  const handleDeletePlan = (plan: Plan) => {
    setDeletingPlan(plan);
  };

  const confirmDelete = () => {
    if (deletingPlan) {
      deleteMutation.mutate(deletingPlan.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت پلن‌ها</h1>
          <p className="text-gray-600 dark:text-gray-400">مدیریت پلن‌های قیمت‌گذاری محصولات</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-plan-button">
              <Plus className="h-4 w-4 ml-2" />
              افزودن پلن
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>افزودن پلن جدید</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddPlan)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>محصول</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product">
                            <SelectValue placeholder="انتخاب محصول" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان پلن</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثل: پلن فردی" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیح</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="توضیح کوتاه پلن" data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قیمت (تومان)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="productLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لینک محصول</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/buy" data-testid="input-link" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ترتیب نمایش</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0" 
                          data-testid="input-order"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    انصراف
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending} data-testid="button-submit">
                    {addMutation.isPending ? "در حال افزودن..." : "افزودن پلن"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="جستجو در پلن‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
            data-testid="search-plans"
          />
        </div>
        
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-full sm:w-[250px]" data-testid="filter-product">
            <SelectValue placeholder="فیلتر بر اساس محصول" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه محصولات</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan: Plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow" data-testid={`plan-card-${plan.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getProductName(plan.productId)}
                  </p>
                </div>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-green-600">
                    {parseInt(plan.price.toString()).toLocaleString('fa-IR')} تومان
                  </div>
                  <div className="text-sm text-gray-500">
                    ترتیب: {plan.sortOrder || 0}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPlan(plan)}
                    data-testid={`edit-plan-${plan.id}`}
                  >
                    <Edit className="h-3 w-3 ml-1" />
                    ویرایش
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePlan(plan)}
                    data-testid={`delete-plan-${plan.id}`}
                  >
                    <Trash2 className="h-3 w-3 ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">پلنی یافت نشد</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedProduct !== "all" 
              ? "تغییر فیلترها یا افزودن پلن جدید" 
              : "با افزودن پلن اول شروع کنید"}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش پلن</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdatePlan)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان پلن</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="edit-input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>توضیح</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="edit-input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قیمت (تومان)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" data-testid="edit-input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="productLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لینک محصول</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="edit-input-link" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ترتیب نمایش</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          data-testid="edit-input-order"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                    انصراف
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending} data-testid="button-update">
                    {updateMutation.isPending ? "در حال به‌روزرسانی..." : "به‌روزرسانی"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={(open) => !open && setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف پلن</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف پلن "{deletingPlan?.title}" اطمینان دارید؟
              این عمل قابل برگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-plan"
            >
              {deleteMutation.isPending ? "در حال حذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}