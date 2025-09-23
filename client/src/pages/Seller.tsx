import { useSEO } from "@/hooks/use-seo";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import type { Page } from "@shared/schema";

// CMSContentRenderer component for rendering page content
function CMSContentRenderer({ content, className = "" }: { content: any; className?: string }) {
  if (!content) return null;
  
  // Handle different content types
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return <CMSContentRenderer content={parsed} className={className} />;
    } catch {
      // If not JSON, treat as HTML
      return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
    }
  }
  
  // Handle structured content
  if (typeof content === 'object') {
    return (
      <div className={className}>
        {content.blocks?.map((block: any, index: number) => (
          <div key={index} className="mb-4">
            {block.type === 'heading' && (
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{block.text}</h2>
            )}
            {block.type === 'paragraph' && (
              <p className="text-gray-600 leading-relaxed mb-4">{block.text}</p>
            )}
            {block.type === 'list' && (
              <ul className="list-disc list-inside text-gray-600 mb-4">
                {block.items?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return null;
}

export default function Seller() {
  // Fetch page content by slug - gracefully handle 404 errors
  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages/slug/seller'],
    retry: false, // Don't retry on 404
    throwOnError: false // Don't throw on 404
  });

  // If error is 404, treat as no CMS content (not a real error)
  const isCMSError = error && !((error as any)?.response?.status === 404);

  // Set SEO data from CMS or fallbacks
  useSEO({
    title: page?.seoTitle || page?.title || "همکاری در فروش - لیمیت پس",
    description: page?.seoDescription || page?.excerpt || "به تیم فروش لیمیت پس بپیوندید و درآمد عالی کسب کنید. شرایط همکاری و مزایای فروشندگان",
    keywords: page?.seoKeywords?.join(", ") || "همکاری در فروش، فروشنده، درآمد، همکار"
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir flex items-center justify-center" data-testid="cms-page-seller-loading">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">در حال بارگذاری اطلاعات همکاری...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - only show for real errors, not missing CMS pages
  if (isCMSError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir flex items-center justify-center" data-testid="cms-page-seller-error">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span className="text-lg">خطا در بارگذاری محتوا. لطفاً دوباره تلاش کنید.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir" dir="rtl">
      <main className="bg-white pt-10 pb-10 min-h-screen">
        <div className="max-w-6xl mx-auto px-5">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-6" data-testid="seller-title">
              {page?.title || "همکاری در فروش"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-testid="seller-description">
              {page?.excerpt || "به بزرگترین شبکه فروش اشتراک‌های پریمیوم در ایران بپیوندید و درآمد عالی کسب کنید"}
            </p>
            <div className="mt-8">
              <button className="bg-red-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-red-600 hover:-translate-y-1 hover:shadow-lg transition-all" data-testid="join-now-button">
                همین حالا شروع کنید
              </button>
            </div>
          </div>

          {/* CMS Content */}
          {page?.content && (
            <div className="mb-16 cms-content-area">
              <CMSContentRenderer content={page.content} className="cms-content-body" />
            </div>
          )}

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
              <div className="text-6xl mb-6">💰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="high-commission-title">کمیسیون بالا</h3>
              <p className="text-gray-600 leading-relaxed">
                تا ۳۰٪ کمیسیون از هر فروش دریافت کنید. هرچه بیشتر بفروشید، درآمد بیشتری کسب کنید.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="instant-payment-title">پرداخت فوری</h3>
              <p className="text-gray-600 leading-relaxed">
                درآمد خود را بلافاصله پس از تأیید فروش دریافت کنید. بدون انتظار طولانی!
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="dashboard-title">پنل مدیریت</h3>
              <p className="text-gray-600 leading-relaxed">
                پنل حرفه‌ای برای مدیریت فروش‌ها، مشاهده آمار و دریافت گزارش‌های تفصیلی.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="marketing-tools-title">ابزار بازاریابی</h3>
              <p className="text-gray-600 leading-relaxed">
                بنرها، لینک‌های تبلیغاتی و محتوای آماده برای افزایش فروش در اختیار شما.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="rewards-title">جوایز ویژه</h3>
              <p className="text-gray-600 leading-relaxed">
                بونوس‌های ویژه برای فروشندگان برتر و مسابقات ماهانه با جوایز نقدی.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="support-title">پشتیبانی ۲۴/۷</h3>
              <p className="text-gray-600 leading-relaxed">
                تیم پشتیبانی اختصاصی برای فروشندگان در تمام ساعات شبانه‌روز.
              </p>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-gray-50 p-12 rounded-3xl mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12" data-testid="requirements-title">
              شرایط همکاری
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <span className="text-green-500">✅</span>
                  شرایط لازم
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3" data-testid="requirement-age">
                    <span className="text-blue-500">•</span>
                    حداقل ۱۸ سال سن
                  </li>
                  <li className="flex items-center gap-3" data-testid="requirement-id">
                    <span className="text-blue-500">•</span>
                    داشتن کارت ملی معتبر
                  </li>
                  <li className="flex items-center gap-3" data-testid="requirement-bank">
                    <span className="text-blue-500">•</span>
                    حساب بانکی شخصی
                  </li>
                  <li className="flex items-center gap-3" data-testid="requirement-internet">
                    <span className="text-blue-500">•</span>
                    دسترسی به اینترنت
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <span className="text-orange-500">⭐</span>
                  مزایای اضافی
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3" data-testid="advantage-social">
                    <span className="text-blue-500">•</span>
                    داشتن شبکه اجتماعی فعال
                  </li>
                  <li className="flex items-center gap-3" data-testid="advantage-sales">
                    <span className="text-blue-500">•</span>
                    تجربه در حوزه فروش
                  </li>
                  <li className="flex items-center gap-3" data-testid="advantage-marketing">
                    <span className="text-blue-500">•</span>
                    آشنایی با بازاریابی دیجیتال
                  </li>
                  <li className="flex items-center gap-3" data-testid="advantage-communication">
                    <span className="text-blue-500">•</span>
                    مهارت‌های ارتباطی قوی
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Commission Table */}
          <div className="bg-white p-12 rounded-3xl shadow-lg border border-gray-100 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12" data-testid="commission-table-title">
              جدول کمیسیون‌ها
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="bg-red-500 text-white">
                    <th className="py-4 px-6 rounded-tr-xl" data-testid="table-header-level">سطح فروش</th>
                    <th className="py-4 px-6" data-testid="table-header-sales">تعداد فروش ماهانه</th>
                    <th className="py-4 px-6" data-testid="table-header-commission">درصد کمیسیون</th>
                    <th className="py-4 px-6 rounded-tl-xl" data-testid="table-header-bonus">بونوس ویژه</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-bold text-gray-800" data-testid="level-bronze">برنزی</td>
                    <td className="py-4 px-6 text-gray-600" data-testid="sales-bronze">۱-۲۰</td>
                    <td className="py-4 px-6 text-green-600 font-bold" data-testid="commission-bronze">۱۵٪</td>
                    <td className="py-4 px-6 text-gray-600" data-testid="bonus-bronze">-</td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="py-4 px-6 font-bold text-gray-800" data-testid="level-silver">نقره‌ای</td>
                    <td className="py-4 px-6 text-gray-600" data-testid="sales-silver">۲۱-۵۰</td>
                    <td className="py-4 px-6 text-green-600 font-bold" data-testid="commission-silver">۲۰٪</td>
                    <td className="py-4 px-6 text-blue-600" data-testid="bonus-silver">۵۰۰ هزار تومان</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-bold text-gray-800" data-testid="level-gold">طلایی</td>
                    <td className="py-4 px-6 text-gray-600" data-testid="sales-gold">۵۱-۱۰۰</td>
                    <td className="py-4 px-6 text-green-600 font-bold" data-testid="commission-gold">۲۵٪</td>
                    <td className="py-4 px-6 text-blue-600" data-testid="bonus-gold">۱ میلیون تومان</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-6 font-bold text-gray-800" data-testid="level-diamond">الماسی</td>
                    <td className="py-4 px-6 text-gray-600" data-testid="sales-diamond">۱۰۰+</td>
                    <td className="py-4 px-6 text-green-600 font-bold" data-testid="commission-diamond">۳۰٪</td>
                    <td className="py-4 px-6 text-blue-600" data-testid="bonus-diamond">۲ میلیون تومان</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Start */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-12" data-testid="how-to-start-title">
              چگونه شروع کنم؟
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: "۱", title: "ثبت نام", description: "فرم درخواست همکاری را تکمیل کنید" },
                { number: "۲", title: "بررسی مدارک", description: "مدارک شما در ۲۴ ساعت بررسی می‌شود" },
                { number: "۳", title: "آموزش", description: "آموزش‌های لازم را دریافت کنید" },
                { number: "۴", title: "شروع فروش", description: "فروش خود را شروع کرده و درآمد کسب کنید" }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2" data-testid={`step-title-${index + 1}`}>{step.title}</h3>
                  <p className="text-gray-600 text-sm" data-testid={`step-description-${index + 1}`}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-12 rounded-3xl text-white text-center">
            <h2 className="text-3xl font-bold mb-6" data-testid="cta-title">
              آماده شروع یک کسب‌وکار پردرآمد هستید؟
            </h2>
            <p className="text-xl mb-8 opacity-90" data-testid="cta-description">
              به هزاران فروشنده موفق لیمیت پس بپیوندید
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-red-500 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-colors" data-testid="apply-now-button">
                درخواست همکاری
              </button>
              <button className="bg-red-700 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-red-800 transition-colors" data-testid="contact-sales-button">
                تماس با واحد فروش
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}