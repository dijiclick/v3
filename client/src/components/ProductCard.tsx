import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { cartManager } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/lib/content-service";

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    cartManager.addItem({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.image || undefined,
    });

    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.title} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const rating = product.rating ? parseFloat(product.rating) : 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  // Render loading state or non-clickable card until we have a valid URL
  if (!productUrl || categoriesLoading) {
    return (
      <div className={`bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group ${
        !product.inStock ? 'opacity-75 bg-gray-100 dark:bg-gray-800' : ''
      }`} data-testid={`product-card-${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"} 
            alt={product.title} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              !product.inStock ? 'opacity-60 grayscale' : ''
            }`}
            data-testid={`product-image-${product.id}`}
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              className="bg-card text-foreground p-2 rounded-full hover:bg-muted transition-colors"
              data-testid={`wishlist-button-${product.id}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-accent' : ''}`} />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="destructive" data-testid={`sale-badge-${product.id}`}>
                Sale
              </Badge>
            )}
            {product.featured && (
              <Badge variant="default" data-testid={`featured-badge-${product.id}`}>
                Featured
              </Badge>
            )}
            {!product.inStock && (
              <Badge 
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 text-sm" 
                data-testid={`unavailable-badge-${product.id}`}
              >
                ناموجود
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <h3 className={`font-semibold line-clamp-2 ${
              !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-foreground'
            }`} data-testid={`product-title-${product.id}`}>
              {product.title}
            </h3>
            {product.categoryId && (
              <p className="text-sm text-muted-foreground" data-testid={`product-category-${product.id}`}>
                Category
              </p>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground" data-testid={`product-rating-${product.id}`}>
              ({product.reviewCount || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${
                !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-primary'
              }`} data-testid={`product-price-${product.id}`}>
                ${product.price}
              </span>
              {product.originalPrice && hasDiscount && (
                <span className={`text-sm line-through ${
                  !product.inStock ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'
                }`} data-testid={`product-original-price-${product.id}`}>
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !product.inStock 
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-60'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              data-testid={`add-to-cart-${product.id}`}
            >
              {product.inStock ? 'Add to Cart' : 'ناموجود'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={productUrl}>
      <div className={`bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer ${
        !product.inStock ? 'opacity-75 bg-gray-100 dark:bg-gray-800' : ''
      }`} data-testid={`product-card-${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"} 
            alt={product.title} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              !product.inStock ? 'opacity-60 grayscale' : ''
            }`}
            data-testid={`product-image-${product.id}`}
          />
          
          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              className="bg-card text-foreground p-2 rounded-full hover:bg-muted transition-colors"
              data-testid={`wishlist-button-${product.id}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-accent' : ''}`} />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="destructive" data-testid={`sale-badge-${product.id}`}>
                Sale
              </Badge>
            )}
            {product.featured && (
              <Badge variant="default" data-testid={`featured-badge-${product.id}`}>
                Featured
              </Badge>
            )}
            {!product.inStock && (
              <Badge 
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 text-sm" 
                data-testid={`unavailable-badge-${product.id}`}
              >
                ناموجود
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <h3 className={`font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-2 ${
              !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-foreground'
            }`} data-testid={`product-title-${product.id}`}>
              {product.title}
            </h3>
            {product.categoryId && (
              <p className="text-sm text-muted-foreground" data-testid={`product-category-${product.id}`}>
                Category
              </p>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground" data-testid={`product-rating-${product.id}`}>
              ({product.reviewCount || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${
                !product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-primary'
              }`} data-testid={`product-price-${product.id}`}>
                ${product.price}
              </span>
              {product.originalPrice && hasDiscount && (
                <span className={`text-sm line-through ${
                  !product.inStock ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'
                }`} data-testid={`product-original-price-${product.id}`}>
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !product.inStock 
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-60'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              data-testid={`add-to-cart-${product.id}`}
            >
              {product.inStock ? 'Add to Cart' : 'ناموجود'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
