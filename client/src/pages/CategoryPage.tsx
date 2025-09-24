import { useParams, Link } from "wouter";
import { ArrowRight, Home } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useCategoryBySlug, useProductsByCategory } from "@/lib/content-service";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  // Fetch category data
  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategoryBySlug(categorySlug || "");
  
  // Fetch products for this category
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProductsByCategory(category?.id || "");

  // SEO setup
  useSEO({
    title: category ? `دسته‌بندی: ${category.name} | لیمیت پس` : "دسته‌بندی | لیمیت پس",
    description: category?.description || `محصولات دسته‌بندی ${category?.name || 'انتخابی'} در لیمیت پس - خرید اشتراک پریمیوم با قیمت ارزان`,
    keywords: `${category?.name || ''}, اشتراک مشترک, قیمت ارزان, لیمیت پس, ${category?.name} ایرانی`,
    ogTitle: category ? `دسته‌بندی: ${category.name} | لیمیت پس` : "دسته‌بندی | لیمیت پس",
    ogDescription: category?.description || `محصولات دسته‌بندی ${category?.name || 'انتخابی'} در لیمیت پس`,
    ogUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    ogType: 'website',
    ogLocale: 'fa_IR',
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
    robots: 'index, follow',
    hreflang: 'fa'
  });

  // Loading state
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <Skeleton className="h-5 w-48" />
          </div>
          
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-card rounded-xl border p-5">
                <Skeleton className="aspect-[4/3] w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - category not found
  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-4">
            دسته‌بندی یافت نشد
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground mb-8">
            متأسفانه دسته‌بندی مورد نظر شما یافت نشد. لطفا از صفحه اصلی دوباره تلاش کنید.
          </p>
          <Link href="/">
            <Button className="gap-2" data-testid="back-to-home-button">
              <Home className="h-4 w-4" />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6" data-testid="breadcrumb-navigation">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="breadcrumb-home">
                    <Home className="h-3 w-3" />
                    خانه
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium" data-testid="breadcrumb-category">
                  {category.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Category Header */}
        <div className="mb-8" data-testid="category-header">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground" data-testid="category-title">
              {category.name}
            </h1>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2" data-testid="back-button">
                <ArrowRight className="h-4 w-4" />
                بازگشت
              </Button>
            </Link>
          </div>
          
          {category.description && (
            <p className="text-gray-600 dark:text-muted-foreground text-lg leading-relaxed" data-testid="category-description">
              {category.description}
            </p>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-muted-foreground" data-testid="product-count">
              {productsLoading 
                ? "در حال بارگذاری..." 
                : `${products.length} محصول در این دسته‌بندی`
              }
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div data-testid="products-section">
          {productsLoading ? (
            // Loading skeleton for products
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-card rounded-xl border p-5">
                  <Skeleton className="aspect-[4/3] w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            // Products grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-16" data-testid="empty-state">
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-4">
                هیچ محصولی در این دسته‌بندی موجود نیست
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-8 max-w-md mx-auto">
                هنوز محصولی در دسته‌بندی {category.name} اضافه نشده است. لطفا بعداً دوباره تلاش کنید یا دسته‌بندی‌های دیگر را بررسی کنید.
              </p>
              <Link href="/">
                <Button className="gap-2" data-testid="browse-other-categories-button">
                  <Home className="h-4 w-4" />
                  مشاهده سایر دسته‌بندی‌ها
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Error state for products */}
        {productsError && (
          <div className="text-center py-16" data-testid="products-error-state">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-4">
              خطا در بارگذاری محصولات
            </h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-8">
              متأسفانه خطایی در بارگذاری محصولات رخ داده است. لطفا صفحه را مجدداً بارگذاری کنید.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="gap-2"
              data-testid="reload-page-button"
            >
              تلاش دوباره
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}