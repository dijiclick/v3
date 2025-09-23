import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Product } from "@/types";
import { generateProductTitle, generateMetaDescription } from "@/lib/seo";

interface SEOPreviewProps {
  product: Partial<Product>;
  categoryName?: string;
}

export default function SEOPreview({ product, categoryName }: SEOPreviewProps) {
  // Generate SEO data based on current form values
  const seoTitle = product.title ? generateProductTitle(product as Product) : "عنوان محصول - خرید آنلاین | Limitpass";
  const seoDescription = product.title ? generateMetaDescription(product as Product) : "توضیحات محصول از لیمیت پس";
  
  // Validation checks
  const titleLength = seoTitle.length;
  const descriptionLength = seoDescription.length;
  const isOptimalTitle = titleLength >= 30 && titleLength <= 60;
  const isOptimalDescription = descriptionLength >= 120 && descriptionLength <= 160;
  
  // Generate URL preview
  const urlPreview = product.slug ? `limitpass.com/${categoryName || 'category'}/${product.slug}` : 'limitpass.com/category/product-slug';

  return (
    <Card className="w-full" data-testid="seo-preview">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2" dir="rtl">
          <Info className="h-5 w-5" />
          پیش‌نمایش SEO
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Google Search Result Preview */}
        <div className="border rounded-lg p-4 bg-white" dir="rtl">
          <h3 className="text-sm font-medium mb-3 text-gray-700">نمایش در نتایج جستجوی Google:</h3>
          <div className="bg-gray-50 p-4 rounded-lg" dir="ltr">
            {/* URL */}
            <div className="text-green-600 text-sm mb-1" data-testid="seo-url-preview">
              {urlPreview}
            </div>
            
            {/* Title */}
            <div 
              className="text-blue-600 text-lg font-medium hover:underline cursor-pointer mb-2 leading-tight"
              data-testid="seo-title-preview"
              dir="rtl"
            >
              {seoTitle}
            </div>
            
            {/* Description */}
            <div 
              className="text-gray-600 text-sm leading-relaxed"
              data-testid="seo-description-preview"
              dir="rtl"
            >
              {seoDescription}
            </div>
          </div>
        </div>

        {/* SEO Validation Alerts */}
        <div className="space-y-3" dir="rtl">
          {/* Title Length Check */}
          <Alert variant={isOptimalTitle ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {isOptimalTitle ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="flex items-center justify-between w-full">
                  <span>طول عنوان: {titleLength} کاراکتر</span>
                  <Badge variant={isOptimalTitle ? "default" : "destructive"} className="text-xs">
                    {isOptimalTitle ? "مطلوب" : titleLength < 30 ? "کوتاه" : "طولانی"}
                  </Badge>
                </div>
                <div className="text-xs mt-1 opacity-75">
                  عنوان بهینه بین ۳۰ تا ۶۰ کاراکتر است
                </div>
              </AlertDescription>
            </div>
          </Alert>

          {/* Description Length Check */}
          <Alert variant={isOptimalDescription ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {isOptimalDescription ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="flex items-center justify-between w-full">
                  <span>طول توضیحات: {descriptionLength} کاراکتر</span>
                  <Badge variant={isOptimalDescription ? "default" : "destructive"} className="text-xs">
                    {isOptimalDescription ? "مطلوب" : descriptionLength < 120 ? "کوتاه" : "طولانی"}
                  </Badge>
                </div>
                <div className="text-xs mt-1 opacity-75">
                  توضیحات بهینه بین ۱۲۰ تا ۱۶۰ کاراکتر است
                </div>
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* Social Media Preview */}
        <div className="border rounded-lg p-4" dir="rtl">
          <h3 className="text-sm font-medium mb-3 text-gray-700">نمایش در شبکه‌های اجتماعی:</h3>
          <div className="bg-gray-50 p-4 rounded-lg border max-w-md">
            {/* Product Image Preview */}
            <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title || "محصول"} 
                  className="w-full h-full object-cover rounded-lg"
                  data-testid="seo-social-image"
                />
              ) : (
                <span className="text-gray-400 text-sm">تصویر محصول</span>
              )}
            </div>
            
            {/* Title */}
            <div className="font-medium text-sm mb-1" data-testid="seo-social-title">
              {seoTitle}
            </div>
            
            {/* Description */}
            <div className="text-xs text-gray-600 line-clamp-2" data-testid="seo-social-description">
              {seoDescription}
            </div>
            
            {/* URL */}
            <div className="text-xs text-gray-400 mt-2" dir="ltr">
              {urlPreview}
            </div>
          </div>
        </div>

        {/* SEO Tips */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription dir="rtl">
            <div className="space-y-1">
              <div className="font-medium">نکات SEO:</div>
              <ul className="text-sm space-y-1 list-disc list-inside opacity-75">
                <li>از کلمات کلیدی در عنوان استفاده کنید</li>
                <li>توضیحات کوتاه را پر کنید - در نتایج جستجو نمایش داده می‌شود</li>
                <li>تصویر با کیفیت بالا برای نمایش در شبکه‌های اجتماعی اضافه کنید</li>
                <li>نام مستعار (slug) را URL-friendly نگه دارید</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}