
import { toast } from "sonner";
import { getCategoryInfo } from "../fileCategories";
import { parseScorecardPDF } from "@/components/quality/scorecard/utils/pdfParser";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";

interface ProcessOptions {
  showToasts?: boolean;
}

/**
 * Unified FileProcessor class that handles all file types
 */
export class FileProcessor {
  private file: File;
  private category: string;
  private onFileUpload?: (file: File, type: string, category: string) => void;
  private processing: boolean = false;
  
  constructor(
    file: File, 
    category: string, 
    onFileUpload?: (file: File, type: string, category: string) => void
  ) {
    this.file = file;
    this.category = category;
    this.onFileUpload = onFileUpload;
  }

  /**
   * Get the currently processing state
   */
  public isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Set the processing state
   */
  public setProcessing(value: boolean): void {
    this.processing = value;
  }
  
  /**
   * Process the file according to its category
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    
    if (!this.file) {
      if (showToasts) toast.error("Bitte wählen Sie zuerst eine Datei aus");
      return false;
    }
    
    const categoryInfo = getCategoryInfo(this.category);
    if (!categoryInfo) {
      if (showToasts) toast.error("Ungültige Kategorie ausgewählt");
      return false;
    }
    
    this.processing = true;
    
    try {
      // Process different file types
      switch (categoryInfo.id) {
        case "scorecard":
          if (categoryInfo.expectedType === "pdf") {
            await this.processScorecardPDF(showToasts);
          }
          break;
          
        case "customerContact":
          if (categoryInfo.expectedType === "html") {
            await this.processCustomerContactHTML(showToasts);
          }
          break;
          
        case "pod":
          await this.processPOD(showToasts);
          break;
          
        case "concessions":
          await this.processConcessions(showToasts);
          break;
          
        default:
          // Default processing
          this.processDefault(showToasts);
      }
      
      return true;
    } catch (error) {
      console.error("Error processing file:", error);
      let errorMessage = 'Unbekannter Fehler';
      
      if (error instanceof Error) {
        errorMessage = `Fehler beim Verarbeiten der Datei: ${error.message}`;
      }
      
      if (showToasts) toast.error(errorMessage);
      return false;
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a scorecard PDF file
   */
  private async processScorecardPDF(showToasts: boolean): Promise<void> {
    // Show loading toast
    let loadingToast: string | undefined;
    if (showToasts) {
      loadingToast = toast.loading("Verarbeite Scorecard PDF...");
    }
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await this.file.arrayBuffer();
      
      // Parse the PDF with the parser
      const parsedData = await parseScorecardPDF(arrayBuffer, this.file.name);
      
      if (parsedData) {
        // Store the parsed data in localStorage
        localStorage.setItem("extractedScorecardData", JSON.stringify(parsedData));
        
        // Store file info for reference
        localStorage.setItem("scorecardData", JSON.stringify({
          content: "PDF processed", // We don't store the raw PDF content
          type: "pdf",
          fileName: this.file.name,
          parsed: true,
          week: parsedData.week,
          year: parsedData.year
        }));
        
        // Close loading toast and show success
        if (showToasts) {
          if (loadingToast) toast.dismiss(loadingToast);
          toast.success(`Scorecard für KW ${parsedData.week} erfolgreich verarbeitet`, {
            description: `Die Daten für ${parsedData.location} wurden extrahiert und können jetzt angezeigt werden.`
          });
        }
        
        // Also call the parent handler
        if (this.onFileUpload) {
          this.onFileUpload(this.file, "pdf", "scorecard");
        }
      } else {
        throw new Error("Keine Daten konnten aus der PDF extrahiert werden");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      if (showToasts && loadingToast) toast.dismiss(loadingToast);
      throw error; // Re-throw to let the parent handle it
    }
  }

  /**
   * Process a customer contact HTML file
   */
  private async processCustomerContactHTML(showToasts: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const htmlContent = e.target?.result as string;
        if (htmlContent) {
          // Parse the HTML content
          const contactData = parseCustomerContactData(htmlContent);
          
          // Store the raw HTML and parsed data
          localStorage.setItem("customerContactData", htmlContent);
          localStorage.setItem("parsedCustomerContactData", JSON.stringify(contactData));
          
          if (showToasts) {
            toast.success(`Customer Contact Daten erfolgreich hochgeladen`, {
              description: "Die Daten können jetzt in der Customer Contact Ansicht angezeigt werden."
            });
          }
          
          if (this.onFileUpload) {
            this.onFileUpload(this.file, "html", "customerContact");
          }
          resolve();
        } else {
          reject(new Error("Leere Datei"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei"));
      };
      
      reader.readAsText(this.file);
    });
  }

  /**
   * Process a POD PDF file
   */
  private processPOD(showToasts: boolean): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        localStorage.setItem("podData", JSON.stringify({
          content: "PDF processed", // Don't store the entire PDF
          type: "pdf",
          fileName: this.file.name
        }));
        
        if (showToasts) {
          toast.success(`POD Datei erfolgreich verarbeitet: ${this.file.name}`, {
            description: "POD-Daten wurden aktualisiert"
          });
        }
        
        if (this.onFileUpload) {
          this.onFileUpload(this.file, "pdf", "pod");
        }
      }
    };
    
    reader.onerror = () => {
      throw new Error("Fehler beim Lesen der Datei");
    };
    
    reader.readAsArrayBuffer(this.file);
  }

  /**
   * Process a Concessions Excel file
   */
  private processConcessions(showToasts: boolean): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        localStorage.setItem("concessionsData", JSON.stringify({
          content: "Excel processed", // Don't store the entire Excel file
          type: "excel",
          fileName: this.file.name
        }));
        
        if (showToasts) {
          toast.success(`Concessions Datei erfolgreich verarbeitet: ${this.file.name}`, {
            description: "Concessions-Daten wurden aktualisiert"
          });
        }
        
        if (this.onFileUpload) {
          this.onFileUpload(this.file, "excel", "concessions");
        }
      }
    };
    
    reader.onerror = () => {
      throw new Error("Fehler beim Lesen der Datei");
    };
    
    reader.readAsArrayBuffer(this.file);
  }

  /**
   * Default processing for other file types
   */
  private processDefault(showToasts: boolean): void {
    const categoryInfo = getCategoryInfo(this.category);
    
    if (showToasts && categoryInfo) {
      toast.success(`Datei "${this.file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
    }
    
    if (this.onFileUpload) {
      const fileType = categoryInfo?.expectedType || "unknown";
      this.onFileUpload(this.file, fileType, this.category);
    }
  }
}
