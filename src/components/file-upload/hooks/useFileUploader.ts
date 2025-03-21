
import { toast } from "sonner";
import { getCategoryInfo } from "../fileCategories";
import { processScorecardPDF } from "../processors/scorecardProcessor";
import { processCustomerContactHTML } from "../processors/customerContactProcessor";

/**
 * Process the file upload based on category
 */
export const handleFileUpload = async (
  file: File,
  selectedCategory: string,
  onFileUpload?: (file: File, type: string, category: string) => void,
  setProcessing?: (value: boolean) => void
): Promise<boolean> => {
  if (!file) {
    toast.error("Bitte wählen Sie zuerst eine Datei aus");
    return false;
  }
  
  const categoryInfo = getCategoryInfo(selectedCategory);
  if (!categoryInfo) {
    toast.error("Ungültige Kategorie ausgewählt");
    return false;
  }
  
  if (setProcessing) setProcessing(true);
  
  try {
    // Process different file types
    switch (categoryInfo.id) {
      case "scorecard":
        if (categoryInfo.expectedType === "pdf") {
          await processScorecardPDF(file, onFileUpload);
        }
        break;
        
      case "customerContact":
        if (categoryInfo.expectedType === "html") {
          await processCustomerContactHTML(file, onFileUpload);
        }
        break;
        
      default:
        // Default processing for other file types
        if (onFileUpload) {
          onFileUpload(file, categoryInfo.expectedType, selectedCategory);
          
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
        }
    }
    
    return true;
  } catch (error) {
    console.error("Error processing file:", error);
    let errorMessage = 'Unbekannter Fehler';
    
    if (error instanceof Error) {
      errorMessage = `Fehler beim Verarbeiten der Datei: ${error.message}`;
    }
    
    toast.error(errorMessage);
    return false;
  } finally {
    if (setProcessing) setProcessing(false);
  }
};
