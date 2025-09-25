import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
}

export function SearchBar({ placeholder = "Please enter keyword search", onSearch, value }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(value || "");

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
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-white border-gray-200 shadow-sm focus:shadow-md transition-shadow duration-200"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}