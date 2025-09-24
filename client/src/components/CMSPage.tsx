import { useQuery } from "@tanstack/react-query";
import { Loader, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import type { Page } from "@shared/schema";

interface CMSPageProps {
  slug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  className?: string;
  children?: React.ReactNode | ((page: Page) => React.ReactNode); // For custom layout around CMS content
}

interface CMSContentRendererProps {
  content: any;
  className?: string;
}

// Component to render CMS content (JSON or HTML)
const CMSContentRenderer: React.FC<CMSContentRendererProps> = ({ content, className = "" }) => {
  if (!content) {
    return <div className={className}>No content available</div>;
  }

  // If content is a string (HTML or markdown), render it directly
  if (typeof content === 'string') {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // If content is an object (structured JSON), render it as sections
  if (typeof content === 'object') {
    return (
      <div className={className}>
        {Array.isArray(content) ? (
          content.map((section, index) => (
            <div key={index} className="mb-8">
              {section.type === 'heading' && (
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {section.text}
                </h2>
              )}
              {section.type === 'paragraph' && (
                <p className="text-gray-600 leading-relaxed mb-4">
                  {section.text}
                </p>
              )}
              {section.type === 'html' && (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
            </div>
          ))
        ) : (
          // Handle object content with properties
          <div>
            {content.title && (
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {content.title}
              </h2>
            )}
            {content.description && (
              <p className="text-lg text-gray-600 mb-8">
                {content.description}
              </p>
            )}
            {content.body && (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback for other content types
  return (
    <div className={className}>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

export default function CMSPage({ 
  slug, 
  fallbackTitle, 
  fallbackDescription,
  className = "",
  children 
}: CMSPageProps) {
  // Fetch page content by slug
  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages/slug', slug],
  });

  // Set SEO data from CMS or fallbacks
  useSEO({
    title: page?.seoTitle || page?.title || fallbackTitle || "Page",
    description: page?.seoDescription || page?.excerpt || fallbackDescription || "",
    keywords: page?.seoKeywords?.join(", ") || ""
  });

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader className="mx-auto h-8 w-8 text-blue-500 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading content...
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch the page content.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-600 mb-2">
              Content not found
            </h3>
            <p className="text-gray-500 mb-4">
              {error ? 
                `Error loading content: ${(error as Error).message}` : 
                `Page with slug "${slug}" not found.`
              }
            </p>
            {fallbackTitle && (
              <p className="text-sm text-gray-400">
                Expected page: {fallbackTitle}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show published pages (unless in admin context)
  if (page.status !== 'published') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-yellow-600 mb-2">
              Page not available
            </h3>
            <p className="text-gray-500">
              This page is currently in draft mode and not publicly available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render page content
  return (
    <div className={className} data-testid={`cms-page-${slug}`}>
      {children ? (
        // Custom layout provided
        <>
          {typeof children === 'function' ? 
            (children as (page: Page) => React.ReactNode)(page) : 
            children
          }
          
          {/* Main content area */}
          <div className="cms-content">
            {page.title && !children && (
              <h1 className="text-4xl font-bold text-gray-800 mb-6" data-testid="page-title">
                {page.title}
              </h1>
            )}
            
            {page.excerpt && !children && (
              <p className="text-lg text-gray-600 mb-8" data-testid="page-excerpt">
                {page.excerpt}
              </p>
            )}
            
            {page.content && (
              <div className="cms-content-body">
                <CMSContentRenderer 
                  content={page.content} 
                  className=""
                />
              </div>
            )}
          </div>
        </>
      ) : (
        // Default layout
        <div className="max-w-4xl mx-auto px-6 py-12">
          {page.featuredImage && (
            <img 
              src={page.featuredImage} 
              alt={page.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
              data-testid="featured-image"
            />
          )}
          
          <h1 className="text-4xl font-bold text-gray-800 mb-6" data-testid="page-title">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <p className="text-lg text-gray-600 mb-8" data-testid="page-excerpt">
              {page.excerpt}
            </p>
          )}
          
          {page.content && (
            <div className="cms-content-body">
              <CMSContentRenderer 
                content={page.content} 
                className=""
              />
            </div>
          )}
          
          {/* Page metadata */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {page.createdAt && (
                <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
              )}
              {page.updatedAt && page.createdAt && <span>•</span>}
              {page.updatedAt && (
                <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}