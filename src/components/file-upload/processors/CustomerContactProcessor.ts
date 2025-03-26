
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";

/**
 * Specialized processor for Customer Contact HTML files
 */
export class CustomerContactProcessor extends BaseFileProcessor {
  /**
   * Process a customer contact HTML file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      console.log("Processing customer contact file:", this.file.name);
      const htmlContent = await this.readFileAsText();
      
      if (htmlContent) {
        // Parse the HTML content
        const contactData = parseCustomerContactData(htmlContent);
        console.log("Parsed customer contact data:", contactData);
        
        // Store the raw HTML and parsed data
        localStorage.setItem("customerContactData", htmlContent);
        localStorage.setItem("parsedCustomerContactData", JSON.stringify(contactData));
        
        // Update upload history in localStorage
        this.updateUploadHistory();
        
        if (showToasts) {
          toast.success(`Customer Contact Daten erfolgreich hochgeladen`, {
            description: "Die Daten können jetzt in der Customer Contact Ansicht angezeigt werden."
          });
        }
        
        if (this.onFileUpload) {
          this.onFileUpload(this.file, "html", "customerContact");
        }
        
        return true;
      } else {
        throw new Error("Leere Datei");
      }
    } catch (error) {
      console.error("Error processing customer contact HTML:", error);
      toast.error("Fehler beim Verarbeiten der Customer Contact Datei", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
  
  /**
   * Read the file content as text
   */
  private readFileAsText(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei"));
      };
      
      reader.readAsText(this.file);
    });
  }
  
  /**
   * Update the upload history in localStorage
   */
  private updateUploadHistory(): void {
    try {
      const historyString = localStorage.getItem("uploadHistory");
      let history = historyString ? JSON.parse(historyString) : [];
      
      // Add new entry
      history = [
        {
          name: this.file.name,
          type: "html",
          timestamp: new Date().toISOString(),
          category: "customerContact"
        },
        ...history
      ];
      
      // Save back to localStorage
      localStorage.setItem("uploadHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to update upload history:", error);
    }
  }
}
