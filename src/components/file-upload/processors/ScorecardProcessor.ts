
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { toast } from "sonner";
import { parseScorecardPDF } from "@/components/quality/scorecard/utils/pdfParser";
import { addItemToHistory } from "@/utils/fileUploadHistory";

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
      // Clear any existing data first to ensure we don't have stale data
      localStorage.removeItem("scorecard_week");
      localStorage.removeItem("scorecard_year");
      localStorage.removeItem("scorecard_data");
      localStorage.removeItem("extractedScorecardData");
      
      // Read file as ArrayBuffer for PDF.js processing
      const arrayBuffer = await this.file.arrayBuffer();
      
      console.log("Starting PDF parsing...");
      // Process the PDF file with detailed logging enabled
      const scorecardData = await parseScorecardPDF(arrayBuffer, this.file.name, true);
      
      if (scorecardData) {
        console.log("Successfully extracted scorecard data:", scorecardData);
        // Store the extracted data in localStorage
        localStorage.setItem("extractedScorecardData", JSON.stringify(scorecardData));
        
        // Also store week information separately for easier access
        if (scorecardData.week && scorecardData.year) {
          localStorage.setItem("scorecard_week", String(scorecardData.week));
          localStorage.setItem("scorecard_year", String(scorecardData.year));
        }
        
        if (showToasts) {
          toast.success(
            `Scorecard für KW ${scorecardData.week}/${scorecardData.year} verarbeitet`,
            {
              description: "Die Daten wurden extrahiert und können jetzt angezeigt werden.",
            }
          );
        }

        // Add to file upload history with extracted data information
        this.addToUploadHistory(this.file, "pdf", "scorecard", {
          week: scorecardData.week,
          year: scorecardData.year,
          location: scorecardData.location,
          isReal: !scorecardData.isSampleData // Flag to indicate if data was actually extracted
        });
        
        // Dispatch a custom event to notify that scorecard data has been updated
        // This helps with updating the UI when data changes within the same window
        window.dispatchEvent(new Event('scorecardDataUpdated'));
        
        return true;
      } else {
        throw new Error("Keine Daten konnten aus der PDF-Datei extrahiert werden.");
      }
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
  
  /**
   * Add file upload to history with additional metadata
   * Changed from private to protected to match base class
   */
  protected addToUploadHistory(file: File, type: string, category: string, metadata: any = {}): void {
    const historyItem = {
      name: file.name,
      type: type,
      timestamp: new Date().toISOString(),
      category: category,
      ...metadata
    };
    
    addItemToHistory(historyItem);
  }
}
