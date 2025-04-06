
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
        
        // Extract week number from filename (if available)
        let weekNumber = 0;
        let year = new Date().getFullYear();
        
        const weekMatch = this.file.name.match(/Week(\d+)/i);
        if (weekMatch && weekMatch[1]) {
          weekNumber = parseInt(weekMatch[1], 10);
          console.log(`Detected week ${weekNumber} from filename`);
        }
        
        // Extract year from filename (if available)
        const yearMatch = this.file.name.match(/(\d{4})/);
        if (yearMatch && yearMatch[1]) {
          year = parseInt(yearMatch[1], 10);
          console.log(`Detected year ${year} from filename`);
        }
        
        // If week not found in filename, try to guess from current date
        if (weekNumber === 0) {
          const currentDate = new Date();
          const onejan = new Date(currentDate.getFullYear(), 0, 1);
          const weekNum = Math.ceil((((currentDate.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
          weekNumber = weekNum;
          console.log(`Week not found in filename, using current week: ${weekNumber}`);
        }
        
        // Generate storage keys for this week's data
        const weekKey = `week-${weekNumber}-${year}`;
        const storageKeyHtml = `customerContactData_${weekKey}`;
        const storageKeyParsed = `parsedCustomerContactData_${weekKey}`;
        
        // Store the raw HTML and parsed data for this specific week
        localStorage.setItem(storageKeyHtml, htmlContent);
        localStorage.setItem(storageKeyParsed, JSON.stringify(contactData));
        
        // Also store as current data
        localStorage.setItem("customerContactData", htmlContent);
        localStorage.setItem("parsedCustomerContactData", JSON.stringify(contactData));
        
        // Remember the active week
        localStorage.setItem("customerContactActiveWeek", weekKey);
        
        if (showToasts) {
          toast.success(`Customer Contact Daten erfolgreich hochgeladen`, {
            description: `Die Daten für KW ${weekNumber}/${year} können jetzt in der Customer Contact Ansicht angezeigt werden.`,
            action: {
              label: "Zur Übersicht",
              onClick: () => {
                window.location.href = "/quality/customer-contact";
              }
            },
            duration: 10000,
          });
        }
        
        // Add to the file upload history with driver count metadata
        this.addToUploadHistory(this.file, "html", "customerContact", {
          driversCount: contactData.length,
          weekNumber: weekNumber,
          year: year
        });
        
        // Dispatch event to notify components that customer contact data was updated
        window.dispatchEvent(new CustomEvent('customerContactDataUpdated', {
          detail: {
            weekKey: weekKey
          }
        }));
        
        // Call the onFileUpload callback if provided
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
