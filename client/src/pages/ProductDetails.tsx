import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useProductByCategoryAndSlug, useCategories } from "@/lib/content-service";
import { cartManager } from "@/lib/cart";
import { 
  generateProductTitle, 
  generateMetaDescription, 
  getEnhancedProductStructuredData 
} from "@/lib/seo";
import { 
  MoreHorizontal, 
  Share, 
  Check, 
  Info, 
  Star, 
  Crown, 
  Users, 
  Shield, 
  Zap, 
  Clock, 
  Home, 
  ChevronRight,
  ExternalLink,
  ShoppingCart
} from "lucide-react";

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | number | null): string => {
  if (!price) return "0";
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

// Utility function to get product icon based on title
const getProductIcon = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('chatgpt') || titleLower.includes('جی‌پی‌تی')) return '🤖';
  if (titleLower.includes('netflix') || titleLower.includes('نتفلیکس')) return '🎬';
  if (titleLower.includes('spotify') || titleLower.includes('اسپاتیفای')) return '🎵';
  if (titleLower.includes('youtube') || titleLower.includes('یوتیوب')) return '📺';
  if (titleLower.includes('adobe') || titleLower.includes('ادوبی')) return '🎨';
  if (titleLower.includes('midjourney')) return '🎨';
  return '📦';
};

// Utility function to get gradient based on product
const getProductGradient = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('chatgpt')) return 'from-teal-500 to-teal-600';
  if (titleLower.includes('netflix')) return 'from-red-500 to-red-600';
  if (titleLower.includes('spotify')) return 'from-green-500 to-green-600';
  if (titleLower.includes('youtube')) return 'from-red-500 to-orange-500';
  if (titleLower.includes('adobe')) return 'from-blue-500 to-purple-600';
  return 'from-gray-500 to-gray-600';
};

export default function ProductDetails() {
  const [, params] = useRoute("/:categorySlug/:productSlug");
  const { toast } = useToast();
  
  // State for pricing options
  const [selectedMonths, setSelectedMonths] = useState("6");
  const [selectedType, setSelectedType] = useState("shared");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [isRTL, setIsRTL] = useState(true);

  const { data: product, isLoading, error } = useProductByCategoryAndSlug(params?.categorySlug || "", params?.productSlug || "");
  const { data: categories = [] } = useCategories();

  // Get current category
  const currentCategory = categories.find(cat => cat.slug === params?.categorySlug);

  // Enhanced SEO for product pages
  useSEO(
    product ? {
      title: generateProductTitle(product),
      description: generateMetaDescription(product),
      keywords: `${product.title}, خرید اشتراک, لیمیت پس, ${product.tags?.join(', ') || ''}`,
      ogTitle: generateProductTitle(product),
      ogDescription: generateMetaDescription(product),
      ogImage: product.image,
      ogUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      ogType: 'product',
      canonical: typeof window !== 'undefined' ? window.location.href : undefined,
      robots: 'index, follow',
      structuredData: getEnhancedProductStructuredData(
        product, 
        currentCategory,
        // Breadcrumb navigation
        [
          { name: 'خانه', url: '/' },
          { name: currentCategory?.name || 'محصولات', url: `/${currentCategory?.slug || 'products'}` },
          { name: product.title, url: `/${currentCategory?.slug}/${product.slug}` }
        ]
      )
    } : {
      title: "محصول - لیمیت پس",
      description: "در حال بارگذاری جزئیات محصول...",
    }
  );

  // Default pricing options with fallback to product data
  const monthOptions = product?.durationOptions || [
    { months: 1, label: "1 ماه", discountPercentage: 0 },
    { months: 3, label: "3 ماه", discountPercentage: 10 },
    { months: 6, label: "6 ماه", discountPercentage: 20 }
  ];

  // Default plan types with fallback to product data
  const typeOptions = product?.planTypes || [
    { 
      id: "shared", 
      label: "اشتراک مشترک (6 نفره)", 
      basePrice: parseFloat(product?.price || "68.77"),
      popular: true,
      features: ["فضای کاری مشترک", "6 کاربر", "پشتیبانی عادی"]
    },
    { 
      id: "private", 
      label: "اشتراک شخصی (خصوصی)", 
      basePrice: parseFloat(product?.originalPrice || product?.price || "149.99"),
      popular: false,
      features: ["فضای کاری خصوصی", "استفاده نامحدود", "پشتیبانی پریمیوم", "امکانات پیشرفته"]
    }
  ];

  // Calculate current pricing
  const selectedPlanType = typeOptions.find((opt: any) => opt.id === selectedType) || typeOptions[0];
  const selectedDuration = monthOptions.find((opt: any) => opt.months.toString() === selectedMonths) || monthOptions[0];
  const discountAmount = selectedPlanType.basePrice * (selectedDuration.discountPercentage || 0) / 100;
  const finalPrice = selectedPlanType.basePrice - discountAmount;
  const monthlyPrice = finalPrice / selectedDuration.months;

  // Default features
  const features = [
    { icon: <Crown className="w-4 h-4" />, text: `دسترسی کامل به ${product?.title || 'سرویس'}` },
    { icon: <Zap className="w-4 h-4" />, text: "سرعت پردازش بالا" },
    { icon: <Shield className="w-4 h-4" />, text: "دسترسی اولویت‌دار" },
    { icon: <Users className="w-4 h-4" />, text: "پشتیبانی چندپلتفرمه" },
    { icon: <Clock className="w-4 h-4" />, text: "دسترسی ۲۴/۷" }
  ];

  const handleAddToCart = () => {
    if (!product) return;
    
    cartManager.addItem({
      id: product.id,
      title: product.title,
      price: finalPrice,
      image: product.image || undefined,
    });

    toast({
      title: "افزوده شد",
      description: `${product.title} به سبد خرید افزوده شد.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.buyLink) {
      window.open(product.buyLink, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to cart if no buy link
      handleAddToCart();
      toast({
        title: "توجه",
        description: "لینک خرید مستقیم موجود نیست. محصول به سبد خرید اضافه شد.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-vazir flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center" data-testid="loading-state">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-vazir flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center" data-testid="error-state">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg text-gray-600">محصول مورد نظر یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-vazir">
      {/* RTL Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRTL(!isRTL)}
          className="bg-white shadow-lg"
          data-testid="rtl-toggle"
        >
          {isRTL ? "LTR" : "RTL"}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Breadcrumb Navigation */}
        {product && currentCategory && (
          <nav className="flex items-center gap-2 text-sm mb-6" data-testid="breadcrumb-navigation">
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              data-testid="breadcrumb-home"
            >
              <Home className="h-4 w-4" />
              <span>خانه</span>
            </a>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <a 
              href={`/${currentCategory.slug}`} 
              className="text-gray-600 hover:text-gray-800"
              data-testid="breadcrumb-category"
            >
              {currentCategory.name}
            </a>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span 
              className="text-gray-800 font-medium"
              data-testid="breadcrumb-product"
            >
              {product.title}
            </span>
          </nav>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Product Card */}
          <div className="lg:col-span-3 order-1">
            <Card className="overflow-hidden border-0 shadow-xl" data-testid="product-card">
              <div className={`bg-gradient-to-br ${getProductGradient(product.title)} text-white p-8 relative`}>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0" data-testid="premium-badge">
                    {product.featured ? 'ویژه' : 'پریمیوم'}
                  </Badge>
                </div>
                <div className="text-center mt-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                    {getProductIcon(product.title)}
                  </div>
                  <h2 className="text-2xl font-semibold mb-2" data-testid="product-card-title">{product.title}</h2>
                  <p className="text-lg opacity-90">{product.shortDescription || 'سرویس پریمیوم'}</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current text-yellow-300" />
                    ))}
                    <span className="text-sm ml-2 opacity-80" data-testid="product-rating">
                      {product.rating || '4.9'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 order-2">
            <Card className="shadow-xl border-0" data-testid="main-content">
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900" data-testid="product-title">{product.title}</h1>
                    <p className="text-gray-600 mt-1" data-testid="product-subtitle">
                      {product.shortDescription || `دستیار هوشمند پیشرفته با امکانات پریمیوم`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors px-3 py-2 rounded-lg"
                      data-testid="more-options-btn"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="hidden sm:inline">گزینه‌های بیشتر</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        2
                      </Badge>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors px-3 py-2 rounded-lg"
                      data-testid="share-btn"
                    >
                      <Share className="w-4 h-4" />
                      <span className="hidden sm:inline">اشتراک‌گذاری</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        7
                      </Badge>
                    </Button>
                  </div>
                </div>

                {/* Purchase Duration */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    مدت زمان خرید
                  </h3>
                  <RadioGroup 
                    value={selectedMonths} 
                    onValueChange={setSelectedMonths}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    data-testid="duration-selection"
                  >
                    {monthOptions.map((option: any) => (
                      <div key={option.months} className="relative">
                        <RadioGroupItem value={option.months.toString()} id={option.months.toString()} className="sr-only" />
                        <Label 
                          htmlFor={option.months.toString()}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                            selectedMonths === option.months.toString() 
                              ? 'border-teal-500 bg-teal-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`duration-option-${option.months}`}
                        >
                          {option.discountPercentage && option.discountPercentage > 0 && (
                            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                              {option.discountPercentage}% تخفیف
                            </Badge>
                          )}
                          <div className="text-center">
                            <div className={`font-semibold ${selectedMonths === option.months.toString() ? 'text-teal-700' : 'text-gray-900'}`}>
                              {option.label}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Select Type */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    نوع اشتراک
                  </h3>
                  <RadioGroup 
                    value={selectedType} 
                    onValueChange={setSelectedType}
                    className="space-y-4"
                    data-testid="plan-type-selection"
                  >
                    {typeOptions.map((option: any) => (
                      <div key={option.id} className="relative">
                        <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                        <Label 
                          htmlFor={option.id}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                            selectedType === option.id 
                              ? 'border-teal-500 bg-teal-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`plan-type-${option.id}`}
                        >
                          {option.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white">
                              محبوب‌ترین
                            </Badge>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-4 h-4 rounded-full mt-1 border-2 ${
                                selectedType === option.id 
                                  ? 'bg-teal-500 border-teal-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedType === option.id && (
                                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                                )}
                              </div>
                              <div>
                                <div className={`font-semibold ${selectedType === option.id ? 'text-teal-700' : 'text-gray-900'}`}>
                                  {option.label}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {option.features?.join(" • ") || "ویژگی‌های پایه"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${selectedType === option.id ? 'text-teal-700' : 'text-gray-900'}`}>
                                {formatPersianPrice(option.basePrice)} تومان
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatPersianPrice(option.basePrice / selectedDuration.months)} تومان/ماه
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Auto Renewal Toggle */}
                <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-renewal" className="text-sm font-medium">تمدید خودکار</Label>
                      <p className="text-xs text-gray-500 mt-1">اشتراک شما به صورت خودکار تمدید شود</p>
                    </div>
                    <Switch
                      id="auto-renewal"
                      checked={autoRenewal}
                      onCheckedChange={setAutoRenewal}
                      data-testid="auto-renewal-toggle"
                    />
                  </div>
                </div>

                {/* Features List */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">ویژگی‌های {product.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="features-list">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-700">
                        <div className="text-teal-600">{feature.icon}</div>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-3">درباره {product.title}</h3>
                  <div className="text-gray-600 leading-relaxed" data-testid="product-description">
                    {product.description || product.mainDescription || `${product.title} یک سرویس پریمیوم است که دسترسی کامل به امکانات پیشرفته را فراهم می‌کند. با کیفیت بالا و سرعت مناسب، بهترین تجربه را برای کاربران فراهم می‌آورد.`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-3 order-3">
            <div className="sticky top-8">
              <Card className="shadow-xl border-0" data-testid="order-summary">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Pricing */}
                    <div>
                      <h3 className="font-semibold mb-4">خلاصه سفارش</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">قیمت پایه:</span>
                          <span className="font-semibold" data-testid="base-price">
                            {formatPersianPrice(selectedPlanType.basePrice)} تومان
                          </span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">تخفیف:</span>
                            <span className="font-semibold text-green-600" data-testid="discount-amount">
                              -{formatPersianPrice(discountAmount)} تومان
                            </span>
                          </div>
                        )}
                        
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">مجموع:</span>
                          <div className="text-right">
                            <div className="text-teal-600 font-semibold text-xl" data-testid="total-price">
                              {formatPersianPrice(finalPrice)} تومان
                            </div>
                            <div className="text-teal-600 text-sm" data-testid="monthly-price">
                              {formatPersianPrice(monthlyPrice)} تومان/ماه
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order summary details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">نوع اشتراک:</span>
                          <span className="font-medium">{selectedPlanType.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">مدت زمان:</span>
                          <span className="font-medium">{selectedDuration.label}</span>
                        </div>
                        {autoRenewal && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">تمدید خودکار:</span>
                            <span className="font-medium text-green-600">فعال</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    {product.inStock ? (
                      <div className="text-center text-green-600 text-sm font-medium" data-testid="stock-status">
                        ✓ موجود و آماده تحویل فوری
                      </div>
                    ) : (
                      <div className="text-center text-red-600 text-sm font-medium" data-testid="out-of-stock">
                        ✗ موقتاً ناموجود
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <Button 
                        onClick={handleBuyNow}
                        disabled={!product.inStock}
                        className={`w-full py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 ${
                          !product.inStock 
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white hover:shadow-xl'
                        }`}
                        data-testid="buy-now-main-btn"
                      >
                        {!product.inStock ? (
                          'ناموجود'
                        ) : (
                          <>
                            <Crown className="w-5 h-5 mr-2" />
                            {product.buyLink ? 'خرید فوری' : 'خرید و دریافت فوری'}
                          </>
                        )}
                      </Button>

                      {product.inStock && (
                        <Button 
                          onClick={handleAddToCart}
                          variant="outline"
                          className="w-full py-3 rounded-xl font-medium text-base transition-all hover:shadow-md border-gray-300"
                          data-testid="add-to-cart-main-btn"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          افزودن به سبد خرید
                        </Button>
                      )}
                    </div>

                    {/* Guarantee */}
                    <div className="text-center text-gray-500 text-xs">
                      ✓ تضمین کیفیت و بازگشت وجه
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}