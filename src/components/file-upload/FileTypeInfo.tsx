
import React from "react";
import { getCategoryInfo } from "./fileCategories";

interface FileTypeInfoProps {
  category?: string;
}

const FileTypeInfo: React.FC<FileTypeInfoProps> = ({ category }) => {
  if (!category) return null;
  
  const categoryInfo = getCategoryInfo(category);
  
  if (!categoryInfo) return null;

  return (
    <div className="p-4 rounded-lg bg-muted">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
        {React.createElement(categoryInfo.icon, { className: "h-4 w-4" })}
        {categoryInfo.name}
      </h3>
      <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
    </div>
  );
};

export default FileTypeInfo;
