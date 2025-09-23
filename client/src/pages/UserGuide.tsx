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

export default function UserGuide() {
  // Fetch page content by slug - gracefully handle 404 errors
  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages/slug/userguide'],
    retry: false, // Don't retry on 404
    throwOnError: false // Don't throw on 404
  });

  // If error is 404, treat as no CMS content (not a real error)
  const isCMSError = error && !((error as any)?.response?.status === 404);

  // Set SEO data from CMS or fallbacks
  useSEO({
    title: page?.seoTitle || page?.title || "راهنمای استفاده - لیمیت پس",
    description: page?.seoDescription || page?.excerpt || "راهنمای کامل نحوه استفاده از سرویس‌های لیمیت پس، از خرید تا فعالسازی اشتراک",
    keywords: page?.seoKeywords?.join(", ") || "راهنما، نحوه استفاده، آموزش، خرید اشتراک"
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir flex items-center justify-center" data-testid="cms-page-userguide-loading">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">در حال بارگذاری راهنمای استفاده...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - only show for real errors, not missing CMS pages
  if (isCMSError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir flex items-center justify-center" data-testid="cms-page-userguide-error">
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
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-800 mb-4" data-testid="user-guide-title">
              {page?.title || "راهنمای استفاده - دانلود Superapp"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="user-guide-description">
              {page?.excerpt || "برای Ahrefs و بقیه ابزارها - آموزش نصب و استفاده از سوپر اپ لیمیت پس"}
            </p>
          </div>

          {/* CMS Content */}
          {page?.content && (
            <div className="mb-16 cms-content-area">
              <CMSContentRenderer content={page.content} className="cms-content-body" />
            </div>
          )}

          {/* Download Section */}
          <div className="space-y-12">
            {/* SuperApp Download */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6">
                  📱
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4" data-testid="download-title">
                  دانلود Superapp
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  نصب سوپر اپ به تنهایی کافی است و نیازی به اکستنشن ندارید
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-2xl text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="windows-title">💻 نسخه ویندوز</h3>
                  <p className="text-gray-600 mb-6">ورژن 1.0.7</p>
                  <a 
                    href="https://limitpass.com/superapp1.0.7.exe" 
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors inline-block"
                    data-testid="windows-download"
                    download
                  >
                    دانلود برای ویندوز
                  </a>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="mac-title">🍎 نسخه مک</h3>
                  <p className="text-gray-600 mb-6">macOS Compatible</p>
                  <a 
                    href="https://limitpass.com/mac.zip" 
                    className="bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors inline-block"
                    data-testid="mac-download"
                    download
                  >
                    دانلود برای مک
                  </a>
                </div>
              </div>
            </div>

            {/* Mac Installation Guide */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6" data-testid="mac-install-title">
                🍎 آموزش نصب ورژن مک
              </h2>
              
              <div className="bg-yellow-50 p-6 rounded-xl mb-6">
                <h4 className="font-bold text-yellow-800 mb-3">⚠️ حل مشکل "file is damaged"</h4>
                <div className="space-y-3 text-gray-700">
                  <p>اگر هنگام نصب ارور "file is damaged" دریافت کردید:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>فایل اکسترکت شده باید روی دسکتاپ باشد</li>
                    <li>Terminal را باز کنید</li>
                    <li>فایل اپ را در Terminal بیندازید تا مسیر نصب مشخص شود</li>
                    <li>قبل از مسیر نصب، عبارت زیر را بزنید:</li>
                  </ol>
                  
                  <div className="bg-black text-green-400 p-3 rounded font-mono text-sm mt-4" data-testid="terminal-command">
                    xattr -cr
                  </div>
                  
                  <p className="text-sm"><strong>نمونه:</strong></p>
                  <div className="bg-black text-green-400 p-3 rounded font-mono text-sm" data-testid="terminal-example">
                    xattr -cr /Users/hamid/Desktop/mac-arm64/Seotech\ Super\ App.app
                  </div>
                  
                  <p className="text-sm text-green-700">
                    ✅ بعد از این دستور، اپ اجرا می‌شود و ارور نمی‌دهد
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6" data-testid="notes-title">
                📝 نکات مهم
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 p-4 rounded-xl">
                  <h4 className="font-bold text-red-800 mb-2">🔄 آپدیت</h4>
                  <p className="text-red-700 text-sm">
                    حتماً ورژن قبلی را اول uninstall کنید که به مشکل نخورید
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-bold text-blue-800 mb-2">🌐 VPN</h4>
                  <p className="text-blue-700 text-sm">
                    در صورتی که یک سری از ابزارها برایتان لود نمی‌شود و نیاز به VPN داشتید، با پشتیبانی پیام بدید
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support and Telegram */}
          <div className="bg-gray-50 p-12 rounded-3xl mt-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12" data-testid="support-section-title">
              پشتیبانی و ارتباط
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="telegram-group-title">
                  گروه تلگرام
                </h3>
                <p className="text-gray-600 mb-6">
                  حتماً در گروه تلگرام عضو شوید
                </p>
                <a 
                  href="https://t.me/limitpass" 
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors inline-block"
                  data-testid="telegram-group-link"
                >
                  لینک کانال
                </a>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid="support-title">
                  پشتیبانی
                </h3>
                <p className="text-gray-600 mb-6">
                  دقت کنید که پشتیبانی فقط از طریق تلگرام انجام می‌شود
                </p>
                <button className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors" data-testid="support-button">
                  ارتباط با پشتیبانی
                </button>
              </div>
            </div>

            {/* Error Troubleshooting */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6" data-testid="error-title">
                عیب‌یابی
              </h3>
              <div className="bg-red-50 p-6 rounded-xl">
                <h4 className="font-bold text-red-800 mb-3">❌ ارور Maximum session</h4>
                <p className="text-red-700">
                  در صورت مواجهه با این ارور با پشتیبانی تماس بگیرید
                </p>
              </div>
            </div>
          </div>

          {/* Quick Start CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 rounded-3xl text-white">
              <h2 className="text-2xl font-bold mb-4" data-testid="quick-start-title">
                آماده شروع هستید؟
              </h2>
              <p className="mb-6" data-testid="quick-start-description">
                سوپر اپ را دانلود کنید و به همه ابزارها دسترسی پیدا کنید
              </p>
              <div className="flex justify-center gap-4">
                <a href="https://limitpass.com/superapp1.0.7.exe" className="bg-white text-red-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors" data-testid="download-windows-cta">
                  دانلود ویندوز
                </a>
                <a href="https://limitpass.com/mac.zip" className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors" data-testid="download-mac-cta">
                  دانلود مک
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}