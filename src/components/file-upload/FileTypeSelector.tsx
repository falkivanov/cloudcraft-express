
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fileCategories } from "./fileCategories";

interface FileCategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const FileCategorySelector: React.FC<FileCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Dateikategorie</label>
      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Kategorie auswählen" />
        </SelectTrigger>
        <SelectContent>
          {fileCategories.map(category => (
            <SelectItem key={category.id} value={category.id} className="flex items-center">
              <div className="flex items-center gap-2">
                {React.createElement(category.icon, { className: "h-4 w-4" })}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FileCategorySelector;
