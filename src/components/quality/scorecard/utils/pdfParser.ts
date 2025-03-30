
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
    
    // Extract week number from filename
    const weekNum = extractWeekFromFilename(filename);
    console.info("Extracted week number:", weekNum);
    
    // Load the PDF document
    try {
      const pdf = await loadPDFDocument(pdfData);
      console.info(`PDF loaded with ${pdf.numPages} pages`);
      
      // Store the extraction attempts and their results
      const extractionAttempts: Array<{method: string, success: boolean, data?: any, error?: any}> = [];
      
      // Try the advanced positional extraction first
      try {
        if (detailedLogging) console.info("Attempting positional extraction...");
        const posData = await extractPDFContentWithPositions(pdf);
        
        if (detailedLogging) {
          console.log("Extracted positional data sample:", 
            Object.keys(posData).map(key => `Page ${key}: ${posData[Number(key)].items.length} items`));
        }
        
        const structuredData = extractStructuredScorecard(posData, filename);
        
        // Validate the extracted data to ensure it has the minimum required fields
        if (structuredData && isValidScorecardData(structuredData)) {
          console.info("Successfully extracted data using positional analysis");
          extractionAttempts.push({method: "positional", success: true, data: structuredData});
          
          // Add flag to indicate real extracted data
          return {...structuredData, isSampleData: false};
        } else {
          extractionAttempts.push({
            method: "positional", 
            success: false, 
            error: "Data validation failed"
          });
        }
      } catch (e) {
        console.warn("Positional extraction failed:", e);
        extractionAttempts.push({method: "positional", success: false, error: e});
      }
      
      // Fall back to regular text extraction
      try {
        if (detailedLogging) console.info("Attempting text-based extraction...");
        // Extract text from PDF pages
        const { companyText, driverText, fullText, pageTexts } = await extractTextFromPDF(pdf);
        
        if (detailedLogging) {
          console.log("Text extraction samples:", {
            page1Sample: companyText.substring(0, 100) + "...",
            page2Sample: driverText.substring(0, 100) + "...",
            totalLength: fullText.length
          });
        }
        
        // First try regular text-based extraction
        const parsedData = extractScorecardData(companyText, driverText, weekNum);
        
        // Validate the extracted data
        if (parsedData && isValidScorecardData(parsedData)) {
          console.info("Successfully parsed scorecard data using text-based extraction");
          extractionAttempts.push({method: "text-based", success: true, data: parsedData});
          
          // Add flag to indicate real extracted data
          return {...parsedData, isSampleData: false};
        } else {
          extractionAttempts.push({
            method: "text-based", 
            success: false, 
            error: "Data validation failed"
          });
        }
      } catch (e) {
        console.warn("Text extraction failed:", e);
        extractionAttempts.push({method: "text-based", success: false, error: e});
      }
      
      // Last resort: use simple extraction
      console.warn("All extraction methods failed, using simple extraction as last resort");
      if (detailedLogging) {
        console.warn("Extraction attempts summary:", extractionAttempts);
      }
      
      // If we get here, all extraction methods failed - use sample data but mark it as such
      const data = createSimpleScorecard(weekNum);
      console.info("Generated fallback data for week", weekNum);
      return {...data, isSampleData: true};
    } catch (error) {
      console.error('Error with PDF document:', error);
      // Use sample data as fallback but mark it as sample data
      const data = await getSampleDataWithWeek(weekNum);
      console.info("Using sample data due to PDF processing error");
      return {...data, isSampleData: true};
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    const weekNum = new Date().getWeek();
    // Use sample data as fallback but mark it as sample data
    const data = await getSampleDataWithWeek(weekNum);
    console.info("Using sample data due to general parsing error");
    return {...data, isSampleData: true};
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
    console.log("Validation failed: missing required top-level properties");
    return false;
  }
  
  // Check for company KPIs
  if (!Array.isArray(data.companyKPIs) || data.companyKPIs.length === 0) {
    console.log("Validation failed: missing company KPIs");
    return false;
  }
  
  // Check for driver KPIs
  if (!Array.isArray(data.driverKPIs) || data.driverKPIs.length === 0) {
    console.log("Validation failed: missing driver KPIs");
    return false;
  }
  
  // Additional validation: Check if at least one company KPI has real data
  const hasRealKPIData = data.companyKPIs.some(kpi => 
    typeof kpi.value === 'number' && 
    kpi.name.length > 0
  );
  
  if (!hasRealKPIData) {
    console.log("Validation failed: no real KPI data found");
    return false;
  }
  
  // Data is valid if it passes all checks
  return true;
};
