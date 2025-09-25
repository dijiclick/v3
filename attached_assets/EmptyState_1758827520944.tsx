import { Search, FileText } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  type: "search" | "category";
  query?: string;
  onReset?: () => void;
}

export function EmptyState({ type, query, onReset }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        {type === "search" ? (
          <Search className="w-8 h-8 text-gray-400" />
        ) : (
          <FileText className="w-8 h-8 text-gray-400" />
        )}
      </div>
      
      <h3 className="text-gray-900 mb-2">
        {type === "search" ? "No results found" : "No posts in this category"}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {type === "search" 
          ? `We couldn't find any posts matching "${query}". Try adjusting your search terms.`
          : "There are no blog posts available in this category yet. Check back soon!"
        }
      </p>
      
      <Button 
        onClick={onReset}
        variant="outline"
        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200"
      >
        {type === "search" ? "Clear search" : "View all posts"}
      </Button>
    </div>
  );
}