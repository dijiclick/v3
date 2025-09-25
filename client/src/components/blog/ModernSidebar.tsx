import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newsletter } from "./Newsletter";
import { TrendingUp, Star } from "lucide-react";
import { Link } from "wouter";

interface PopularBlog {
  title: string;
  id: string;
  slug?: string;
}

interface SubscriptionService {
  name: string;
  color: string;
  textColor?: string;
}

interface ModernSidebarProps {
  popularBlogs: PopularBlog[];
  subscriptionServices: SubscriptionService[];
  hotTags: string[];
  onTagClick?: (tag: string) => void;
}

export function ModernSidebar({ 
  popularBlogs, 
  subscriptionServices, 
  hotTags, 
  onTagClick 
}: ModernSidebarProps) {
  return (
    <aside className="space-y-8" dir="rtl" data-testid="modern-sidebar">
      {/* Newsletter */}
      <Newsletter />

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

      {/* Popular Subscriptions */}
      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="popular-subscriptions">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-red-500" />
          <h3 className="text-gray-900 font-vazir">اشتراک‌های محبوب</h3>
        </div>
        <div className="space-y-4">
          {subscriptionServices.map((service) => (
            <div key={service.name} className="group">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.color} shadow-sm group-hover:shadow-md transition-shadow duration-200`}
                >
                  <span className={`text-sm font-medium ${service.textColor || 'text-white'} font-vazir`}>
                    {service.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-vazir">{service.name}</span>
              </div>
              <Button 
                variant="link" 
                className="text-red-500 hover:text-red-600 text-xs p-0 h-auto mr-13 font-vazir"
              >
                مشاهده جزئیات ←
              </Button>
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