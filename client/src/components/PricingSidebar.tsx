import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, Gift, CreditCard, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingSidebarProps {
  selectedPlan: {
    duration: string;
    price: string;
    originalPrice?: string;
    discount?: string;
  };
  selectedType: {
    id: string;
    name: string;
    price: string;
  };
  autoRenewal?: boolean;
  onPurchase: () => void;
  onAddToCart?: () => void;
  className?: string;
  isLoading?: boolean;
}

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | number): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

export default function PricingSidebar({ 
  selectedPlan, 
  selectedType, 
  autoRenewal = true,
  onPurchase, 
  onAddToCart,
  className,
  isLoading = false
}: PricingSidebarProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Calculate pricing
  const basePrice = parseFloat(selectedPlan.price.replace(/[^\d.-]/g, ''));
  const originalPrice = selectedPlan.originalPrice 
    ? parseFloat(selectedPlan.originalPrice.replace(/[^\d.-]/g, ''))
    : basePrice;
  
  const planDiscount = originalPrice - basePrice;
  const promoDiscountAmount = (basePrice * promoDiscount) / 100;
  const subtotal = basePrice;
  const totalDiscount = planDiscount + promoDiscountAmount;
  const finalTotal = Math.max(0, basePrice - promoDiscountAmount);

  const handleApplyPromo = () => {
    // Simple promo code validation (you can replace with actual validation)
    const validCodes = {
      "WELCOME10": 10,
      "SAVE20": 20,
      "FIRST15": 15
    };

    if (validCodes[promoCode as keyof typeof validCodes]) {
      setPromoDiscount(validCodes[promoCode as keyof typeof validCodes]);
      setPromoApplied(true);
    } else {
      // Handle invalid promo code
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
  };

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
    <Card className={cn("p-6 sticky top-6", className)} dir="rtl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            خلاصه سفارش
          </h3>
          <p className="text-sm text-gray-600">
            جزئیات اشتراک انتخابی شما
          </p>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900">{selectedType.name}</p>
              <p className="text-sm text-gray-600">پلان {getDurationLabel(selectedPlan.duration)}</p>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">
                {formatPersianPrice(selectedPlan.price)} تومان
              </p>
              {selectedPlan.originalPrice && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPersianPrice(selectedPlan.originalPrice)} تومان
                </p>
              )}
            </div>
          </div>

          {/* Auto-renewal info */}
          {autoRenewal && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Clock className="h-4 w-4" />
                <span>تمدید خودکار فعال</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                اشتراک شما به صورت خودکار تمدید خواهد شد
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Promo Code */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            کد تخفیف دارید؟
          </label>
          {!promoApplied ? (
            <div className="flex gap-2">
              <Input
                placeholder="کد تخفیف را وارد کنید"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="text-right"
                data-testid="input-promo-code"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleApplyPromo}
                disabled={!promoCode.trim()}
                data-testid="button-apply-promo"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  کد {promoCode} اعمال شد
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRemovePromo}
                className="text-green-600 hover:text-green-700"
                data-testid="button-remove-promo"
              >
                حذف
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">مبلغ اولیه:</span>
            <span className="text-gray-900">
              {formatPersianPrice(originalPrice)} تومان
            </span>
          </div>

          {planDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">تخفیف پلان:</span>
              <span className="text-green-600">
                -{formatPersianPrice(planDiscount)} تومان
              </span>
            </div>
          )}

          {promoApplied && promoDiscountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">تخفیف کد:</span>
              <span className="text-green-600">
                -{formatPersianPrice(promoDiscountAmount)} تومان
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-900">مبلغ نهایی:</span>
            <span className="font-bold text-2xl text-red-600" data-testid="text-final-total">
              {formatPersianPrice(finalTotal)} تومان
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg"
            onClick={onPurchase}
            disabled={isLoading}
            data-testid="button-join-now"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>در حال پردازش...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>همین حالا بپیوندید</span>
              </div>
            )}
          </Button>

          {onAddToCart && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onAddToCart}
              disabled={isLoading}
              data-testid="button-add-to-cart"
            >
              افزودن به سبد خرید
            </Button>
          )}
        </div>

        {/* Security Badge */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">پرداخت امن</span>
          </div>
          <p className="text-xs text-gray-500">
            تمام پرداخت‌ها با رمزگذاری SSL محافظت می‌شوند
          </p>
        </div>

        {/* Satisfaction Guarantee */}
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            ۳۰ روز ضمانت بازگشت وجه
          </Badge>
        </div>
      </div>
    </Card>
  );
}