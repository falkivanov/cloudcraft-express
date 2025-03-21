
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { parseScorecardPDF } from "@/components/quality/scorecard/utils/pdfParser";

/**
 * Specialized processor for Scorecard PDF files
 */
export class ScorecardProcessor extends BaseFileProcessor {
  /**
   * Process a scorecard PDF file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
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
        
        // Store file info for reference - Fix the type error by converting numbers to strings
        localStorage.setItem("scorecardData", JSON.stringify({
          content: "PDF processed", // We don't store the raw PDF content
          type: "pdf",
          fileName: this.file.name,
          parsed: true,
          week: parsedData.week.toString(), // Convert number to string
          year: parsedData.year.toString()  // Convert number to string
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
        
        return true;
      } else {
        throw new Error("Keine Daten konnten aus der PDF extrahiert werden");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      if (showToasts && loadingToast) toast.dismiss(loadingToast);
      throw error; // Re-throw to let the parent handle it
    } finally {
      this.setProcessing(false);
    }
  }
}
