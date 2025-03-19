
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
      
      // Extract KW information from filename if it's a scorecard
      if (categoryInfo.id === "scorecard") {
        const weekMatch = selectedFile.name.match(/KW[_\s]*(\d+)/i);
        if (weekMatch && weekMatch[1]) {
          const extractedWeek = parseInt(weekMatch[1], 10);
          console.log(`Detected KW ${extractedWeek} in filename`);
          toast.success(`Datei "${selectedFile.name}" ausgewählt (KW ${extractedWeek})`);
        } else {
          toast.success(`Datei "${selectedFile.name}" ausgewählt`);
        }
      } else {
        toast.success(`Datei "${selectedFile.name}" ausgewählt`);
      }
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
        
        // Show different toast messages based on category
        if (categoryInfo.id === "scorecard") {
          const weekMatch = file.name.match(/KW[_\s]*(\d+)/i);
          if (weekMatch && weekMatch[1]) {
            const extractedWeek = parseInt(weekMatch[1], 10);
            toast.success(`Scorecard für KW ${extractedWeek} erfolgreich hochgeladen`, {
              description: "Die Woche wurde automatisch erkannt und zugeordnet."
            });
          } else {
            toast.success(`Datei "${file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
          }
        } else {
          toast.success(`Datei "${file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
        }
        
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
