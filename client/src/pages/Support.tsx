import { useQuery } from "@tanstack/react-query";
import { Loader, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import type { Page } from "@shared/schema";

// Helper component to render CMS content (copied from CMSPage)
function CMSContentRenderer({ content, className = "" }: { content: any; className?: string }) {
  if (!content) {
    return <div className={className}>No content available</div>;
  }

  // If content is a string (HTML or markdown), render it directly
  if (typeof content === 'string') {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // If content is an object (structured JSON), render it as sections
  if (typeof content === 'object') {
    return (
      <div className={className}>
        {Array.isArray(content) ? (
          content.map((section, index) => (
            <div key={index} className="mb-8">
              {section.type === 'heading' && (
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {String(section.text || '')}
                </h2>
              )}
              {section.type === 'paragraph' && (
                <p className="text-gray-600 leading-relaxed mb-4">
                  {String(section.text || '')}
                </p>
              )}
              {section.type === 'html' && (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
            </div>
          ))
        ) : (
          // Handle object content with properties
          <div>
            {content.title && (
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {String(content.title)}
              </h2>
            )}
            {content.description && (
              <p className="text-lg text-gray-600 mb-8">
                {String(content.description)}
              </p>
            )}
            {content.body && (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback for other content types
  return (
    <div className={className}>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

export default function Support() {
  // Fetch page content by slug - gracefully handle 404 errors
  const { data: page, isLoading, error } = useQuery<Page | null>({
    queryKey: ['/api/pages/slug/support'],
    queryFn: async () => {
      const res = await fetch('/api/pages/slug/support');
      if (res.status === 404) return null; // Return null on 404, no error
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Network error' }));
        throw errorData;
      }
      return await res.json() as Page;
    },
    retry: false
  });

  // Only treat real errors as CMS errors (not 404s)
  const isCMSError = error && page !== null;

  // Set SEO data from CMS or fallbacks
  useSEO({
    title: page?.seoTitle || page?.title || "پشتیبانی - لیمیت پس",
    description: page?.seoDescription || page?.excerpt || "راهنمای خرید، پشتیبانی فنی و تماس با ما در لیمیت پس. ما آماده کمک به شما هستیم.",
    keywords: page?.seoKeywords?.join(", ") || "پشتیبانی، راهنما، تماس با ما، کمک"
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader className="mx-auto h-8 w-8 text-blue-500 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              در حال بارگذاری...
            </h3>
            <p className="text-gray-500">
              لطفاً صبر کنید تا محتوای صفحه بارگذاری شود.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - only show for real errors, not missing CMS pages
  if (isCMSError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              خطا در بارگذاری محتوا
            </h3>
            <p className="text-gray-500">
              {(error as Error).message || "مشکلی در بارگذاری صفحه پیش آمده است."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir" data-testid="cms-page-support">
      <main className="bg-white pt-10 pb-10 min-h-screen" dir="rtl">
        <div className="max-w-6xl mx-auto px-5">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-800 mb-4" data-testid="support-title">
              {page?.title || "پشتیبانی لیمیت پس"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="support-description">
              {page?.excerpt || "ارائه ابزارهای دیجیتال مارکتینگ به برترین شرکت‌ها از سال ۹۷ با بیش از ۴۰۰ مشتری فعال"}
            </p>
          </div>

          {/* CMS Content */}
          {page?.content && (
            <div className="mb-16 cms-content-area">
              <CMSContentRenderer content={page.content as any} className="cms-content-body" />
            </div>
          )}

            {/* Support Options - Keep existing layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Telegram Support */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
                <div className="text-6xl mb-6">📱</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="telegram-support-title">پشتیبانی تلگرام</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  پشتیبانی فقط از طریق تلگرام انجام می‌شود. در کانال تلگرام ما عضو شوید
                </p>
                <a href="https://t.me/limitpass" className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors inline-block" data-testid="telegram-button">
                  کانال تلگرام
                </a>
              </div>

              {/* FAQ */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
                <div className="text-6xl mb-6">❓</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="faq-title">سوالات متداول</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  پاسخ سوالات رایج در مورد استفاده از ابزارها و پکیج‌ها
                </p>
                <button className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors" data-testid="faq-button">
                  مشاهده سوالات
                </button>
              </div>

              {/* Client Portal */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
                <div className="text-6xl mb-6">🔐</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="portal-title">ناحیه کاربری</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  ورود به حساب کاربری برای مدیریت اشتراک‌ها و تیکت‌های پشتیبانی
                </p>
                <a href="https://limitpass.com/clients" className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors inline-block" data-testid="portal-button">
                  ناحیه کاربری
                </a>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gray-50 p-12 rounded-3xl">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-12" data-testid="faq-section-title">
                سوالات متداول
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    question: "امکان اتصال از دو سیستم وجود دارد؟",
                    answer: "فقط در پکیج مانستر و تایتان این امکان وجود داره و در پکیج های هوش مصنوعی فقط از ۱ سیستم می‌تونید وصل بشید"
                  },
                  {
                    question: "آیا امکان درخواست رفند وجود دارد؟",
                    answer: "بله، در صورت عدم رضایت از خدمات ما طی ۷ روز اول می‌تونید درخواست بازگشت وجه بدید"
                  },
                  {
                    question: "چگونه می‌توانم با پشتیبانی تماس بگیرم؟",
                    answer: "فقط از طریق کانال تلگرام امکان ارتباط با پشتیبانی وجود دارد. لینک کانال در بالای صفحه موجود است"
                  },
                  {
                    question: "آیا امکان تست محصولات قبل از خرید وجود دارد؟",
                    answer: "بله، برای اکثر محصولات امکان تست ۲۴ ساعته رایگان وجود دارد. برای دریافت تست با پشتیبانی تماس بگیرید"
                  },
                  {
                    question: "روش‌های پرداخت چیست؟",
                    answer: "پرداخت از طریق درگاه بانکی، کارت به کارت و رمزارزها امکان‌پذیر است"
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-3" data-testid={`faq-question-${index}`}>
                      {faq.question}
                    </h4>
                    <p className="text-gray-600 leading-relaxed" data-testid={`faq-answer-${index}`}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                هنوز سوالی دارید؟
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                تیم پشتیبانی ما آماده پاسخگویی به سوالات شماست
              </p>
              <a href="https://t.me/limitpass" className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors inline-block" data-testid="contact-button">
                ارتباط با پشتیبانی
              </a>
            </div>
          </div>
        </main>
      </div>
    );
}