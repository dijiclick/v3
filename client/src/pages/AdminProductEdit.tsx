import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/ProductForm";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

export default function AdminProductEdit() {
  const [, setLocation] = useLocation();
  const { id } = useParams();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const handleSuccess = () => {
    setLocation("/admin/products");
  };

  const handleCancel = () => {
    setLocation("/admin/products");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>در حال بارگذاری محصول...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6 p-6 max-w-6xl mx-auto" dir="rtl">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            بازگشت به فهرست محصولات
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive">خطا در بارگذاری محصول</h2>
          <p className="text-muted-foreground mt-2">محصول مورد نظر یافت نشد یا خطایی رخ داده است.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت به فهرست محصولات
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ویرایش محصول</h1>
          <p className="text-muted-foreground">ویرایش اطلاعات محصول: {product.title}</p>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <ProductForm product={product} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}