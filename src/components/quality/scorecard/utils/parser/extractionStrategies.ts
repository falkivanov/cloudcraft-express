
/**
 * Extraction strategies for scorecard data
 */

import { ScoreCardData } from '../../types';
import { extractPDFContentWithPositions, extractTextFromPDF } from './pdf';
import { extractScorecardData } from '../extractors/dataExtractor';
import { extractStructuredScorecard } from './extractors/structuredExtractor';
import { createSimpleScorecard } from './extractors/simpleExtractor';
import { isValidScorecardData } from './validation/scoreCardValidator';
import { STORAGE_KEYS, saveToStorage } from '@/utils/storage';
import { extractDriverKPIs } from './extractors/driver';

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
    
    // Also extract any text content for better driver extraction
    const { fullText } = await extractTextFromPDF(pdf);
    
    // Improve driver extraction by using both positional and text data
    if (structuredData) {
      // Extract drivers more aggressively - now handling it as async
      try {
        const enhancedDrivers = await extractDriverKPIs(fullText, posData);
        
        if (enhancedDrivers && enhancedDrivers.length > 0) {
          console.log(`Enhanced driver extraction found ${enhancedDrivers.length} drivers`);
          
          // Use enhanced drivers only if we found more than in the structured data
          if (enhancedDrivers.length > (structuredData.driverKPIs?.length || 0)) {
            structuredData.driverKPIs = enhancedDrivers;
            console.log(`Using enhanced drivers (${enhancedDrivers.length}) instead of original (${structuredData.driverKPIs?.length || 0})`);
          }
        }
      } catch (error) {
        console.error("Error during enhanced driver extraction:", error);
      }
    }
    
    // Validate the extracted data to ensure it has the minimum required fields
    if (structuredData && isValidScorecardData(structuredData)) {
      console.info("Successfully extracted data using positional analysis");
      
      // Add flag to indicate real extracted data
      const resultData = {...structuredData, isSampleData: false};
      
      // Save the extracted data to localStorage using both approaches for maximum compatibility
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
      localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
      
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
    
    // First try regular text-based extraction - now awaiting since it's async
    const parsedData = await extractScorecardData(companyText, driverText, weekNum);
    
    // Validate the extracted data
    if (parsedData && isValidScorecardData(parsedData)) {
      console.info("Successfully parsed scorecard data using text-based extraction");
      
      // Add flag to indicate real extracted data
      const resultData = {...parsedData, isSampleData: false};
      
      // Save using both approaches for maximum compatibility
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
      localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
      
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
  
  // Save using both approaches for maximum compatibility
  const resultData = {...data, isSampleData: true};
  saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
  localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
  
  return resultData;
};
