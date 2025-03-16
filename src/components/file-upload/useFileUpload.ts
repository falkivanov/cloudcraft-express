
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getCategoryInfo } from "./fileCategories";

export const useFileUpload = (onFileUpload?: (file: File, type: string, category: string) => void) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("scorecard");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    const categoryInfo = getCategoryInfo(selectedCategory);
    
    if (!categoryInfo) {
      toast.error("Ungültige Kategorie ausgewählt");
      return;
    }
    
    // Dateiendung prüfen
    const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    
    // Prüfen, ob die Datei dem erwarteten Typ entspricht
    let isValid = false;
    
    if (categoryInfo.expectedType === "pdf" && fileExtension === ".pdf") {
      isValid = true;
    } else if (categoryInfo.expectedType === "html" && (fileExtension === ".html" || fileExtension === ".htm")) {
      isValid = true;
    } else if (categoryInfo.expectedType === "excel" && (fileExtension === ".xlsx" || fileExtension === ".xls")) {
      isValid = true;
    }
    
    if (isValid) {
      setFile(selectedFile);
      toast.success(`Datei "${selectedFile.name}" ausgewählt`);
    } else {
      toast.error(`Ungültiger Dateityp für ${categoryInfo.name}. Erwartet wird: ${categoryInfo.expectedType.toUpperCase()}`);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (file) {
      const categoryInfo = getCategoryInfo(selectedCategory);
      if (categoryInfo) {
        onFileUpload?.(file, categoryInfo.expectedType, selectedCategory);
        toast.success(`Datei "${file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      toast.error("Bitte wählen Sie zuerst eine Datei aus");
    }
  };

  return {
    selectedCategory,
    file,
    fileInputRef,
    handleCategoryChange,
    validateAndSetFile,
    handleUpload
  };
};
