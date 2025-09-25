import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Newsletter } from "./Newsletter";
import { TrendingUp, Star } from "lucide-react";

interface PopularBlog {
  title: string;
  id: string;
}

interface SubscriptionService {
  name: string;
  color: string;
  textColor?: string;
}

interface SidebarProps {
  popularBlogs: PopularBlog[];
  subscriptionServices: SubscriptionService[];
  hotTags: string[];
  onTagClick?: (tag: string) => void;
}

export function Sidebar({ popularBlogs, subscriptionServices, hotTags, onTagClick }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Newsletter */}
      <Newsletter />

      {/* Popular Blogs */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <h3 className="text-gray-900">Popular blogs</h3>
        </div>
        <div className="space-y-3">
          {popularBlogs.slice(0, 6).map((blog, index) => (
            <a
              key={blog.id}
              href="#"
              className="group flex items-start gap-3 text-sm text-gray-600 hover:text-gray-900 leading-relaxed transition-colors duration-200"
            >
              <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 text-xs rounded-full flex items-center justify-center mt-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors duration-200">
                {index + 1}
              </span>
              <span className="line-clamp-2">{blog.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Popular Subscriptions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-red-500" />
          <h3 className="text-gray-900">Popular subscriptions</h3>
        </div>
        <div className="space-y-4">
          {subscriptionServices.map((service) => (
            <div key={service.name} className="group">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.color} shadow-sm group-hover:shadow-md transition-shadow duration-200`}
                >
                  <span className={`text-sm font-medium ${service.textColor || 'text-white'}`}>
                    {service.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">{service.name}</span>
              </div>
              <Button 
                variant="link" 
                className="text-red-500 hover:text-red-600 text-xs p-0 h-auto ml-13"
              >
                View details →
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Tags */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="mb-4 text-gray-900">Hot Tags</h3>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={() => onTagClick?.(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
}