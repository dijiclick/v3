import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/ProductForm";

export default function AdminProductAdd() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation("/admin/products");
  };

  const handleCancel = () => {
    setLocation("/admin/products");
  };

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
          <h1 className="text-3xl font-bold tracking-tight">افزودن محصول جدید</h1>
          <p className="text-muted-foreground">محصول جدید خود را به فروشگاه اضافه کنید</p>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}