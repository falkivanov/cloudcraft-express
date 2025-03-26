
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";

/**
 * Specialized processor for Mentor PDF files
 */
export class MentorProcessor extends BaseFileProcessor {
  /**
   * Process a Mentor PDF file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      await this.readFileAsArrayBuffer()
        .then((content) => {
          localStorage.setItem("mentorData", JSON.stringify({
            content: "PDF processed", // Don't store the entire PDF
            type: "pdf",
            fileName: this.file.name
          }));
          
          if (showToasts) {
            toast.success(`Mentor Datei erfolgreich verarbeitet: ${this.file.name}`, {
              description: "Mentor-Daten wurden aktualisiert"
            });
          }
          
          if (this.onFileUpload) {
            this.onFileUpload(this.file, "pdf", "mentor");
          }
        });
      
      return true;
    } catch (error) {
      console.error("Error processing Mentor data:", error);
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
