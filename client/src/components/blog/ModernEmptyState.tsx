import { Search, FileText, BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModernEmptyStateProps {
  type: "search" | "category" | "general";
  query?: string;
  onReset?: () => void;
}

export function ModernEmptyState({ type, query, onReset }: ModernEmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (type) {
      case "search":
        return {
          icon: <Search className="w-16 h-16 text-gray-300" />,
          title: "نتیجه‌ای یافت نشد",
          description: query 
            ? `متأسفانه برای جستجوی "${query}" نتیجه‌ای پیدا نشد.` 
            : "متأسفانه نتیجه‌ای برای جستجوی شما پیدا نشد.",
          suggestions: [
            "کلمات کلیدی مختلفی را امتحان کنید",
            "از کلمات کوتاه‌تر استفاده کنید",
            "املای کلمات را بررسی کنید"
          ],
          actionText: "پاک کردن جستجو"
        };
      
      case "category":
        return {
          icon: <Filter className="w-16 h-16 text-gray-300" />,
          title: "مطلبی در این دسته‌بندی نیست",
          description: "در حال حاضر مطلبی در این دسته‌بندی موجود نیست.",
          suggestions: [
            "دسته‌بندی‌های دیگر را بررسی کنید",
            "به صفحه اصلی برگردید",
            "از جستجو استفاده کنید"
          ],
          actionText: "نمایش همه مطالب"
        };
      
      default:
        return {
          icon: <BookOpen className="w-16 h-16 text-gray-300" />,
          title: "هنوز مطلبی موجود نیست",
          description: "در حال حاضر مطلبی در وبلاگ موجود نیست.",
          suggestions: [
            "لطفاً بعداً دوباره تلاش کنید",
            "با ما تماس بگیرید",
            "از سایر بخش‌ها دیدن کنید"
          ],
          actionText: "بازگشت به صفحه اصلی"
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-6 text-center" 
      dir="rtl" 
      data-testid={`empty-state-${type}`}
    >
      <div className="mb-6">
        {content.icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 font-vazir">
        {content.title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md font-vazir">
        {content.description}
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md">
        <p className="text-sm font-medium text-gray-900 mb-2 font-vazir">پیشنهادات:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          {content.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center justify-start gap-2 font-vazir">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
      
      {onReset && (
        <Button 
          onClick={onReset}
          variant="outline"
          className="font-vazir"
          data-testid="empty-state-reset"
        >
          {content.actionText}
        </Button>
      )}
    </div>
  );
}