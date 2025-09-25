import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ModernSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
}

export function ModernSearchBar({ 
  placeholder = "جستجوی کلمه کلیدی...", 
  onSearch, 
  value 
}: ModernSearchBarProps) {
  const [searchValue, setSearchValue] = useState(value || "");

  // Sync local state with parent value prop changes
  useEffect(() => {
    setSearchValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchValue(query);
    onSearch?.(query);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch?.("");
  };

  return (
    <div className="flex gap-3" dir="rtl" data-testid="modern-search-bar">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10 pl-10 bg-white border-gray-200 shadow-sm focus:shadow-md transition-shadow duration-200 text-right font-vazir"
          dir="rtl"
          data-testid="search-input"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 hover:bg-gray-100 rounded-full"
            data-testid="search-clear"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}