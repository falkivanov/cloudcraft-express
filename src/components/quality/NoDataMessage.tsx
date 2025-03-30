
import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, AlertCircle, FileSearch, FileCog, UserSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NoDataMessageProps {
  category: string;
  className?: string;
  customMessage?: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ 
  category, 
  className,
  customMessage 
}) => {
  // Define different styles based on category
  const getCategoryStyles = () => {
    switch(category.toLowerCase()) {
      case 'scorecard':
        return {
          icon: <FileSearch className="h-12 w-12 text-blue-500 mb-2" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700"
        };
      case 'concessions':
        return {
          icon: <FileCog className="h-12 w-12 text-orange-500 mb-2" />,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-700"
        };
      case 'customer contact':
      case 'customer-contact':
        return {
          icon: <AlertCircle className="h-12 w-12 text-green-500 mb-2" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700"
        };
      case 'mentor':
        return {
          icon: <UserSearch className="h-12 w-12 text-purple-500 mb-2" />,
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          textColor: "text-purple-700"
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-gray-500 mb-2" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700"
        };
    }
  };

  const styles = getCategoryStyles();
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className={cn(
      "p-6 rounded-lg border-2 text-center shadow-sm", 
      styles.bgColor, 
      styles.borderColor,
      className
    )}>
      <div className="flex justify-center">
        {styles.icon}
      </div>
      <p className={cn("text-lg font-medium mb-3", styles.textColor)}>
        Keine {displayCategory}-Daten verfügbar
      </p>
      <p className="text-muted-foreground mb-4">
        {customMessage || "Bitte laden Sie zuerst eine Datei hoch, um die Daten hier anzuzeigen."}
      </p>
      <Button asChild>
        <Link to="/file-upload" className="flex items-center gap-2">
          <UploadIcon className="h-4 w-4" />
          <span>Zur Upload-Seite</span>
        </Link>
      </Button>
    </div>
  );
};

export default NoDataMessage;
