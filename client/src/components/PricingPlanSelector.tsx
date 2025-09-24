import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  duration: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  priceNumber?: number;
  popular?: boolean;
  features?: string[];
}

interface PricingPlanSelectorProps {
  plans: PricingPlan[];
  selectedPlan: string;
  onPlanSelect: (duration: string) => void;
  className?: string;
}

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | number): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

export default function PricingPlanSelector({ 
  plans, 
  selectedPlan, 
  onPlanSelect, 
  className 
}: PricingPlanSelectorProps) {
  // Default plans if none provided
  const defaultPlans: PricingPlan[] = [
    {
      duration: "3-months",
      price: "149",
      originalPrice: "199",
      discount: "25%",
      priceNumber: 149,
      features: ["دسترسی کامل به ChatGPT Plus", "فعالسازی فوری"]
    },
    {
      duration: "6-months", 
      price: "249",
      originalPrice: "299",
      discount: "17%",
      priceNumber: 249,
      popular: true,
      features: ["دسترسی کامل به ChatGPT Plus", "فعالسازی فوری", "پشتیبانی اولویت‌دار"]
    },
    {
      duration: "12-months",
      price: "399", 
      originalPrice: "499",
      discount: "20%",
      priceNumber: 399,
      features: ["دسترسی کامل به ChatGPT Plus", "فعالسازی فوری", "پشتیبانی اولویت‌دار", "تضمین بازگشت وجه"]
    }
  ];

  const plansToUse = plans.length > 0 ? plans : defaultPlans;

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "3-months": return "۳ ماهه";
      case "6-months": return "۶ ماهه";
      case "12-months": return "۱۲ ماهه";
      case "monthly": return "ماهانه";
      case "yearly": return "سالانه";
      default: return duration;
    }
  };

  return (
    <div className={cn("space-y-4", className)} dir="rtl">
      <div className="space-y-3">
        {plansToUse.map((plan) => (
          <Card
            key={plan.duration}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2",
              selectedPlan === plan.duration 
                ? "border-red-500 bg-red-50 shadow-lg" 
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onPlanSelect(plan.duration)}
            data-testid={`pricing-plan-${plan.duration}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      selectedPlan === plan.duration
                        ? "border-red-500 bg-red-500"
                        : "border-gray-300"
                    )}
                  >
                    {selectedPlan === plan.duration && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {getDurationLabel(plan.duration)}
                      </h3>
                      {plan.popular && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                          محبوب‌ترین
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPersianPrice(plan.price)}
                      </span>
                      <span className="text-sm text-gray-600">تومان</span>
                      
                      {plan.originalPrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPersianPrice(plan.originalPrice)}
                          </span>
                          {plan.discount && (
                            <Badge variant="secondary" className="text-xs">
                              {plan.discount} تخفیف
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {plan.features && plan.features.length > 0 && (
                  <div className="mt-3 mr-8">
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}