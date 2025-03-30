
/**
 * Extraction strategies for scorecard data
 */

import { ScoreCardData } from '../../types';
import { extractPDFContentWithPositions, extractTextFromPDF } from './pdfDocumentLoader';
import { extractScorecardData } from '../extractors/dataExtractor';
import { extractStructuredScorecard } from './extractors/structuredExtractor';
import { createSimpleScorecard } from './extractors/simpleExtractor';
import { isValidScorecardData } from './validation/scoreCardValidator';
import { STORAGE_KEYS, saveToStorage } from '@/utils/storageUtils';

/**
 * Attempt positional extraction strategy
 */
export const attemptPositionalExtraction = async (
  pdf: any, 
  filename: string, 
  detailedLogging: boolean
): Promise<{ success: boolean, data?: ScoreCardData, error?: any }> => {
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
      
      // Add flag to indicate real extracted data
      const resultData = {...structuredData, isSampleData: false};
      
      // Save the extracted data to localStorage
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
      
      return { success: true, data: resultData };
    } else {
      return { success: false, error: "Data validation failed" };
    }
  } catch (e) {
    console.warn("Positional extraction failed:", e);
    return { success: false, error: e };
  }
};

/**
 * Attempt text-based extraction strategy
 */
export const attemptTextBasedExtraction = async (
  pdf: any, 
  weekNum: number, 
  detailedLogging: boolean
): Promise<{ success: boolean, data?: ScoreCardData, error?: any }> => {
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
      
      // Add flag to indicate real extracted data
      const resultData = {...parsedData, isSampleData: false};
      
      // Save the extracted data to localStorage
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
      
      return { success: true, data: resultData };
    } else {
      return { success: false, error: "Data validation failed" };
    }
  } catch (e) {
    console.warn("Text extraction failed:", e);
    return { success: false, error: e };
  }
};

/**
 * Create fallback sample data
 */
export const createFallbackData = (weekNum: number): ScoreCardData => {
  console.warn("All extraction methods failed, using simple extraction as last resort");
  
  // If we get here, all extraction methods failed - use sample data but mark it as such
  const data = createSimpleScorecard(weekNum);
  console.info("Generated fallback data for week", weekNum);
  
  // Save the sample data to localStorage
  const resultData = {...data, isSampleData: true};
  saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
  
  return resultData;
};
