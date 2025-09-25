import { Link } from "wouter";
import { Calendar, Clock, User, Tag, Eye } from "lucide-react";
import { BlogPost } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { sanitizeImageUrl } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
  showExcerpt?: boolean;
  className?: string;
}

export default function BlogCard({ post, showExcerpt = true, className = "" }: BlogCardProps) {
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
    return minutes === 1 ? "۱ دقیقه" : `${minutes} دقیقه`;
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-card ${className}`} dir="rtl" data-testid={`blog-card-${post.id}`}>
      {/* Featured Image with URL sanitization */}
      {sanitizeImageUrl(post.featuredImage) && (
        <div className="relative overflow-hidden rounded-t-lg aspect-[16/10]">
          <img 
            src={sanitizeImageUrl(post.featuredImage)} 
            alt={post.featuredImageAlt || post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fallback to original URL if sanitized URL fails
              const target = e.target as HTMLImageElement;
              if (target.src !== post.featuredImage && post.featuredImage) {
                target.src = post.featuredImage;
              }
            }}
          />
          
          {/* Featured Badge */}
          {post.featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                ⭐ ویژه
              </Badge>
            </div>
          )}
          
          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="outline" 
                className="bg-white/90 backdrop-blur-sm border-white/20"
                style={{ backgroundColor: post.category.color ? `${post.category.color}20` : undefined }}
              >
                {post.category.name}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-4">
        {/* Title */}
        <Link href={`/blog/${post.slug}`} data-testid={`blog-link-${post.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </Link>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground mt-3">
          {/* Author */}
          {post.author && (
            <Link href={`/blog/author/${post.author.slug}`} data-testid={`author-link-${post.author.slug}`}>
              <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {getAuthorInitials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
                <span data-testid={`author-${post.author.name}`}>{post.author.name}</span>
              </div>
            </Link>
          )}

          {/* Publication Date */}
          {post.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt.toString()} data-testid={`date-${post.id}`}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          )}

          {/* Reading Time */}
          {post.readingTime !== null && post.readingTime !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span data-testid={`reading-time-${post.id}`}>{formatReadingTime(post.readingTime)}</span>
            </div>
          )}

          {/* View Count */}
          {post.viewCount !== null && post.viewCount !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span data-testid={`view-count-${post.id}`}>{post.viewCount.toLocaleString('fa-IR')}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Excerpt */}
        {showExcerpt && post.excerpt && (
          <p className="text-gray-600 dark:text-muted-foreground line-clamp-3 leading-relaxed mb-4" data-testid={`excerpt-${post.id}`}>
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Link key={index} href={`/blog/tag/${tag}`} data-testid={`tag-link-${tag}`}>
                <Badge variant="secondary" className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              </Link>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} بیشتر
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100 dark:border-border">
        <Link href={`/blog/${post.slug}`} className="w-full" data-testid={`read-more-${post.slug}`}>
          <Button variant="outline" className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950 transition-colors">
            مطالعه بیشتر
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}