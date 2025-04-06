
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
      const htmlContent = await this.readFileAsText();
      
      if (htmlContent) {
        console.log("Processing customer contact data...");
        
        // Parse the HTML content
        const contactData = parseCustomerContactData(htmlContent);
        
        console.log("Parsed contact data:", contactData);
        
        // Store the raw HTML and parsed data
        localStorage.setItem("customerContactData", htmlContent);
        localStorage.setItem("parsedCustomerContactData", JSON.stringify(contactData));
        
        if (showToasts) {
          toast.success(`Customer Contact Daten erfolgreich hochgeladen`, {
            description: "Die Daten können jetzt in der Customer Contact Ansicht angezeigt werden.",
            action: {
              label: "Zur Übersicht",
              onClick: () => {
                window.location.href = "/quality/customer-contact";
              }
            },
            duration: 10000,
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
}
