
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { toast } from "sonner";

/**
 * Process scorecard PDF files
 */
export class ScorecardProcessor extends BaseFileProcessor {
  /**
   * Process a scorecard PDF file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    console.info(`Processing scorecard file: ${this.file.name}`);
    
    try {
      // Clear any existing data first
      localStorage.removeItem("scorecard_week");
      localStorage.removeItem("scorecard_year");
      localStorage.removeItem("scorecard_data");
      localStorage.removeItem("extractedScorecardData");
      
      // Store the file content for actual processing
      const fileReader = new FileReader();
      fileReader.onload = () => {
        console.log("Scorecard file loaded, ready for processing");
      };
      fileReader.readAsArrayBuffer(this.file);
      
      if (showToasts) {
        toast.success(
          `Scorecard Datei hochgeladen`,
          {
            description: "Die Datei wurde hochgeladen und kann jetzt verarbeitet werden.",
          }
        );
      }
      
      this.processDefault(showToasts);
      return true;
    } catch (error) {
      console.error("Error processing scorecard:", error);
      if (showToasts) {
        toast.error("Fehler bei der Verarbeitung der Scorecard");
      }
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
}
