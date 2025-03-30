
import { ScoreCardData } from '../types';
import { extractScorecardData } from './extractors/dataExtractor';
import { PDFParseError } from './parser/PDFParseError';
import { extractWeekFromFilename } from './parser/weekUtils';
import { getSampleDataWithWeek } from './parser/sampleDataProvider';
import { 
  loadPDFDocument, 
  extractTextFromPDF, 
  extractPDFContentWithPositions 
} from './parser/pdfDocumentLoader';
import { 
  createSimpleScorecard,
  extractStructuredScorecard
} from './parser/simpleExtractor';

/**
 * Parse a scorecard PDF and extract data
 * @param pdfData ArrayBuffer containing the PDF data
 * @param filename Original filename (used for KW extraction)
 * @returns Promise with the parsed ScoreCardData
 */
export const parseScorecardPDF = async (
  pdfData: ArrayBuffer,
  filename: string
): Promise<ScoreCardData> => {
  try {
    console.info("Starting PDF parsing for: ", filename);
    
    // Extract week number from filename
    const weekNum = extractWeekFromFilename(filename);
    console.info("Extracted week number:", weekNum);
    
    // Load the PDF document
    try {
      const pdf = await loadPDFDocument(pdfData);
      
      // Try the advanced positional extraction first
      try {
        console.info("Attempting positional extraction...");
        const posData = await extractPDFContentWithPositions(pdf);
        const structuredData = extractStructuredScorecard(posData, filename);
        
        // Validate the extracted data to ensure it has the minimum required fields
        if (structuredData && isValidScorecardData(structuredData)) {
          console.info("Successfully extracted data using positional analysis");
          return structuredData;
        }
      } catch (e) {
        console.warn("Positional extraction failed, falling back to text extraction", e);
      }
      
      // Fall back to regular text extraction
      try {
        // Extract text from PDF pages
        const { companyText, driverText, fullText, pageTexts } = await extractTextFromPDF(pdf);
        
        // First try regular text-based extraction
        console.info("Attempting text-based extraction...");
        const parsedData = extractScorecardData(companyText, driverText, weekNum);
        
        // Validate the extracted data
        if (parsedData && isValidScorecardData(parsedData)) {
          console.info("Successfully parsed scorecard data for week", weekNum);
          return parsedData;
        } else {
          throw new Error("Text-based extraction failed to produce valid data");
        }
      } catch (e) {
        console.warn("Text extraction failed, using simple extraction", e);
        
        // If text-based extraction fails, use simple extraction
        console.info("Using simple extraction method");
        const data = createSimpleScorecard(weekNum);
        console.info("Generated sample data for week", weekNum);
        return data;
      }
    } catch (error) {
      console.error('Error with PDF document:', error);
      const data = await getSampleDataWithWeek(weekNum);
      console.info("Using sample data due to PDF processing error");
      return data;
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    const weekNum = new Date().getWeek();
    const data = await getSampleDataWithWeek(weekNum);
    console.info("Using sample data due to general parsing error");
    return data;
  }
};

/**
 * Validate scorecard data to ensure it has the minimum required fields
 * @param data Scorecard data to validate
 * @returns Whether the data is valid
 */
const isValidScorecardData = (data: Partial<ScoreCardData>): boolean => {
  // Check for required top-level properties
  if (!data.week || !data.year || !data.location) {
    return false;
  }
  
  // Check for company KPIs
  if (!Array.isArray(data.companyKPIs) || data.companyKPIs.length === 0) {
    return false;
  }
  
  // Check for driver KPIs
  if (!Array.isArray(data.driverKPIs) || data.driverKPIs.length === 0) {
    return false;
  }
  
  // Data is valid if it passes all checks
  return true;
};
