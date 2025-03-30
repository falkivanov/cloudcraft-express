
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

/**
 * Parse a scorecard PDF and extract data
 * @param pdfData ArrayBuffer containing the PDF data
 * @param filename Original filename (used for KW extraction)
 * @param detailedLogging Enable detailed logging for debugging
 * @returns Promise with the parsed ScoreCardData
 */
export const parseScorecardPDF = async (
  pdfData: ArrayBuffer,
  filename: string,
  detailedLogging: boolean = false
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
      
      // Store the extraction attempts and their results
      const extractionAttempts: Array<{method: string, success: boolean, data?: any, error?: any}> = [];
      
      // Try the advanced positional extraction first
      const positionalResult = await attemptPositionalExtraction(pdf, filename, detailedLogging);
      extractionAttempts.push({method: "positional", ...positionalResult});
      
      if (positionalResult.success) {
        // Make sure the week is set correctly based on filename
        if (positionalResult.data && weekNum > 0) {
          positionalResult.data.week = weekNum;
        }
        console.log(`Positional extraction found ${positionalResult.data.driverKPIs?.length || 0} drivers`);
        return positionalResult.data!;
      }
      
      // Fall back to regular text extraction
      const textBasedResult = await attemptTextBasedExtraction(pdf, weekNum, detailedLogging);
      extractionAttempts.push({method: "text-based", ...textBasedResult});
      
      if (textBasedResult.success) {
        console.log(`Text-based extraction found ${textBasedResult.data.driverKPIs?.length || 0} drivers`);
        return textBasedResult.data!;
      }
      
      // Log extraction attempts if detailed logging is enabled
      if (detailedLogging) {
        console.warn("Extraction attempts summary:", extractionAttempts);
      }
      
      // Last resort: use simple extraction
      return createFallbackData(weekNum);
    } catch (error) {
      console.error('Error with PDF document:', error);
      // Use sample data as fallback but mark it as sample data
      const data = await getSampleDataWithWeek(weekNum);
      console.info("Using sample data due to PDF processing error");
      
      // Save the sample data consistently using both methods
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
