import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/ProductForm";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

export default function AdminProductEdit() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const { t, isRTL } = useAdminLanguage();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const handleSuccess = () => {
    toast({
      title: t('message.success.updated', { item: 'Product' }),
      description: t('product.updated'),
    });
  };

  const handleCancel = () => {
    setLocation("/admin/products");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('product.loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6 p-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('product.back_to_list')}
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive">{t('product.error_loading')}</h2>
          <p className="text-muted-foreground mt-2">{t('product.not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('product.back_to_list')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('product.edit')}</h1>
          <p className="text-muted-foreground">{t('product.edit_info', { title: product.title })}</p>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <ProductForm product={product} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}