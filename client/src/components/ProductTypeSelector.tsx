import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  features?: string[];
  popular?: boolean;
  recommended?: boolean;
  icon?: string;
  maxUsers?: number;
}

interface ProductTypeSelectorProps {
  types: ProductType[];
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
  className?: string;
}

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | number): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

export default function ProductTypeSelector({ 
  types, 
  selectedType, 
  onTypeSelect, 
  className 
}: ProductTypeSelectorProps) {
  // Default product types if none provided
  const defaultTypes: ProductType[] = [
    {
      id: "shared-6",
      name: "اشتراک مشترک",
      description: "۱ اسلات مشترک با ۶ نفر",
      price: "149",
      originalPrice: "199",
      maxUsers: 6,
      features: ["دسترسی همزمان محدود", "قابلیت‌های پایه", "پشتیبانی استاندارد"],
      icon: "👥"
    },
    {
      id: "shared-3", 
      name: "اشتراک نیمه‌خصوصی",
      description: "۱ اسلات مشترک با ۳ نفر",
      price: "249",
      originalPrice: "299", 
      maxUsers: 3,
      popular: true,
      features: ["دسترسی بهتر", "سرعت بالاتر", "پشتیبانی اولویت‌دار"],
      icon: "👤"
    },
    {
      id: "private",
      name: "اشتراک خصوصی",
      description: "اختصاصی فقط برای شما",
      price: "499",
      maxUsers: 1,
      recommended: true,
      features: ["دسترسی کامل", "حداکثر سرعت", "پشتیبانی ۲۴/۷", "تضمین آپتایم"],
      icon: "👑"
    }
  ];

  const typesToUse = types.length > 0 ? types : defaultTypes;

  const getTypeIcon = (type: ProductType) => {
    if (type.icon) return type.icon;
    if (type.id.includes('private')) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (type.maxUsers && type.maxUsers <= 3) return <Users className="h-6 w-6 text-blue-500" />;
    return <Users className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className={cn("space-y-4", className)} dir="rtl">
      <div className="grid gap-4 md:grid-cols-1">
        {typesToUse.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "p-6 cursor-pointer transition-all duration-200 hover:shadow-md border-2 relative",
              selectedType === type.id 
                ? "border-red-500 bg-red-50 shadow-lg" 
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onTypeSelect(type.id)}
            data-testid={`product-type-${type.id}`}
          >
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {type.popular && (
                <Badge className="bg-red-500 text-white text-xs">
                  محبوب‌ترین
                </Badge>
              )}
              {type.recommended && (
                <Badge className="bg-yellow-500 text-white text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  پیشنهادی
                </Badge>
              )}
            </div>

            <div className="flex items-start gap-4">
              {/* Selection indicator */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                  selectedType === type.id
                    ? "border-red-500 bg-red-500"
                    : "border-gray-300"
                )}
              >
                {selectedType === type.id && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">
                    {typeof getTypeIcon(type) === 'string' ? getTypeIcon(type) : getTypeIcon(type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {type.description}
                    </p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPersianPrice(type.price)}
                  </span>
                  <span className="text-sm text-gray-600">تومان / ماه</span>
                  
                  {type.originalPrice && (
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {formatPersianPrice(type.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Max users info */}
                {type.maxUsers && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {type.maxUsers === 1 
                        ? "فقط برای شما" 
                        : `تا ${type.maxUsers} کاربر همزمان`
                      }
                    </span>
                  </div>
                )}

                {/* Features */}
                {type.features && type.features.length > 0 && (
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}