
import { toast } from "sonner";
import { parseScorecardPDF, PDFParseError } from "@/components/quality/scorecard/utils/pdfParser";

/**
 * Process a scorecard PDF file
 */
export const processScorecardPDF = async (
  file: File,
  onFileUpload?: (file: File, type: string, category: string) => void
) => {
  // Show loading toast
  const loadingToast = toast.loading("Verarbeite Scorecard PDF...");
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse the PDF with the refactored parser
    const parsedData = await parseScorecardPDF(arrayBuffer, file.name);
    
    if (parsedData) {
      // Store the parsed data in localStorage
      localStorage.setItem("extractedScorecardData", JSON.stringify(parsedData));
      
      // Store file info for reference
      localStorage.setItem("scorecardData", JSON.stringify({
        content: "PDF processed", // We don't store the raw PDF content
        type: "pdf",
        fileName: file.name,
        parsed: true,
        week: parsedData.week,
        year: parsedData.year
      }));
      
      // Close loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Scorecard für KW ${parsedData.week} erfolgreich verarbeitet`, {
        description: `Die Daten für ${parsedData.location} wurden extrahiert und können jetzt angezeigt werden.`
      });
      
      // Also call the parent handler
      onFileUpload?.(file, "pdf", "scorecard");
    } else {
      throw new Error("Keine Daten konnten aus der PDF extrahiert werden");
    }
  } catch (error) {
    console.error("Error processing PDF:", error);
    toast.dismiss(loadingToast);
    
    if (error instanceof PDFParseError) {
      toast.error(`Fehler beim Verarbeiten der PDF: ${error.message}`, {
        description: "Bitte überprüfen Sie das PDF-Format und versuchen Sie es erneut."
      });
    } else {
      toast.error(`Fehler beim Verarbeiten der PDF: ${(error as Error).message || 'Unbekannter Fehler'}`, {
        description: "Ein unerwarteter Fehler ist aufgetreten."
      });
    }
    
    throw error; // Re-throw to let the parent handle it
  }
};
