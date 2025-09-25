import { cn } from "@/lib/utils";

interface BlogContentRendererProps {
  content: any;
  className?: string;
  isPreview?: boolean;
}

// Persian/Farsi text detection helper
const detectPersianText = (text: string): boolean => {
  const persianRegex = /[\u0600-\u06FF\u200C\u200D]/;
  return persianRegex.test(text);
};

// Sanitize HTML content to prevent XSS attacks
const sanitizeHTML = (html: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Component to render blog post content with enhanced features
const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ 
  content, 
  className = "", 
  isPreview = false 
}) => {
  if (!content) {
    return (
      <div className={cn("text-gray-500 dark:text-gray-400 italic text-center py-8", className)}>
        {isPreview ? "پیش‌نمایش محتوا در اینجا نمایش داده می‌شود..." : "محتوای این مطلب موجود نیست."}
      </div>
    );
  }

  // If content is a string (HTML or markdown), render it directly
  if (typeof content === 'string') {
    const sanitizedContent = sanitizeHTML(content);
    const isRTL = detectPersianText(sanitizedContent);
    
    return (
      <div 
        className={cn(
          "blog-content prose prose-lg max-w-none",
          // Light mode styles
          "prose-headings:text-gray-900 prose-headings:font-bold",
          "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4",
          "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors",
          "prose-strong:text-gray-900 prose-strong:font-semibold",
          "prose-em:text-gray-800 prose-em:italic",
          "prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-700",
          "prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6",
          "prose-li:mb-2 prose-li:text-gray-700",
          "prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full",
          "prose-hr:border-gray-300 prose-hr:my-8",
          "prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-gray-300",
          "prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:font-semibold prose-th:text-left",
          "prose-td:border prose-td:border-gray-300 prose-td:p-3",
          // Dark mode styles
          "dark:prose-headings:text-white",
          "dark:prose-p:text-gray-300",
          "dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300",
          "dark:prose-strong:text-white",
          "dark:prose-em:text-gray-200",
          "dark:prose-code:bg-gray-800 dark:prose-code:text-gray-200",
          "dark:prose-pre:bg-gray-800",
          "dark:prose-blockquote:border-blue-400 dark:prose-blockquote:bg-blue-900/20 dark:prose-blockquote:text-gray-300",
          "dark:prose-li:text-gray-300",
          "dark:prose-hr:border-gray-600",
          "dark:prose-th:border-gray-600 dark:prose-th:bg-gray-800 dark:prose-th:text-gray-200",
          "dark:prose-td:border-gray-600 dark:prose-td:text-gray-300",
          "dark:prose-table:border-gray-600",
          // Persian/RTL specific styles
          isRTL && "text-right font-persian",
          // Preview specific styles
          isPreview && "border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50",
          className
        )}
        dir={isRTL ? "rtl" : "ltr"}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        data-testid="blog-content-html"
      />
    );
  }

  // If content is an object (structured JSON), render it as sections
  if (typeof content === 'object') {
    const isRTL = detectPersianText(JSON.stringify(content));
    
    return (
      <div 
        className={cn(
          "blog-content prose prose-lg max-w-none",
          "prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold",
          "prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed",
          isRTL && "text-right font-persian",
          isPreview && "border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50",
          className
        )} 
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="blog-content-structured"
      >
        {Array.isArray(content) ? (
          content.map((section, index) => (
            <div key={index} className="mb-8">
              {section.type === 'heading' && (
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b-2 border-blue-100 dark:border-blue-800 pb-3">
                  {section.text}
                </h2>
              )}
              {section.type === 'paragraph' && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                  {section.text}
                </p>
              )}
              {section.type === 'html' && (
                <div 
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content) }} 
                  className="mb-6"
                />
              )}
              {section.type === 'image' && (
                <figure className="my-8">
                  <img 
                    src={section.url} 
                    alt={section.alt || ''} 
                    className="w-full rounded-lg shadow-md mx-auto"
                    loading="lazy"
                  />
                  {section.caption && (
                    <figcaption className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3 italic">
                      {section.caption}
                    </figcaption>
                  )}
                </figure>
              )}
              {section.type === 'callout' && (
                <div className={cn(
                  "p-6 rounded-lg border-l-4 my-8 shadow-sm",
                  section.calloutType === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500' :
                  section.calloutType === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500' :
                  section.calloutType === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                )}>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-lg">
                      {section.calloutType === 'warning' ? '⚠️' :
                       section.calloutType === 'error' ? '❌' :
                       section.calloutType === 'success' ? '✅' :
                       'ℹ️'}
                    </span>
                    {section.calloutType === 'warning' ? 'هشدار' :
                     section.calloutType === 'error' ? 'خطا' :
                     section.calloutType === 'success' ? 'موفقیت' :
                     'نکته'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.text}</div>
                </div>
              )}
              {section.type === 'quote' && (
                <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-6 py-2 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-r-lg my-6">
                  <p className="mb-2">{section.text}</p>
                  {section.author && (
                    <cite className="text-sm font-medium text-gray-500 dark:text-gray-500">
                      — {section.author}
                    </cite>
                  )}
                </blockquote>
              )}
              {section.type === 'code' && (
                <div className="my-6">
                  {section.language && (
                    <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono rounded-t-lg">
                      {section.language}
                    </div>
                  )}
                  <pre className={cn(
                    "bg-gray-900 text-gray-100 p-4 overflow-x-auto font-mono text-sm",
                    section.language ? "rounded-b-lg" : "rounded-lg"
                  )}>
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}
              {section.type === 'list' && (
                <div className="my-6">
                  {section.listType === 'ordered' ? (
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {section.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="leading-relaxed">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {section.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          // Handle object content with properties
          <div>
            {content.title && (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {content.title}
              </h2>
            )}
            {content.description && (
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {content.description}
              </p>
            )}
            {content.body && (
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.body) }} 
                className="prose-content"
              />
            )}
            {content.html && (
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.html) }} 
                className="prose-content"
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback for other content types
  return (
    <div className={cn("blog-content", className, isPreview && "border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50")}>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto" dir="ltr">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
          محتوای JSON خام:
        </div>
        <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default BlogContentRenderer;

// Export additional utility functions that might be useful
export { detectPersianText, sanitizeHTML };

// Enhanced styles for blog content - can be imported separately if needed
export const blogContentStyles = {
  // Persian typography classes
  persian: "font-persian text-right",
  
  // Content spacing classes
  spacing: "space-y-6",
  
  // Enhanced prose classes for better reading experience
  enhancedProse: [
    "prose-lg max-w-none",
    "prose-headings:font-bold prose-headings:tracking-tight",
    "prose-h1:text-4xl prose-h1:mb-6",
    "prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8",
    "prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6",
    "prose-p:leading-relaxed prose-p:mb-4",
    "prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto",
    "prose-blockquote:text-xl prose-blockquote:font-medium prose-blockquote:italic",
    "prose-code:font-mono prose-code:text-sm",
    "prose-pre:font-mono prose-pre:text-sm"
  ].join(" ")
};