import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/lib/content-service";

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | null): string => {
  if (!price) return "0";
  const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

// Utility function to render rich text content
const renderRichText = (richText: any): string => {
  if (!richText) return '';
  
  // Handle different possible structures of rich text content
  if (typeof richText === 'string') {
    return richText;
  }
  
  // If it's a structured rich text object, convert to HTML
  if (richText && typeof richText === 'object') {
    // Handle Sanity Portable Text or similar structures
    if (Array.isArray(richText)) {
      return richText.map((block: any) => {
        if (block.style === 'h1') return `<h1>${block.children?.[0]?.text || ''}</h1>`;
        if (block.style === 'h2') return `<h2>${block.children?.[0]?.text || ''}</h2>`;
        if (block.style === 'h3') return `<h3>${block.children?.[0]?.text || ''}</h3>`;
        return `<p>${block.children?.[0]?.text || ''}</p>`;
      }).join('');
    }
    
    // Fallback for other object structures
    return JSON.stringify(richText);
  }
  
  return '';
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Calculate product URL - only return valid URL if category is known
  const productUrl = (() => {
    if (categories && product.categoryId) {
      const category = categories.find(cat => cat.id === product.categoryId);
      if (category) {
        return `/${category.slug}/${product.slug}`;
      }
    }
    return null; // Don't provide a fallback URL that leads to 404
  })();


  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    
    toast({
      title: isWishlisted ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها افزوده شد",
      description: `${product.title} ${isWishlisted ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها افزوده شد'}.`,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.buyLink) {
      window.open(product.buyLink, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "توجه",
        description: "لینک خرید مستقیم موجود نیست. لطفاً با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  };

  const rating = product.rating ? parseFloat(product.rating) : 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  // Get category name
  const categoryName = categories?.find(cat => cat.id === product.categoryId)?.name || 'محصول';

  // Render loading state or non-clickable card until we have a valid URL
  if (!productUrl || categoriesLoading) {
    return (
      <div className={`bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden hover:shadow-xl transition-all duration-300 group ${
        !product.inStock ? 'opacity-75 bg-gray-100 dark:bg-gray-800' : ''
      }`} data-testid={`product-card-${product.id}`} dir="rtl">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.title} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              !product.inStock ? 'opacity-60 grayscale' : ''
            }`}
            data-testid={`product-image-${product.id}`}
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              className="bg-white/90 dark:bg-card/90 text-foreground p-2 rounded-full hover:bg-white dark:hover:bg-card transition-colors shadow-lg"
              data-testid={`wishlist-button-${product.id}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge 
                variant="destructive" 
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg"
                data-testid={`sale-badge-${product.id}`}
              >
                {Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)}% تخفیف
              </Badge>
            )}
            {product.featured && (
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg"
                data-testid={`featured-badge-${product.id}`}
              >
                ویژه
              </Badge>
            )}
            {!product.inStock && (
              <Badge 
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg" 
                data-testid={`unavailable-badge-${product.id}`}
              >
                ناموجود
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-3">
            <h3 className={`font-bold text-lg line-clamp-2 mb-2 ${
              !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-foreground'
            }`} data-testid={`product-title-${product.id}`}>
              {product.title}
            </h3>
            

            
            {/* Category */}
            <p className="text-xs text-gray-500 dark:text-muted-foreground" data-testid={`product-category-${product.id}`}>
              {categoryName}
            </p>
          </div>
          
          {/* Featured Features for Featured Products */}
          {product.featured && product.featuredFeatures && product.featuredFeatures.length > 0 && (
            <div className="mb-3" data-testid={`product-featured-features-${product.id}`}>
              <div className="flex flex-wrap gap-1">
                {product.featuredFeatures.slice(0, 2).map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-muted-foreground" data-testid={`product-rating-${product.id}`}>
                ({product.reviewCount || 0} نظر)
              </span>
            </div>
          )}
          
          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Current Price */}
                <span className={`text-lg font-bold ${
                  !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-green-600 dark:text-green-500'
                }`} data-testid={`product-price-${product.id}`}>
                  {formatPersianPrice(product.price)} تومان
                </span>
                
                {/* Original Price (crossed out) */}
                {hasDiscount && (
                  <span className={`text-sm line-through ${
                    !product.inStock ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-muted-foreground'
                  }`} data-testid={`product-original-price-${product.id}`}>
                    {formatPersianPrice(product.originalPrice)} تومان
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div>
            {/* Buy Now Button (Primary) */}
            <Button 
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !product.inStock 
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:-translate-y-0.5 hover:shadow-lg'
              }`}
              data-testid={`buy-now-button-${product.id}`}
            >
              {!product.inStock ? (
                'ناموجود'
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  خرید فوری
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={productUrl}>
      <div className={`bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 ${
        !product.inStock ? 'opacity-75 bg-gray-100 dark:bg-gray-800' : ''
      }`} data-testid={`product-card-${product.id}`} dir="rtl">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.title} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              !product.inStock ? 'opacity-60 grayscale' : ''
            }`}
            data-testid={`product-image-${product.id}`}
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              className="bg-white/90 dark:bg-card/90 text-foreground p-2 rounded-full hover:bg-white dark:hover:bg-card transition-colors shadow-lg"
              data-testid={`wishlist-button-${product.id}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge 
                variant="destructive" 
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg"
                data-testid={`sale-badge-${product.id}`}
              >
                {Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)}% تخفیف
              </Badge>
            )}
            {product.featured && (
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg"
                data-testid={`featured-badge-${product.id}`}
              >
                ویژه
              </Badge>
            )}
            {!product.inStock && (
              <Badge 
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg" 
                data-testid={`unavailable-badge-${product.id}`}
              >
                ناموجود
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-3">
            <h3 className={`font-bold text-lg line-clamp-2 mb-2 hover:text-primary transition-colors ${
              !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-foreground'
            }`} data-testid={`product-title-${product.id}`}>
              {product.title}
            </h3>
            

            
            {/* Category */}
            <p className="text-xs text-gray-500 dark:text-muted-foreground" data-testid={`product-category-${product.id}`}>
              {categoryName}
            </p>
          </div>
          
          {/* Featured Features for Featured Products */}
          {product.featured && product.featuredFeatures && product.featuredFeatures.length > 0 && (
            <div className="mb-3" data-testid={`product-featured-features-${product.id}`}>
              <div className="flex flex-wrap gap-1">
                {product.featuredFeatures.slice(0, 2).map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-muted-foreground" data-testid={`product-rating-${product.id}`}>
                ({product.reviewCount || 0} نظر)
              </span>
            </div>
          )}
          
          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Current Price */}
                <span className={`text-lg font-bold ${
                  !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-green-600 dark:text-green-500'
                }`} data-testid={`product-price-${product.id}`}>
                  {formatPersianPrice(product.price)} تومان
                </span>
                
                {/* Original Price (crossed out) */}
                {hasDiscount && (
                  <span className={`text-sm line-through ${
                    !product.inStock ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-muted-foreground'
                  }`} data-testid={`product-original-price-${product.id}`}>
                    {formatPersianPrice(product.originalPrice)} تومان
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div>
            {/* Buy Now Button (Primary) */}
            <Button 
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !product.inStock 
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:-translate-y-0.5 hover:shadow-lg'
              }`}
              data-testid={`buy-now-button-${product.id}`}
            >
              {!product.inStock ? (
                'ناموجود'
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  خرید فوری
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}