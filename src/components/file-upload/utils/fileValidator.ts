
import { toast } from "sonner";
import { getCategoryInfo } from "../fileCategories";

/**
 * Validates a file based on category and returns whether it's valid
 */
export const validateFile = (selectedFile: File, selectedCategory: string): boolean => {
  const categoryInfo = getCategoryInfo(selectedCategory);
    
  if (!categoryInfo) {
    toast.error("Ungültige Kategorie ausgewählt");
    return false;
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
    showFileSelectedToast(selectedFile, categoryInfo.id);
  } else {
    toast.error(`Ungültiger Dateityp für ${categoryInfo.name}. Erwartet wird: ${categoryInfo.expectedType.toUpperCase()}`);
  }
  
  return isValid;
};

/**
 * Display appropriate success toast for selected file
 */
const showFileSelectedToast = (file: File, categoryId: string) => {
  // Extract KW information from filename if it's a scorecard
  if (categoryId === "scorecard") {
    const weekMatch = file.name.match(/KW[_\s]*(\d+)/i);
    if (weekMatch && weekMatch[1]) {
      const extractedWeek = parseInt(weekMatch[1], 10);
      console.log(`Detected KW ${extractedWeek} in filename`);
      toast.success(`Datei "${file.name}" ausgewählt (KW ${extractedWeek})`);
    } else {
      toast.success(`Datei "${file.name}" ausgewählt`);
    }
  } else {
    toast.success(`Datei "${file.name}" ausgewählt`);
  }
};
