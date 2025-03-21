
import { toast } from "sonner";

/**
 * Process a customer contact HTML file
 */
export const processCustomerContactHTML = (
  file: File,
  onFileUpload?: (file: File, type: string, category: string) => void
) => {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const htmlContent = e.target?.result as string;
      if (htmlContent) {
        localStorage.setItem("customerContactData", htmlContent);
        toast.success(`Customer Contact Daten erfolgreich hochgeladen`, {
          description: "Die Daten können jetzt in der Customer Contact Ansicht angezeigt werden."
        });
        onFileUpload?.(file, "html", "customerContact");
        resolve();
      } else {
        reject(new Error("Leere Datei"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Fehler beim Lesen der Datei"));
    };
    
    reader.readAsText(file);
  });
};
