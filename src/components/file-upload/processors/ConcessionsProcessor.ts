
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";

/**
 * Specialized processor for Concessions Excel files
 */
export class ConcessionsProcessor extends BaseFileProcessor {
  /**
   * Process a Concessions Excel file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      await this.readFileAsArrayBuffer()
        .then((content) => {
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
        });
      
      return true;
    } catch (error) {
      console.error("Error processing Concessions:", error);
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
  
  /**
   * Read the file content as ArrayBuffer
   */
  private readFileAsArrayBuffer(): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei"));
      };
      
      reader.readAsArrayBuffer(this.file);
    });
  }
}
