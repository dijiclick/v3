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
  const seoTitle = product.title ? generateProductTitle(product as Product) : "Product Title - Online Purchase | Limitpass";
  const seoDescription = product.title ? generateMetaDescription(product as Product) : "Product description from Limitpass";
  
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
        <CardTitle className="text-lg font-bold flex items-center gap-2" dir="ltr">
          <Info className="h-5 w-5" />
          SEO Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Google Search Result Preview */}
        <div className="border rounded-lg p-4 bg-white" dir="ltr">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Google Search Results Preview:</h3>
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
        <div className="space-y-3" dir="ltr">
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
                  <span>Title length: {titleLength} characters</span>
                  <Badge variant={isOptimalTitle ? "default" : "destructive"} className="text-xs">
                    {isOptimalTitle ? "Optimal" : titleLength < 30 ? "Too Short" : "Too Long"}
                  </Badge>
                </div>
                <div className="text-xs mt-1 opacity-75">
                  Optimal title length is between 30 and 60 characters
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
                  <span>Description length: {descriptionLength} characters</span>
                  <Badge variant={isOptimalDescription ? "default" : "destructive"} className="text-xs">
                    {isOptimalDescription ? "Optimal" : descriptionLength < 120 ? "Too Short" : "Too Long"}
                  </Badge>
                </div>
                <div className="text-xs mt-1 opacity-75">
                  Optimal description length is between 120 and 160 characters
                </div>
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* Social Media Preview */}
        <div className="border rounded-lg p-4" dir="ltr">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Social Media Preview:</h3>
          <div className="bg-gray-50 p-4 rounded-lg border max-w-md">
            {/* Product Image Preview */}
            <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title || "Product"} 
                  className="w-full h-full object-cover rounded-lg"
                  data-testid="seo-social-image"
                />
              ) : (
                <span className="text-gray-400 text-sm">Product Image</span>
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
          <AlertDescription dir="ltr">
            <div className="space-y-1">
              <div className="font-medium">SEO Tips:</div>
              <ul className="text-sm space-y-1 list-disc list-inside opacity-75">
                <li>Use relevant keywords in the title</li>
                <li>Fill in the short description - it will be shown in search results</li>
                <li>Add high-quality images for social media display</li>
                <li>Keep the slug URL-friendly</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}