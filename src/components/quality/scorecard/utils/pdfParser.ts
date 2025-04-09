
import { ScoreCardData } from '../types';
import { PDFParseError } from './parser/PDFParseError';
import { extractWeekFromFilename } from './parser/weekUtils';
import { getSampleDataWithWeek } from './parser/sampleDataProvider';
import { loadPDFDocument } from './parser/pdfDocumentLoader';
import { 
  attemptPositionalExtraction,
  attemptTextBasedExtraction,
  createFallbackData
} from './parser/extractionStrategies';
import { STORAGE_KEYS, saveToStorage } from '@/utils/storage';

// Definiere ein konkretes Interface für das Extraktionsergebnis
interface ExtractionResult {
  success: boolean;
  data: ScoreCardData | null;
  error: any;
}

/**
 * Parse a scorecard PDF and extract data with improved driver extraction
 * @param pdfData ArrayBuffer containing the PDF data
 * @param filename Original filename (used for KW extraction)
 * @param detailedLogging Enable detailed logging for debugging
 * @returns Promise with the parsed ScoreCardData
 */
export const parseScorecardPDF = async (
  pdfData: ArrayBuffer,
  filename: string,
  detailedLogging: boolean = true  // Enable detailed logging by default for better debugging
): Promise<ScoreCardData> => {
  try {
    console.info("Starting PDF parsing for: ", filename);
    
    // Extract week number from filename using the enhanced extractor
    const weekNum = extractWeekFromFilename(filename);
    console.info("Extracted week number:", weekNum);
    
    // Load the PDF document
    try {
      const pdf = await loadPDFDocument(pdfData);
      console.info(`PDF loaded with ${pdf.numPages} pages`);
      
      // Try multiple extraction attempts to maximize driver detection
      
      // First try: Positional extraction (most reliable when it works)
      console.log("Starting positional extraction...");
      const positionalResult = await attemptPositionalExtraction(pdf, filename, detailedLogging);
      let extractedData;
      
      if (positionalResult.success && positionalResult.data && 
          positionalResult.data.driverKPIs && positionalResult.data.driverKPIs.length >= 5 &&
          positionalResult.data.companyKPIs && positionalResult.data.companyKPIs.length >= 3) {
        // Positional extraction worked well
        extractedData = positionalResult.data;
        console.log(`Positional extraction successful with ${extractedData.driverKPIs?.length || 0} drivers and ${extractedData.companyKPIs?.length || 0} KPIs`);
      } else {
        // If positional extraction failed or found few drivers/KPIs, try text-based extraction
        console.log("Positional extraction didn't find enough data, trying text-based extraction");
        
        // Cast to ensure we have all required properties
        const textBasedResult: ExtractionResult = {
          success: false,
          data: null,
          error: null,
          ...await attemptTextBasedExtraction(pdf, weekNum, detailedLogging)
        };
        
        if (textBasedResult.success && textBasedResult.data && 
            textBasedResult.data.driverKPIs && textBasedResult.data.driverKPIs.length >= 3 &&
            textBasedResult.data.companyKPIs && textBasedResult.data.companyKPIs.length >= 2) {
          // Text-based extraction worked
          extractedData = textBasedResult.data;
          console.log(`Text-based extraction successful with ${extractedData.driverKPIs?.length || 0} drivers and ${extractedData.companyKPIs?.length || 0} KPIs`);
        } else if (positionalResult.data && positionalResult.data.driverKPIs && 
                  positionalResult.data.driverKPIs.length > 0) {
          // Fall back to partial positional results if it found at least some drivers
          extractedData = positionalResult.data;
          console.log(`Using partial positional results with ${extractedData.driverKPIs?.length || 0} drivers`);
        } else if (textBasedResult.data && textBasedResult.data.driverKPIs && 
                  textBasedResult.data.driverKPIs.length > 0) {
          // Fall back to partial text-based results
          extractedData = textBasedResult.data;
          console.log(`Using partial text-based results with ${extractedData.driverKPIs?.length || 0} drivers`);
        } else {
          // Last resort: use simple fallback data creation - but mark it clearly as sample data
          console.log("No extraction method found enough data, using fallback data but marking as sample");
          extractedData = createFallbackData(weekNum);
          extractedData.isSampleData = true;
        }
      }
      
      // Make sure the week is set correctly based on filename
      if (weekNum > 0) {
        extractedData.week = weekNum;
      }
      
      // If year is missing, use current year
      if (!extractedData.year) {
        extractedData.year = new Date().getFullYear();
      }
      
      console.log(`Final extraction result: ${extractedData.driverKPIs?.length || 0} drivers and ${extractedData.companyKPIs?.length || 0} KPIs`);
      
      // If we couldn't extract enough real data, clearly mark this as sample data
      if (!extractedData.driverKPIs || extractedData.driverKPIs.length < 5 || 
          !extractedData.companyKPIs || extractedData.companyKPIs.length < 3) {
        console.log("Not enough real data extracted, marking as sample data");
        extractedData.isSampleData = true;
      }
      
      // Store data in both locations for compatibility
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, extractedData);
      localStorage.setItem("extractedScorecardData", JSON.stringify(extractedData));
      
      return extractedData;
    } catch (error) {
      console.error('Error with PDF document:', error);
      // Use sample data as fallback but mark it as sample data
      const data = await getSampleDataWithWeek(weekNum);
      console.info("Using sample data due to PDF processing error");
      
      // Store data in both locations
      const resultData = {...data, isSampleData: true};
      
      // Store data in both locations
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
      localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
      
      return resultData;
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    const weekNum = new Date().getWeek();
    // Use sample data as fallback but mark it as sample data
    const data = await getSampleDataWithWeek(weekNum);
    console.info("Using sample data due to general parsing error");
    
    // Save the sample data consistently using both methods
    const resultData = {...data, isSampleData: true};
    
    // Store data in both locations
    saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
    localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
    
    return resultData;
  }
};
