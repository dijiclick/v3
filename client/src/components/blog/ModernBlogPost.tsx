import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Calendar } from "lucide-react";
import { Link } from "wouter";
import { BlogPost } from "@/types";

// Import blog images
import reactImage from "@assets/stock_images/react_javascript_pro_4fe483cb.jpg";
import cssGridImage from "@assets/stock_images/css_grid_layout_web__ab23a733.jpg";
import typescriptImage from "@assets/stock_images/typescript_programmi_1af42510.jpg";
import webTechImage from "@assets/stock_images/web_technology_futur_6769e898.jpg";

interface ModernBlogPostProps {
  post: BlogPost;
}

export function ModernBlogPost({ post }: ModernBlogPostProps) {
  // Map blog post IDs to their corresponding images
  const getPostImage = (postId: string, featuredImage?: string | null) => {
    const imageMap: { [key: string]: string } = {
      'post-1': reactImage,       // React.js آموزش
      'post-2': cssGridImage,     // CSS Grid طراحی
      'post-3': typescriptImage,  // TypeScript معرفی
      'post-4': webTechImage,     // فناوری آینده
    };

    // Use mapped image if available, otherwise use featuredImage or fallback
    return imageMap[postId] || featuredImage || reactImage;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return "";
    return minutes === 1 ? "۱ دقیقه" : `${minutes.toLocaleString('fa-IR')} دقیقه`;
  };

  const formatViews = (views: number | null) => {
    if (!views) return "";
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`.replace('.', ',');
    }
    return views.toLocaleString('fa-IR');
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <article 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" 
      dir="rtl"
      data-testid={`modern-blog-post-${post.id}`}
    >
      {/* Featured Image */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={getPostImage(post.id, post.featuredImage)}
          alt={post.featuredImageAlt || post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = reactImage; // Fallback to React image instead of broken placeholder
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        {post.category && (
          <Badge 
            className="absolute top-3 right-3 text-white border-0 bg-red-500 shadow-lg font-vazir"
            data-testid={`category-${post.category.slug}`}
          >
            {post.category.name}
          </Badge>
        )}
        
        {/* Views Badge */}
        {post.viewCount && post.viewCount > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <Eye className="w-3 h-3" />
            <span className="font-vazir">{formatViews(post.viewCount)}</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="mb-3 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors duration-200 font-vazir text-lg font-semibold">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-vazir">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.author?.avatar || undefined} alt={post.author?.name || "نویسنده"} />
              <AvatarFallback className="bg-red-500 text-white text-sm font-vazir">
                {post.author ? getAuthorInitials(post.author.name) : "ن"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-vazir">{post.author?.name || "نام نویسنده"}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-vazir">{formatDate(post.publishedAt)}</span>
                  </div>
                )}
                {post.readingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-vazir">{formatReadingTime(post.readingTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}