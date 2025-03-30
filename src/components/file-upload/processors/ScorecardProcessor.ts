import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { toast } from "sonner";
import { parseScorecardPDF } from "@/components/quality/scorecard/utils/pdfParser";

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
      
      // Read file as ArrayBuffer for PDF.js processing
      const arrayBuffer = await this.file.arrayBuffer();
      
      console.log("Starting PDF parsing...");
      // Process the PDF file
      const scorecardData = await parseScorecardPDF(arrayBuffer, this.file.name);
      
      if (scorecardData) {
        console.log("Successfully extracted scorecard data:", scorecardData);
        // Store the extracted data in localStorage
        localStorage.setItem("extractedScorecardData", JSON.stringify(scorecardData));
        
        if (showToasts) {
          toast.success(
            `Scorecard für KW ${scorecardData.week}/${scorecardData.year} verarbeitet`,
            {
              description: "Die Daten wurden extrahiert und können jetzt angezeigt werden.",
            }
          );
        }

        // Add to file upload history
        this.addToUploadHistory(this.file, "pdf", "scorecard");
      } else {
        throw new Error("Keine Daten konnten aus der PDF-Datei extrahiert werden.");
      }
      
      // Call the base class's default processing to handle file upload callback
      this.processDefault(showToasts);
      return true;
    } catch (error) {
      console.error("Error processing scorecard:", error);
      if (showToasts) {
        toast.error(
          "Fehler bei der Verarbeitung der Scorecard",
          {
            description: error instanceof Error ? error.message : "Unbekannter Fehler",
          }
        );
      }
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
}
