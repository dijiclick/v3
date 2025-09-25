import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface ModernCategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categorySlug: string | null) => void;
}

export function ModernCategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: ModernCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6" dir="rtl" data-testid="modern-category-filter">
      <Badge
        variant={selectedCategory === null ? "default" : "secondary"}
        className={`cursor-pointer transition-all duration-200 hover:scale-105 font-vazir ${
          selectedCategory === null 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        onClick={() => onCategorySelect(null)}
        data-testid="category-all"
      >
        همه مطالب
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.slug ? "default" : "secondary"}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 font-vazir ${
            selectedCategory === category.slug 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => onCategorySelect(category.slug)}
          data-testid={`category-${category.slug}`}
          style={
            selectedCategory === category.slug && category.color
              ? { backgroundColor: category.color }
              : {}
          }
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
}