
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
    
    try {
      // For now, just do basic processing
      // In the future, add PDF parsing here
      
      // Mock PDF parsing result
      const parsedData = {
        week: 12,
        year: 2023,
        categoryScores: { delivery: 85, quality: 92, overall: 88 }
      };
      
      // Store parsed data in localStorage - convert numbers to strings
      localStorage.setItem("scorecard_week", parsedData.week.toString());
      localStorage.setItem("scorecard_year", parsedData.year.toString());
      localStorage.setItem("scorecard_data", JSON.stringify(parsedData.categoryScores));
      
      if (showToasts) {
        toast.success(
          `Scorecard für KW ${parsedData.week}/${parsedData.year} erfolgreich verarbeitet`,
          {
            description: "Die Daten wurden aktualisiert und können jetzt eingesehen werden.",
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
