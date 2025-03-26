
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { MentorDataProcessor } from "./mentor/MentorDataProcessor";

/**
 * Specialized processor for Mentor Excel files
 */
export class MentorProcessor extends BaseFileProcessor {
  /**
   * Process a Mentor Excel file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      console.log("Processing mentor file:", this.file);
      
      // Create data processor
      const dataProcessor = new MentorDataProcessor(this.file);
      
      // Process the data
      const processedData = await dataProcessor.processFileData();
      
      // Store in localStorage
      localStorage.setItem("mentorData", JSON.stringify(processedData));
      console.log("Stored mentor data in localStorage:", processedData);
      
      if (showToasts) {
        toast.success(`Mentor Datei erfolgreich verarbeitet: ${this.file.name}`, {
          description: `KW${processedData.weekNumber}/${processedData.year} Daten mit ${processedData.drivers.length} Fahrern`
        });
      }
      
      if (this.onFileUpload) {
        this.onFileUpload(this.file, "excel", "mentor");
      }
      
      return true;
    } catch (error) {
      console.error("Error processing Mentor data:", error);
      toast.error("Fehler bei der Verarbeitung der Mentor-Datei", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
}
