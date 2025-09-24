import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Search, Heart } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";

export default function NotFound() {
  useSEO({
    title: "صفحه مورد نظر یافت نشد - لیمیت پس",
    description: "صفحه‌ای که دنبال آن می‌گردید یافت نشد. به صفحه اصلی بازگردید و مجموعه محصولات اشتراکی ما را بررسی کنید.",
    keywords: "404, صفحه یافت نشد, اشتراک, لیمیت پس",
    ogTitle: "صفحه مورد نظر یافت نشد - لیمیت پس",
    ogDescription: "صفحه‌ای که دنبال آن می‌گردید یافت نشد. به صفحه اصلی بازگردید و مجموعه محصولات اشتراکی ما را بررسی کنید.",
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
    robots: 'noindex, nofollow'
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-950 font-vazir" dir="rtl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-gradient-to-br from-orange-500/15 to-red-500/15 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <Card className="w-full max-w-lg mx-auto backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-red-200/50 dark:border-red-800/50 shadow-2xl shadow-red-500/10">
          <CardContent className="pt-12 pb-8 text-center">
            {/* 404 Icon with Persian styling */}
            <div className="flex justify-center mb-8 relative">
              <div className="relative">
                <div className="text-8xl font-black text-transparent bg-gradient-to-br from-red-600 via-red-500 to-pink-600 bg-clip-text select-none">
                  ۴۰۴
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
            
            {/* Main heading */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed" data-testid="not-found-title">
              صفحه مورد نظر یافت نشد
            </h1>

            {/* Subheading */}
            <h2 className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد
            </h2>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-md mx-auto" data-testid="not-found-description">
              ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه منتقل شده باشد. نگران نباشید، از دکمه زیر می‌توانید به صفحه اصلی بازگردید.
            </p>

            {/* Action buttons */}
            <div className="space-y-4">
              <Link href="/">
                <Button 
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  data-testid="home-button"
                >
                  <Home className="h-5 w-5 ml-2" />
                  بازگشت به صفحه اصلی
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              </Link>

              {/* Secondary actions */}
              <div className="flex gap-3 justify-center">
                <Link href="/search">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg"
                    data-testid="search-button"
                  >
                    <Search className="h-4 w-4 ml-2" />
                    جستجو در سایت
                  </Button>
                </Link>
                
                <Link href="/support">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg"
                    data-testid="support-button"
                  >
                    <Heart className="h-4 w-4 ml-2" />
                    پشتیبانی
                  </Button>
                </Link>
              </div>
            </div>

            {/* Footer message */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                <span className="text-transparent bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text font-semibold">لیمیت پس</span>
                {" "}
                همیشه در کنار شماست
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500"></div>
    </div>
  );
}
