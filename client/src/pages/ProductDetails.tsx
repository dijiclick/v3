import { useRoute } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useProductByCategoryAndSlug, useCategories } from "@/lib/content-service";
import { cartManager } from "@/lib/cart";
import { 
  generateProductTitle, 
  generateMetaDescription, 
  getEnhancedProductStructuredData 
} from "@/lib/seo";
import { ExternalLink, Share, Heart, Star, CheckCircle, Home, ChevronRight, Loader2 } from "lucide-react";
import type { ProductPlan } from "@shared/schema";

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | null): string => {
  if (!price) return "0";
  const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

// Utility function to render rich text content
const renderRichText = (richText: any): string => {
  if (!richText) return '';
  
  // Handle different possible structures of rich text content
  if (typeof richText === 'string') {
    return richText;
  }
  
  // If it's a structured rich text object, convert to HTML
  if (richText && typeof richText === 'object') {
    // Handle Sanity Portable Text or similar structures
    if (Array.isArray(richText)) {
      return richText.map((block: any) => {
        if (block.style === 'h1') return `<h1>${block.children?.[0]?.text || ''}</h1>`;
        if (block.style === 'h2') return `<h2>${block.children?.[0]?.text || ''}</h2>`;
        if (block.style === 'h3') return `<h3>${block.children?.[0]?.text || ''}</h3>`;
        return `<p>${block.children?.[0]?.text || ''}</p>`;
      }).join('');
    }
    
    // Fallback for other object structures
    return JSON.stringify(richText);
  }
  
  return '';
};

export default function ProductDetails() {
  const [, params] = useRoute("/:categorySlug/:productSlug");
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | '3months' | '6months'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: product, isLoading, error } = useProductByCategoryAndSlug(params?.categorySlug || "", params?.productSlug || "");
  const { data: categories = [] } = useCategories();
  
  // Fetch product plans when product is available
  const { data: plans = [], isLoading: plansLoading, error: plansError } = useQuery<ProductPlan[]>({
    queryKey: ['/api/products', product?.id, 'plans'],
    enabled: !!product?.id,
  });
  
  // Find the selected plan or default plan
  const selectedPlan = useMemo(() => {
    if (!plans.length) return null;
    
    // If a plan is selected, find it
    if (selectedPlanId) {
      return plans.find((plan: ProductPlan) => plan.id === selectedPlanId) || null;
    }
    
    // Otherwise, find the default plan or first active plan
    const defaultPlan = plans.find((plan: ProductPlan) => plan.isDefault && plan.isActive);
    const firstActivePlan = plans.find((plan: ProductPlan) => plan.isActive);
    
    return defaultPlan || firstActivePlan || null;
  }, [plans, selectedPlanId]);
  
  // Set default selected plan when plans are loaded
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const defaultPlan = plans.find((plan: ProductPlan) => plan.isDefault && plan.isActive);
      const firstActivePlan = plans.find((plan: ProductPlan) => plan.isActive);
      const planToSelect = defaultPlan || firstActivePlan;
      if (planToSelect) {
        setSelectedPlanId(planToSelect.id);
      }
    }
  }, [plans, selectedPlanId]);
  
  // Handle plans error with toast notification
  useEffect(() => {
    if (plansError) {
      toast({
        title: "خطا در بارگذاری پلن‌ها",
        description: "امکان بارگذاری پلن‌های محصول وجود ندارد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  }, [plansError, toast]);
  
  // Calculate final pricing based on selected plan and duration
  const finalPricing = useMemo(() => {
    let basePrice: string;
    let originalPrice: string | null = null;
    
    if (selectedPlan) {
      basePrice = selectedPlan.price;
      originalPrice = selectedPlan.originalPrice;
    } else {
      // Fallback to product pricing
      basePrice = product?.price || "0";
      originalPrice = product?.originalPrice || null;
    }
    
    const basePriceNum = parseFloat(basePrice.replace(/[^\d.-]/g, ''));
    const originalPriceNum = originalPrice ? parseFloat(originalPrice.replace(/[^\d.-]/g, '')) : null;
    
    // Apply duration multipliers
    let finalPrice = basePriceNum;
    let finalOriginalPrice = originalPriceNum;
    
    if (selectedDuration === '3months') {
      finalPrice = basePriceNum * 3 * 0.95; // 5% discount for 3 months
      if (finalOriginalPrice) finalOriginalPrice = originalPriceNum! * 3;
    } else if (selectedDuration === '6months') {
      finalPrice = basePriceNum * 6 * 0.9; // 10% discount for 6 months  
      if (finalOriginalPrice) finalOriginalPrice = originalPriceNum! * 6;
    }
    
    return {
      price: finalPrice.toString(),
      originalPrice: finalOriginalPrice?.toString() || null,
      discountPercentage: originalPriceNum && finalOriginalPrice ? 
        Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100) : null
    };
  }, [selectedPlan, selectedDuration, product]);
  
  // Filter active plans for display
  const activePlans = plans.filter((plan: ProductPlan) => plan.isActive);

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.title || 'محصول',
      text: product?.description || 'محصول جالب',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "لینک کپی شد",
          description: "لینک محصول در کلیپ‌بورد کپی شد.",
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "لینک کپی شد",
        description: "لینک محصول در کلیپ‌بورد کپی شد.",
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.buyLink) {
      window.open(product.buyLink, '_blank', 'noopener,noreferrer');
    } else {
      // No fallback needed since cart functionality is removed
      toast({
        title: "توجه",
        description: "لینک خرید مستقیم موجود نیست. لطفاً با پشتیبانی تماس بگیرید.",
      });
    }
  };

  // Default FAQs for products
  const faqs = [
    {
      question: "نحوه اتصال به ابزارها به چه شکلی هست؟",
      answer: "از طریق اکستنشن کروم ما مستقیم به سایت‌ها وصل میشید"
    },
    {
      question: "من سیستمم مک هست آیا میتونم از ابزارها استفاده کنم؟", 
      answer: "بله اکستنشن ما هم روی مک، ویندوز و لینوکس کار میکنه"
    },
    {
      question: "امکان ثبت پروژه در اکانت‌ها وجود داره؟",
      answer: "ما تضمینی نمیدیم که بتونید حتما در همه ابزارها پروژه ایجاد کنید ولی محدودیتی هم اعمال نکردیم"
    },
    {
      question: "پشتیبانی چگونه ارائه می‌شود؟",
      answer: "تیم پشتیبانی ما ۲۴/۷ در دسترس است و از طریق تلگرام پاسخگو هستیم"
    }
  ];

  // Default recommendations
  const recommendations = [
    { icon: "🎨", name: "Midjourney", price: "۲۹۰ تومان", bg: "bg-purple-500" },
    { icon: "📺", name: "Netflix", price: "۱۲۹ تومان", bg: "bg-red-500" },
    { icon: "🎵", name: "Spotify", price: "۸۹ تومان", bg: "bg-green-500" },
    { icon: "💼", name: "Adobe", price: "۱۹۰ تومان", bg: "bg-blue-500" }
  ];

  if (isLoading || (product && plansLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 font-vazir flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">
            {isLoading ? 'در حال بارگذاری محصول...' : 'در حال بارگذاری پلن‌ها...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 font-vazir flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg text-gray-600">محصول مورد نظر یافت نشد</p>
        </div>
      </div>
    );
  }

  // Get product icon based on title
  const getProductIcon = () => {
    const title = product.title.toLowerCase();
    if (title.includes('chatgpt') || title.includes('جی‌پی‌تی')) return '🤖';
    if (title.includes('netflix') || title.includes('نتفلیکس')) return '🎬';
    if (title.includes('spotify') || title.includes('اسپاتیفای')) return '🎵';
    if (title.includes('youtube') || title.includes('یوتیوب')) return '📺';
    if (title.includes('adobe') || title.includes('ادوبی')) return '🎨';
    if (title.includes('midjourney')) return '🎨';
    return '📦';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-vazir" dir="rtl">
      <main className="max-w-7xl mx-auto px-5 py-10">
        
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
        
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 mb-16 bg-white p-10 rounded-3xl shadow-lg">
          <div className="text-right relative">
            {/* Small Share Icon in Top Right */}
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="absolute top-0 left-0 h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              data-testid="small-share-btn"
            >
              <Share className="h-4 w-4" />
            </Button>
            
            <h1 className="text-5xl font-bold text-gray-800 mb-4" data-testid="product-title">
              {product.title}
            </h1>
            
            
            
            {/* Product Image - Mobile */}
            <div className="w-40 h-40 mx-auto mb-8 lg:hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover rounded-3xl shadow-lg"
                  data-testid="product-image-mobile"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center text-6xl text-white">
                  {getProductIcon()}
                </div>
              )}
            </div>
            
            {/* Simple Description from Legacy Compatibility field */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 leading-relaxed" data-testid="product-simple-description">
                {product.description || `دسترسی به ${product.title} با کیفیت پریمیوم و قیمت مناسب. تجربه بهترین سرویس‌ها را با لیمیت پس آغاز کنید.`}
              </p>
            </div>
            
            {/* Features List - Use featuredFeatures if available, otherwise default */}
            <ul className="space-y-3 mb-8">
              {product.featured && product.featuredFeatures && product.featuredFeatures.length > 0 ? (
                // Display featured features
                product.featuredFeatures.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500 h-5 w-5" />
                    <span>{feature}</span>
                  </li>
                ))
              ) : (
                // Default features
                <>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500 h-5 w-5" />
                    <span>دسترسی کامل به {product.title}</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500 h-5 w-5" />
                    <span>کیفیت پریمیوم و سرعت بالا</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500 h-5 w-5" />
                    <span>پشتیبانی ۲۴/۷</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500 h-5 w-5" />
                    <span>تضمین کیفیت و امنیت</span>
                  </li>
                </>
              )}
              {product.inStock && (
                <li className="flex items-center gap-3 text-green-700 font-medium">
                  <CheckCircle className="text-green-600 h-5 w-5" />
                  <span>موجود و آماده تحویل فوری</span>
                </li>
              )}
              
              {/* Dynamic Plan Selection */}
              {product.inStock && activePlans.length > 0 && (
                <>
                  <li className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-gray-700 font-medium mb-3">انتخاب پلن:</div>
                    {plansLoading && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">در حال بارگذاری پلن‌ها...</span>
                      </div>
                    )}
                  </li>
                  {!plansLoading && (
                    <li className="mb-3">
                      <div className="flex flex-wrap gap-3">
                        {activePlans.map((plan: ProductPlan) => (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium flex-1 min-w-0 ${
                              selectedPlanId === plan.id
                                ? 'border-red-500 text-red-600 bg-red-50'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                            data-testid={`plan-option-${plan.id}`}
                          >
                            <div className="text-center">
                              <div>{plan.name}</div>
                              {plan.description && (
                                <div className="text-xs opacity-75 mt-1">({plan.description})</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </li>
                  )}
                  
                  {/* Duration Selection */}
                  {selectedPlan && (
                    <>
                      <li className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-gray-700 font-medium mb-3">مدت زمان:</div>
                      </li>
                      <li className="mb-3">
                        <div className="flex gap-3">
                          {[
                            { key: 'monthly', label: 'یک ماه', discount: null },
                            { key: '3months', label: 'سه ماه', discount: '5% تخفیف' },
                            { key: '6months', label: 'شش ماه', discount: '10% تخفیف' }
                          ].map((duration) => (
                            <button
                              key={duration.key}
                              onClick={() => setSelectedDuration(duration.key as any)}
                              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium flex-1 ${
                                selectedDuration === duration.key
                                  ? 'border-red-500 text-red-600 bg-red-50'
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                              data-testid={`duration-option-${duration.key}`}
                            >
                              <div className="text-center">
                                <div>{duration.label}</div>
                                {duration.discount && (
                                  <div className="text-xs text-green-600 mt-1">{duration.discount}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </li>
                    </>
                  )}
                </>
              )}
              
              {/* Fallback message when no plans available */}
              {product.inStock && activePlans.length === 0 && !plansLoading && (
                <li className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    در حال حاضر پلنی برای این محصول تعریف نشده است. از قیمت پایه محصول استفاده می‌شود.
                  </div>
                </li>
              )}
              {!product.inStock && (
                <li className="flex items-center gap-3 text-red-600 font-medium">
                  <div className="text-red-500 h-5 w-5">✗</div>
                  <span>موقتاً ناموجود</span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Purchase Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* Product Image - Desktop */}
            <div className="text-center mb-8 hidden lg:block">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-40 h-40 object-cover rounded-3xl shadow-lg mx-auto"
                  data-testid="product-image-desktop"
                />
              ) : (
                <div className="w-40 h-40 bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center text-6xl text-white mx-auto">
                  {getProductIcon()}
                </div>
              )}
            </div>
            
            
            {/* Enhanced Price Section with Dynamic Plan Pricing */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl mb-6 text-right border">
              {/* Plan Information */}
              {selectedPlan && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">پلن انتخابی:</span>
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{selectedPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">مدت زمان:</span>
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {selectedDuration === 'monthly' ? 'یک ماه' : selectedDuration === '3months' ? 'سه ماه' : 'شش ماه'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Loading State */}
              {plansLoading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  <span className="text-gray-600">در حال محاسبه قیمت...</span>
                </div>
              )}
              
              {!plansLoading && (
                <>
                  {/* Original Price (if available) */}
                  {finalPricing.originalPrice && parseFloat(finalPricing.originalPrice) > parseFloat(finalPricing.price) && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">قیمت اصلی:</span>
                        <span className="text-gray-500 dark:text-gray-400 line-through text-lg font-medium">
                          {formatPersianPrice(finalPricing.originalPrice)} تومان
                        </span>
                      </div>
                      {finalPricing.discountPercentage && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-green-600 dark:text-green-400 text-sm">تخفیف:</span>
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            %{finalPricing.discountPercentage}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Final Price */}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">قیمت نهایی:</span>
                      <div className="text-left">
                        <span className="text-3xl font-bold text-green-600 dark:text-green-500" data-testid="final-price">
                          {formatPersianPrice(finalPricing.price)}
                        </span>
                        <span className="text-lg text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                      </div>
                    </div>
                    
                    {/* Price per month calculation for multi-month plans */}
                    {selectedDuration !== 'monthly' && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">هزینه ماهانه:</span>
                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          {formatPersianPrice((parseFloat(finalPricing.price.replace(/[^\d.-]/g, '')) / (selectedDuration === '3months' ? 3 : 6)).toString())} تومان
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Enhanced Purchase Buttons */}
            <div className="space-y-3 mb-6">
              {/* Primary Buy Now Button */}
              <Button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  !product.inStock 
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:-translate-y-1 hover:shadow-lg'
                }`}
                data-testid="buy-now-btn"
              >
                {!product.inStock ? (
                  'ناموجود'
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5 mr-2" />
                    {product.buyLink ? 'خرید فوری' : 'خرید و دریافت فوری'}
                  </>
                )}
              </Button>
              
            </div>
            
            <div className="text-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">✓ تضمین کیفیت و بازگشت وجه</span>
            </div>
          </div>
        </div>


        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.5fr] gap-10 mb-16">
          {/* Main Content Area */}
          <div className="bg-white p-8 rounded-2xl shadow-lg" data-testid="main-content-display">
            {product?.mainDescription ? (
              <div 
                className="prose prose-lg max-w-none text-right [&>*]:text-right"
                dangerouslySetInnerHTML={{ __html: product.mainDescription }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">محتوایی موجود نیست</h3>
                <p className="text-sm">مطلب کاملی برای این محصول در پنل مدیریت تنظیم نشده است.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* How It Works */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">چگونه کار می‌کند؟</h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۱
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">انتخاب کنید</h4>
                    <p className="text-xs text-gray-600">محصول مورد نظر خود را انتخاب کنید</p>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۲
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">پرداخت کنید</h4>
                    <p className="text-xs text-gray-600">به صورت آنلاین و امن</p>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۳
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">دسترسی به اشتراک</h4>
                    <p className="text-xs text-gray-600">اطلاعات ورود را دریافت کنید</p>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۴
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">از سرویس لذت ببرید</h4>
                    <p className="text-xs text-gray-600">تا پایان مدت اشتراک</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">سوالات متداول</h3>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                        openFaq === index ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => toggleFaq(index)}
                      data-testid={`faq-question-${index + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          س
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800">{faq.question}</h4>
                      </div>
                      <div className={`w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold transition-transform ${
                        openFaq === index ? 'rotate-45' : ''
                      }`}>
                        +
                      </div>
                    </div>
                    {openFaq === index && (
                      <div className="p-4 bg-white border-t border-gray-200" data-testid={`faq-answer-${index + 1}`}>
                        <p className="text-sm text-gray-600 text-right">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">پیشنهاد ما</h3>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map((rec, index) => (
                  <a 
                    key={index}
                    href="#"
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-md transition-all text-decoration-none"
                    data-testid={`recommendation-${index + 1}`}
                  >
                    <div className={`w-9 h-9 ${rec.bg} rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0`}>
                      {rec.icon}
                    </div>
                    <div className="text-right min-w-0">
                      <h5 className="text-xs font-semibold text-gray-800 mb-1 truncate">{rec.name}</h5>
                      <p className="text-xs text-red-500 font-semibold">{rec.price}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Benefits Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
              مزایای انتخاب ما
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">امن و مطمئن</h3>
              <p className="text-xs text-gray-600 leading-relaxed">تمام اشتراک‌ها از طریق روش‌های امن تهیه می‌شوند</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">صرفه‌جویی</h3>
              <p className="text-xs text-gray-600 leading-relaxed">با لیمیت‌پس تا ۷۰٪ کمتر پرداخت کنید</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">فوری</h3>
              <p className="text-xs text-gray-600 leading-relaxed">در کمتر از ۱۰ دقیقه اشتراک خود را فعال کنید</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">با کیفیت</h3>
              <p className="text-xs text-gray-600 leading-relaxed">همه اشتراک‌ها کیفیت پریمیوم دارند</p>
            </div>
          </div>
        </div>

        {/* Footer CTA Section */}
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">آماده‌ای تجربه‌ای بهتر داشته باشی؟</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              با {product.title} کیفیت بالاتر، سرعت بیشتر و تجربه‌ای متفاوت رو حس کن.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-2xl text-center border-2 border-transparent hover:border-orange-200 transition-all">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">فعال‌سازی فوری</h3>
                <p className="text-gray-600">همین الان شروع کن</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-2xl text-center border-2 border-transparent hover:border-cyan-200 transition-all">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">تضمین بازگشت وجه</h3>
                <p className="text-gray-600">بدون ریسک</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl text-center border-2 border-transparent hover:border-emerald-200 transition-all">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">پشتیبانی ۲۴/۷</h3>
                <p className="text-gray-600">همیشه همراهت</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 justify-center items-center mb-6">
              <Button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
                  !product.inStock 
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white hover:scale-105'
                }`}
                data-testid="cta-main-button"
              >
                {product.inStock ? '🔥 همین حالا شروع کن' : 'ناموجود'}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 font-medium">
              فرصت رو از دست نده، همین امروز به جمع هزاران کاربر راضی بپیوند!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}