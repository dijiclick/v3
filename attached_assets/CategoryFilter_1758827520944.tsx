import { Badge } from "./ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={selectedCategory === null ? "default" : "secondary"}
        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
          selectedCategory === null 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        onClick={() => onCategorySelect(null)}
      >
        All Posts
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "secondary"}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedCategory === category 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => onCategorySelect(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}