import { useRoute } from "wouter";
import { useState } from "react";
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
import { ExternalLink, Share, Heart, Star, CheckCircle, Home, ChevronRight } from "lucide-react";

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
  const [selectedPlan, setSelectedPlan] = useState('individual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  if (isLoading) {
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
            
            {/* Main Description - fallback to description if mainDescription not available */}
            <div className="mb-8">
              {product.mainDescription ? (
                <div 
                  className="prose prose-lg max-w-none text-right leading-relaxed text-gray-600"
                  dangerouslySetInnerHTML={{ __html: renderRichText(product.mainDescription) }}
                  data-testid="product-main-description"
                />
              ) : (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description || `دسترسی به ${product.title} با کیفیت پریمیوم و قیمت مناسب. تجربه بهترین سرویس‌ها را با لیمیت پس آغاز کنید.`}
                </p>
              )}
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
              
              {/* Plan Selection in Features List */}
              {product.inStock && (
                <>
                  <li className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-gray-700 font-medium mb-3">نوع پلن:</div>
                  </li>
                  <li className="mb-3">
                    <button
                      onClick={() => setSelectedPlan('individual')}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-1/2 ${
                        selectedPlan === 'individual'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPlan === 'individual' ? 'border-red-500 bg-red-500' : 'border-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-medium">پلن فردی</div>
                        <div className="text-sm opacity-75">برای استفاده شخصی</div>
                      </div>
                    </button>
                  </li>
                  <li className="mb-3">
                    <button
                      onClick={() => setSelectedPlan('shared')}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-1/2 ${
                        selectedPlan === 'shared'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPlan === 'shared' ? 'border-red-500 bg-red-500' : 'border-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-medium">پلن مشترک</div>
                        <div className="text-sm opacity-75">برای چند کاربر</div>
                      </div>
                    </button>
                  </li>
                </>
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
            
            
            {/* Enhanced Price Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl mb-6 text-right border">
              {/* Original Price (if available) */}
              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">قیمت اصلی:</span>
                    <span className="text-gray-500 dark:text-gray-400 line-through text-lg font-medium">
                      {formatPersianPrice(product.originalPrice)} تومان
                    </span>
                  </div>
                </div>
              )}
              
              
              {/* Final Price */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">قیمت نهایی:</span>
                  <div className="text-left">
                    <span className="text-3xl font-bold text-green-600 dark:text-green-500">
                      {formatPersianPrice(product.price)}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                  </div>
                </div>
              </div>
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
          <div className="bg-white p-8 rounded-2xl shadow-lg" data-testid="blog-content-display">
            {product?.blogContent ? (
              <div 
                className="prose prose-lg max-w-none text-right"
                dangerouslySetInnerHTML={{ __html: product.blogContent }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Default content when no blog content exists */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">کیفیت پریمیوم</div>
                        <div className="text-xs text-gray-500">بهترین کیفیت موجود</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">دسترسی کامل به تمام امکانات</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">⚡</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">سرعت بالا</div>
                        <div className="text-xs text-gray-500">بدون محدودیت سرعت</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">تجربه روان و بدون وقفه</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-2xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">🔒</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">امنیت بالا</div>
                        <div className="text-xs text-gray-500">محافظت کامل اطلاعات</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">حریم خصوصی شما محفوظ است</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-2xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">💬</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">پشتیبانی</div>
                        <div className="text-xs text-gray-500">۲۴ ساعته و ۷ روز هفته</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">همیشه در کنار شما هستیم</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🎯</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">تضمین کیفیت</div>
                        <div className="text-xs text-gray-500">رضایت ۱۰۰٪ تضمینی</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">در صورت عدم رضایت، پول برگردانده می‌شود</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-2xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm">🚀</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">فعالسازی فوری</div>
                        <div className="text-xs text-gray-500">بلافاصله پس از خرید</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">کمتر از ۱۰ دقیقه آماده</div>
                  </div>
                </div>
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

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-10 rounded-3xl shadow-lg mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">آمار و ارقام</h2>
            <p className="text-red-100 text-lg">اعتماد میلیون‌ها کاربر در سراسر جهان</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-users">
              <div className="text-4xl font-bold mb-2">2500</div>
              <div className="text-red-100">کاربر فعال</div>
            </div>
            <div className="text-center" data-testid="stat-orders">
              <div className="text-4xl font-bold mb-2">10k</div>
              <div className="text-red-100">سفارش موفق</div>
            </div>
            <div className="text-center" data-testid="stat-countries">
              <div className="text-4xl font-bold mb-2">5</div>
              <div className="text-red-100">کشور</div>
            </div>
            <div className="text-center" data-testid="stat-satisfaction">
              <div className="text-4xl font-bold mb-2">۹۸٪</div>
              <div className="text-red-100">رضایت کاربران</div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full">
              <span className="text-yellow-300">⭐</span>
              <span className="font-semibold">رتبه ۱ در ارائه اشتراک‌های پریمیوم</span>
              <span className="text-yellow-300">⭐</span>
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="bg-white p-10 rounded-3xl shadow-lg mb-16">
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg mb-3">چرا {product.title}؟</p>
            <h2 className="text-4xl font-bold text-gray-800 relative inline-block">
              مزایای انتخاب ما
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">امن و مطمئن</h3>
              <p className="text-gray-600 leading-relaxed">تمام اشتراک‌ها از طریق روش‌های امن تهیه می‌شوند</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">💰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">صرفه‌جویی</h3>
              <p className="text-gray-600 leading-relaxed">با لیمیت‌پس تا ۷۰٪ کمتر پرداخت کنید</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">⚡</div>
              <h3 className="text-xl font-semibent text-gray-800 mb-3">فوری</h3>
              <p className="text-gray-600 leading-relaxed">در کمتر از ۱۰ دقیقه اشتراک خود را فعال کنید</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">با کیفیت</h3>
              <p className="text-gray-600 leading-relaxed">همه اشتراک‌ها کیفیت پریمیوم دارند</p>
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