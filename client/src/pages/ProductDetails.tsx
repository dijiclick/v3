import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useProductByCategoryAndSlug, useCategories } from "@/lib/content-service";
import { cartManager } from "@/lib/cart";
import { 
  generateProductTitle, 
  generateMetaDescription, 
  getEnhancedProductStructuredData 
} from "@/lib/seo";
import { ExternalLink, ShoppingCart, Heart, Star, CheckCircle, Home, ChevronRight, RotateCcw, Shield } from "lucide-react";
import PricingPlanSelector from "@/components/PricingPlanSelector";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import PricingSidebar from "@/components/PricingSidebar";
import FeaturesList from "@/components/FeaturesList";

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
  const [selectedPlan, setSelectedPlan] = useState('6-months');
  const [selectedType, setSelectedType] = useState('shared-6');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { data: product, isLoading: productLoading, error } = useProductByCategoryAndSlug(params?.categorySlug || "", params?.productSlug || "");
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

  // Get pricing plans from product data or use defaults
  const getPricingPlans = () => {
    if (product?.pricingPlans && Array.isArray(product.pricingPlans)) {
      return product.pricingPlans;
    }
    return [
      {
        duration: "3-months",
        price: product?.price || "149",
        originalPrice: product?.originalPrice || "199",
        discount: "25%",
        priceNumber: parseFloat(product?.price || "149"),
        features: ["دسترسی کامل", "فعالسازی فوری"]
      },
      {
        duration: "6-months",
        price: product?.price ? (parseFloat(product.price) * 1.5).toString() : "249",
        originalPrice: product?.originalPrice ? (parseFloat(product.originalPrice) * 1.5).toString() : "299",
        discount: "17%",
        popular: true,
        features: ["دسترسی کامل", "فعالسازی فوری", "پشتیبانی اولویت‌دار"]
      },
      {
        duration: "12-months",
        price: product?.price ? (parseFloat(product.price) * 2.5).toString() : "399",
        originalPrice: product?.originalPrice ? (parseFloat(product.originalPrice) * 2.5).toString() : "499",
        discount: "20%",
        features: ["دسترسی کامل", "فعالسازی فوری", "پشتیبانی اولویت‌دار", "تضمین بازگشت وجه"]
      }
    ];
  };

  // Get product types from product data or use defaults
  const getProductTypes = () => {
    if (product?.sidebarContent?.productTypes && Array.isArray(product.sidebarContent.productTypes)) {
      return product.sidebarContent.productTypes;
    }
    return [
      {
        id: "shared-6",
        name: "اشتراک مشترک",
        description: "۱ اسلات مشترک با ۶ نفر",
        price: product?.price || "149",
        maxUsers: 6,
        features: ["دسترسی همزمان محدود", "قابلیت‌های پایه"]
      },
      {
        id: "shared-3",
        name: "اشتراک نیمه‌خصوصی",
        description: "۱ اسلات مشترک با ۳ نفر",
        price: product?.price ? (parseFloat(product.price) * 1.5).toString() : "249",
        maxUsers: 3,
        popular: true,
        features: ["دسترسی بهتر", "سرعت بالاتر", "پشتیبانی اولویت‌دار"]
      },
      {
        id: "private",
        name: "اشتراک خصوصی",
        description: "اختصاصی فقط برای شما",
        price: product?.price ? (parseFloat(product.price) * 3).toString() : "499",
        maxUsers: 1,
        recommended: true,
        features: ["دسترسی کامل", "حداکثر سرعت", "پشتیبانی ۲۴/۷"]
      }
    ];
  };

  const pricingPlans = getPricingPlans();
  const productTypes = getProductTypes();
  const selectedPlanData = pricingPlans.find(plan => plan.duration === selectedPlan) || pricingPlans[0];
  const selectedTypeData = productTypes.find(type => type.id === selectedType) || productTypes[0];

  const handleAddToCart = () => {
    if (!product) return;
    
    cartManager.addItem({
      id: product.id,
      title: `${product.title} - ${selectedTypeData.name} (${selectedPlanData.duration})`,
      price: parseFloat(selectedPlanData.price),
      image: product.image || undefined,
    });

    toast({
      title: "افزوده شد",
      description: `${product.title} به سبد خرید افزوده شد.`,
    });
  };

  const handlePurchase = async () => {
    if (!product) return;
    
    setIsLoading(true);
    
    try {
      if (product.buyLink) {
        window.open(product.buyLink, '_blank', 'noopener,noreferrer');
      } else {
        // Simulate purchase process
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleAddToCart();
        toast({
          title: "موفقیت",
          description: "سفارش شما ثبت شد و به زودی پردازش خواهد شد.",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطایی در پردازش سفارش رخ داد. لطفاً دوباره تلاش کنید.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-vazir flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">در حال بارگذاری...</p>
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
      <main className="max-w-7xl mx-auto px-5 py-8">
        
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
        
        {/* Modern Subscription Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Side - Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <Card className="p-8">
              <div className="flex items-start gap-6">
                {/* Product Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg flex-shrink-0">
                  {getProductIcon()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="product-title">
                      {product.title}
                    </h1>
                    {product.featured && (
                      <Badge className="bg-red-500 text-white px-3 py-1">
                        ویژه
                      </Badge>
                    )}
                  </div>
                  
                  {product.shortDescription && (
                    <div 
                      className="text-lg text-gray-600 leading-relaxed mb-4" 
                      data-testid="product-short-description"
                      dangerouslySetInnerHTML={{ __html: renderRichText(product.shortDescription) }}
                    />
                  )}
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating || "4.8"}</span>
                    </div>
                    <span>({formatPersianPrice(product.reviewCount?.toString() || "1250")} نظر)</span>
                    <Badge variant="secondary" className="text-xs">
                      {product.inStock ? "موجود" : "ناموجود"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing Plans */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">انتخاب مدت زمان اشتراک</h2>
              <PricingPlanSelector
                plans={pricingPlans}
                selectedPlan={selectedPlan}
                onPlanSelect={setSelectedPlan}
              />
            </Card>

            {/* Product Types */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">نوع اشتراک</h2>
              <ProductTypeSelector
                types={productTypes}
                selectedType={selectedType}
                onTypeSelect={setSelectedType}
              />
            </Card>

            {/* Features */}
            {product.featuredFeatures && product.featuredFeatures.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">ویژگی‌های محصول</h2>
                <FeaturesList 
                  features={product.featuredFeatures}
                  layout="list"
                  checkmarkColor="red"
                />
              </Card>
            )}

            {/* Auto-renewal Toggle */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCcw className="h-5 w-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">تمدید خودکار</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    اشتراک شما به صورت خودکار تمدید خواهد شد
                  </p>
                </div>
                <Switch
                  checked={autoRenewal}
                  onCheckedChange={setAutoRenewal}
                  data-testid="switch-auto-renewal"
                />
              </div>
              
              {autoRenewal && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">حفاظت از اشتراک</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    می‌توانید هر زمان که بخواهید تمدید خودکار را لغو کنید
                  </p>
                </div>
              )}
            </Card>

            {/* Description */}
            {(product.mainDescription || product.description) && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">درباره محصول</h2>
                <div 
                  className="prose prose-lg max-w-none text-right leading-relaxed text-gray-600"
                  data-testid="product-description"
                  dangerouslySetInnerHTML={{ 
                    __html: renderRichText(product.mainDescription || product.description) 
                  }}
                />
              </Card>
            )}
          </div>

          {/* Right Side - Pricing Sidebar */}
          <div className="lg:sticky lg:top-6">
            <PricingSidebar
              selectedPlan={selectedPlanData}
              selectedType={selectedTypeData}
              autoRenewal={autoRenewal}
              onPurchase={handlePurchase}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Additional Statistics Section */}
        {product.statisticsSection && (
          <Card className="mt-8 p-8 bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {product.statisticsSection.title || "آمار و ارقام"}
              </h2>
              {product.statisticsSection.subtitle && (
                <p className="text-lg text-red-100">
                  {product.statisticsSection.subtitle}
                </p>
              )}
            </div>
            
            {product.statisticsSection.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {product.statisticsSection.statistics.map((stat: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-2">{stat.icon || "📊"}</div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-red-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}