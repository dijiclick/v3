import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useProductByCategoryAndSlug } from "@/lib/content-service";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cartManager } from "@/lib/cart";
import { BlogEditor } from "@/components/BlogEditor";
import { Edit3, Eye } from "lucide-react";

export default function ProductDetails() {
  const [, params] = useRoute("/:categorySlug/:productSlug");
  const { toast } = useToast();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [blogContent, setBlogContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: product, isLoading, error } = useProductByCategoryAndSlug(params?.categorySlug || "", params?.productSlug || "");

  // Dynamic SEO for product pages
  useSEO(
    product ? {
      title: `${product.title} - لیمیت پس`,
      description: product.description || `خرید ${product.title} با قیمت ویژه از لیمیت پس. دسترسی آسان و کیفیت پریمیوم`,
      keywords: `${product.title}, خرید اشتراک, لیمیت پس, ${product.tags?.join(', ') || ''}`,
    } : {
      title: "Product - لیمیت پس",
      description: "Loading product details...",
    }
  );

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    cartManager.addItem({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.image || undefined,
    });

    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
    });
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
        
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 mb-16 bg-white p-10 rounded-3xl shadow-lg">
          <div className="text-right">
            <h1 className="text-5xl font-bold text-gray-800 mb-6" data-testid="product-title">
              {product.title}
            </h1>
            <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center text-5xl text-white mx-auto mb-8 lg:hidden">
              {getProductIcon()}
            </div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {product.description || `دسترسی به ${product.title} با کیفیت پریمیوم و قیمت مناسب. تجربه بهترین سرویس‌ها را با لیمیت پس آغاز کنید.`}
            </p>
            
            {/* Features List */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>دسترسی کامل به {product.title}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>کیفیت پریمیوم و سرعت بالا</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>پشتیبانی ۲۴/۷</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>تضمین کیفیت و امنیت</span>
              </li>
              {product.inStock && (
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <span>موجود و آماده تحویل فوری</span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Purchase Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8 hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center text-5xl text-white mx-auto">
                {getProductIcon()}
              </div>
            </div>
            
            {/* Price Section */}
            <div className="bg-gray-50 p-5 rounded-xl mb-6 text-right">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">قیمت:</span>
                <span className="text-gray-600 line-through">{product.originalPrice || `${parseInt(product.price) + 50000} تومان`}</span>
              </div>
              {product.originalPrice && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">تخفیف:</span>
                  <span className="text-green-600">-{parseInt(product.originalPrice) - parseInt(product.price)} تومان</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">قیمت نهایی:</span>
                  <span className="text-2xl font-bold text-red-500">
                    {parseInt(product.price).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all hover:-translate-y-1 hover:shadow-lg mb-5"
              data-testid="add-to-cart-btn"
            >
              خرید و دریافت فوری
            </Button>
            
            <div className="text-center">
              <span className="text-gray-500 text-sm">✓ تضمین کیفیت و بازگشت وجه</span>
            </div>
          </div>
        </div>

        {/* Blog Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.5fr] gap-10 mb-16">
          {/* Blog Content Area */}
          <div>
            {isAdmin && (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditMode) {
                      setBlogContent(product?.blogContent || "");
                    }
                    setIsEditMode(!isEditMode);
                  }}
                  data-testid="toggle-edit-mode"
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4 ml-2" />
                      حالت مشاهده
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 ml-2" />
                      ویرایش محتوا
                    </>
                  )}
                </Button>
              </div>
            )}

            {isAdmin && isEditMode ? (
              <BlogEditor
                content={blogContent || product?.blogContent || ""}
                onChange={setBlogContent}
                onSave={async () => {
                  if (!product) return;
                  setIsSaving(true);
                  try {
                    const response = await fetch(`/api/products/${product.id}/blog`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ blogContent })
                    });
                    
                    if (response.ok) {
                      toast({
                        title: "محتوا ذخیره شد",
                        description: "محتوای وبلاگ با موفقیت ذخیره شد"
                      });
                      setIsEditMode(false);
                      // Optionally refresh the product data
                      window.location.reload();
                    } else {
                      throw new Error('Failed to save');
                    }
                  } catch (error) {
                    toast({
                      title: "خطا در ذخیره",
                      description: "مشکلی در ذخیره محتوا رخ داد",
                      variant: "destructive"
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                isLoading={isSaving}
              />
            ) : (
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
              <div className="text-4xl font-bold mb-2">۲.۵M+</div>
              <div className="text-red-100">کاربر فعال</div>
            </div>
            <div className="text-center" data-testid="stat-orders">
              <div className="text-4xl font-bold mb-2">۱۰۰K+</div>
              <div className="text-red-100">سفارش موفق</div>
            </div>
            <div className="text-center" data-testid="stat-countries">
              <div className="text-4xl font-bold mb-2">۱۸۰+</div>
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
            <h2 className="text-4xl font-bold text-gray-800 mb-6">آماده خرید {product.title} هستید؟</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              همین حالا به میلیون‌ها کاربری بپیوندید که از کیفیت بالای سرویس‌های لیمیت پس استفاده می‌کنند
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                onClick={handleAddToCart}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                data-testid="cta-main-button"
              >
                خرید فوری {product.title}
              </Button>
              <div className="text-sm text-gray-500">
                تضمین کیفیت • پشتیبانی ۲۴/۷
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <div className="text-green-500 text-2xl">✓</div>
                <span className="text-gray-700">پشتیبانی ۲۴/۷</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-green-500 text-2xl">✓</div>
                <span className="text-gray-700">تضمین بازگشت وجه</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-green-500 text-2xl">✓</div>
                <span className="text-gray-700">فعالسازی فوری</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}