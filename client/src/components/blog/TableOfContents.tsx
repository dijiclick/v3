import { useState, useEffect, useRef } from "react";
import { List, ChevronDown, ChevronUp, Hash, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface TableOfContentsProps {
  content?: any; // Blog post content
  className?: string;
  sticky?: boolean;
  collapsible?: boolean;
  showOnMobile?: boolean;
  maxLevel?: number; // Maximum heading level to include (1-6)
  minItems?: number; // Minimum number of headings to show TOC
}

export default function TableOfContents({
  content,
  className,
  sticky = true,
  collapsible = true,
  showOnMobile = false,
  maxLevel = 4,
  minItems = 3
}: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate TOC from page headings
  useEffect(() => {
    const generateTOC = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const items: TOCItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        
        // Skip if level exceeds maxLevel
        if (level > maxLevel) return;

        // Create or use existing ID
        let id = heading.id;
        if (!id) {
          id = `heading-${index}`;
          heading.id = id;
        }

        items.push({
          id,
          text: heading.textContent || '',
          level,
          element: heading as HTMLElement
        });
      });

      setTocItems(items);
    };

    // Generate TOC after a short delay to ensure content is rendered
    const timer = setTimeout(generateTOC, 500);
    
    // Also listen for content changes
    window.addEventListener('load', generateTOC);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', generateTOC);
    };
  }, [content, maxLevel]);

  // Setup intersection observer for active section tracking
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observerOptions = {
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all heading elements
    tocItems.forEach((item) => {
      if (item.element) {
        observerRef.current?.observe(item.element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tocItems]);

  // Handle scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update active state immediately for better UX
      setActiveId(id);
    }
  };

  // Don't render if not enough items
  if (tocItems.length < minItems) {
    return null;
  }

  const TOCList = () => (
    <nav aria-label="فهرست مطالب" data-testid="table-of-contents-nav">
      <ScrollArea className="h-full max-h-96">
        <ul className="space-y-1" dir="rtl">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "w-full text-right px-2 py-1 text-sm rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                  item.level === 1 && "font-semibold text-gray-900 dark:text-gray-100",
                  item.level === 2 && "font-medium text-gray-800 dark:text-gray-200 pr-4",
                  item.level === 3 && "text-gray-700 dark:text-gray-300 pr-6",
                  item.level >= 4 && "text-gray-600 dark:text-gray-400 pr-8",
                  activeId === item.id && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                )}
                data-testid={`toc-item-${item.id}`}
              >
                <div className="flex items-center justify-between group">
                  <span className="line-clamp-2 leading-snug">{item.text}</span>
                  <Hash className={cn(
                    "w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0 mr-2",
                    activeId === item.id && "opacity-70"
                  )} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );

  return (
    <div className={cn(
      "toc-container",
      sticky && "sticky top-16",
      !showOnMobile && "hidden lg:block",
      className
    )}>
      <Card 
        className={cn(
          "transition-all duration-300",
          isCollapsed && "pb-0"
        )}
        data-testid="table-of-contents"
      >
        <CardHeader className={cn(
          "pb-2",
          !collapsible && "pb-3"
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-reverse space-x-2 text-base">
              <List className="w-4 h-4 text-blue-500" />
              <span>فهرست مطالب</span>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {tocItems.length}
              </span>
            </CardTitle>
            
            <div className="flex items-center space-x-reverse space-x-1">
              {collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-6 w-6 p-0"
                  data-testid="toc-collapse-button"
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="h-6 w-6 p-0"
                data-testid="toc-visibility-button"
              >
                {isVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isCollapsed && isVisible && (
          <CardContent className="pt-0">
            <TOCList />
          </CardContent>
        )}
      </Card>

      {/* Progress indicator */}
      {isVisible && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 text-center mb-1">
            پیشرفت مطالعه
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${tocItems.length > 0 ? 
                  ((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length) * 100 : 0
                }%` 
              }}
              data-testid="toc-progress-bar"
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {tocItems.length > 0 && activeId ? (
              `${tocItems.findIndex(item => item.id === activeId) + 1} از ${tocItems.length} بخش`
            ) : (
              `0 از ${tocItems.length} بخش`
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for using TOC functionality in other components
export function useTableOfContents(options: {
  maxLevel?: number;
  minItems?: number;
} = {}) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const { maxLevel = 4, minItems = 3 } = options;
    
    const generateTOC = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const items: TOCItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        
        if (level > maxLevel) return;

        let id = heading.id;
        if (!id) {
          id = `heading-${index}`;
          heading.id = id;
        }

        items.push({
          id,
          text: heading.textContent || '',
          level,
          element: heading as HTMLElement
        });
      });

      if (items.length >= minItems) {
        setTocItems(items);
      }
    };

    const timer = setTimeout(generateTOC, 500);
    return () => clearTimeout(timer);
  }, [options]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setActiveId(id);
    }
  };

  return {
    tocItems,
    activeId,
    scrollToSection
  };
}