import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star } from "lucide-react";
import { Link } from "wouter";

interface PopularBlog {
  title: string;
  id: string;
  slug?: string;
}

interface FeaturedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  slug: string;
}

interface ModernSidebarProps {
  popularBlogs: PopularBlog[];
  featuredProducts: FeaturedProduct[];
  hotTags: string[];
  onTagClick?: (tag: string) => void;
}

export function ModernSidebar({ 
  popularBlogs, 
  featuredProducts, 
  hotTags, 
  onTagClick 
}: ModernSidebarProps) {
  return (
    <aside className="space-y-8" dir="rtl" data-testid="modern-sidebar">
      {/* Popular Blogs */}
      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="popular-blogs">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <h3 className="text-gray-900 font-vazir">مطالب محبوب</h3>
        </div>
        <div className="space-y-3">
          {popularBlogs.slice(0, 6).map((blog, index) => (
            <Link
              key={blog.id}
              href={blog.slug ? `/blog/${blog.slug}` : "#"}
              className="group flex items-start gap-3 text-sm text-gray-600 hover:text-gray-900 leading-relaxed transition-colors duration-200"
              data-testid={`popular-blog-${blog.id}`}
            >
              <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 text-xs rounded-full flex items-center justify-center mt-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors duration-200 font-vazir">
                {(index + 1).toLocaleString('fa-IR')}
              </span>
              <span className="line-clamp-2 font-vazir">{blog.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="featured-products">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-red-500" />
          <h3 className="text-gray-900 font-vazir">محصولات ویژه</h3>
        </div>
        <div className="space-y-4">
          {featuredProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-vazir line-clamp-1">
                      {product.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-vazir font-medium">
                        {product.price.toLocaleString('fa-IR')} تومان
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through font-vazir">
                          {product.originalPrice.toLocaleString('fa-IR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/products/${product.slug}`}>
                <Button 
                  variant="link" 
                  className="text-red-500 hover:text-red-600 text-xs p-0 h-auto mr-13 font-vazir"
                  data-testid={`featured-product-link-${product.id}`}
                >
                  مشاهده محصول ←
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Tags */}
      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="hot-tags">
        <h3 className="mb-4 text-gray-900 font-vazir">برچسب‌های داغ</h3>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-all duration-200 hover:scale-105 font-vazir"
              onClick={() => onTagClick?.(tag)}
              data-testid={`hot-tag-${tag}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
}