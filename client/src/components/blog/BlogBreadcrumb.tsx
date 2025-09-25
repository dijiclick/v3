import { Link } from "wouter";
import { ChevronRight, Home, FileText, Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BlogBreadcrumbProps {
  slug?: string;
  customBreadcrumbs?: BreadcrumbItem[];
  className?: string;
}

interface BreadcrumbResponse {
  breadcrumbs: BreadcrumbItem[];
}

export default function BlogBreadcrumb({ slug, customBreadcrumbs, className }: BlogBreadcrumbProps) {
  // Fetch breadcrumb data from API if slug is provided
  const { data: breadcrumbData } = useQuery<BreadcrumbResponse>({
    queryKey: ['/api/blog/breadcrumb', slug],
    enabled: Boolean(slug && !customBreadcrumbs),
  });

  // Use custom breadcrumbs or fetched data
  const breadcrumbs = customBreadcrumbs || breadcrumbData?.breadcrumbs || [];

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  const getIcon = (index: number, item: BreadcrumbItem) => {
    if (index === 0) return <Home className="w-4 h-4" />;
    if (item.href.includes('/blog/category/')) return <Folder className="w-4 h-4" />;
    if (item.href.includes('/blog/')) return <FileText className="w-4 h-4" />;
    return null;
  };

  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400", className)}
      aria-label="نوار ناوبری breadcrumb"
      data-testid="blog-breadcrumb"
      dir="rtl"
    >
      <ol className="flex items-center space-x-reverse space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {/* Show separator for non-first items */}
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400 dark:text-gray-600 rotate-180" />
            )}
            
            <div className="flex items-center space-x-reverse space-x-1">
              {getIcon(index, item)}
              
              {item.current ? (
                <span 
                  className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]"
                  data-testid={`breadcrumb-current-${index}`}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px]"
                  data-testid={`breadcrumb-link-${index}`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Pre-built breadcrumb configurations for common pages
export const BlogBreadcrumbs = {
  // Home page breadcrumb
  home: (): BreadcrumbItem[] => [
    { label: "خانه", href: "/", current: true }
  ],
  
  // Blog list page breadcrumb
  blogList: (): BreadcrumbItem[] => [
    { label: "خانه", href: "/" },
    { label: "وبلاگ", href: "/blog", current: true }
  ],
  
  // Blog category page breadcrumb
  category: (categoryName: string, categorySlug: string): BreadcrumbItem[] => [
    { label: "خانه", href: "/" },
    { label: "وبلاگ", href: "/blog" },
    { label: categoryName, href: `/blog/category/${categorySlug}`, current: true }
  ],
  
  // Blog tag page breadcrumb
  tag: (tagName: string, tagSlug: string): BreadcrumbItem[] => [
    { label: "خانه", href: "/" },
    { label: "وبلاگ", href: "/blog" },
    { label: `برچسب: ${tagName}`, href: `/blog/tag/${tagSlug}`, current: true }
  ],
  
  // Blog author page breadcrumb
  author: (authorName: string, authorSlug: string): BreadcrumbItem[] => [
    { label: "خانه", href: "/" },
    { label: "وبلاگ", href: "/blog" },
    { label: `نویسنده: ${authorName}`, href: `/blog/author/${authorSlug}`, current: true }
  ],
  
  // Blog archive page breadcrumb
  archive: (): BreadcrumbItem[] => [
    { label: "خانه", href: "/" },
    { label: "وبلاگ", href: "/blog" },
    { label: "آرشیو مطالب", href: "/blog/archive", current: true }
  ],
  
  // Blog search results breadcrumb
  search: (query: string): BreadcrumbItem[] => [
    { label: "خانه", href: "/" },
    { label: "وبلاگ", href: "/blog" },
    { label: `جستجو: ${query}`, href: `/blog/search?q=${encodeURIComponent(query)}`, current: true }
  ]
};