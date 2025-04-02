
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
 * Parse a scorecard PDF and extract data with improved driver extraction
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
      
      // Process all pages of the PDF specifically looking for driver tables
      // This approach is inspired by the Google Docs conversion method mentioned
      let extractedData;
      let driversFound = 0;
      
      // First attempt: enhanced positional extraction that analyzes all pages thoroughly
      console.log("Attempting multi-page positional extraction with improved driver detection");
      const positionalResult = await attemptPositionalExtraction(pdf, filename, true);
      
      if (positionalResult.success && positionalResult.data && 
          positionalResult.data.driverKPIs) {
        
        driversFound = positionalResult.data.driverKPIs.length;
        console.log(`Positional extraction found ${driversFound} drivers`);
        
        // If we found a significant number of drivers, use this result
        if (driversFound >= 10) {
          extractedData = positionalResult.data;
        }
      }
      
      // Initialize textBasedResult with non-optional properties to match the expected type
      let textBasedResult = { success: false, data: null as any, error: null as any };
      
      // If positional extraction didn't find enough drivers, try text-based extraction
      if (!extractedData || driversFound < 10) {
        console.log("Not enough drivers found with positional extraction, trying text-based extraction");
        textBasedResult = await attemptTextBasedExtraction(pdf, weekNum, true);
        
        if (textBasedResult.success && textBasedResult.data && 
            textBasedResult.data.driverKPIs) {
          
          const textDriversFound = textBasedResult.data.driverKPIs.length;
          console.log(`Text-based extraction found ${textDriversFound} drivers`);
          
          // If text-based extraction found more drivers than positional, use it instead
          if (textDriversFound > driversFound) {
            extractedData = textBasedResult.data;
            driversFound = textDriversFound;
          } else if (!extractedData && textDriversFound > 0) {
            // Or if we don't have any data yet but found some drivers
            extractedData = textBasedResult.data;
            driversFound = textDriversFound;
          }
        }
      }
      
      // If we still don't have data or enough drivers, combine results from both methods
      if (!extractedData || driversFound < 5) {
        console.log("Still not enough drivers, attempting to combine results from both methods");
        
        // Get both results if available
        const drivers1 = positionalResult.data?.driverKPIs || [];
        const drivers2 = textBasedResult?.data?.driverKPIs || [];
        
        // Combine drivers, removing duplicates
        const combinedDrivers = [...drivers1];
        drivers2.forEach(driver => {
          if (!combinedDrivers.some(d => d.name === driver.name)) {
            combinedDrivers.push(driver);
          }
        });
        
        if (combinedDrivers.length > driversFound) {
          console.log(`Combined approach found ${combinedDrivers.length} drivers`);
          
          // Use the result with more drivers as the base
          extractedData = (drivers1.length > drivers2.length) 
            ? positionalResult.data 
            : textBasedResult.data;
          
          // Update with the combined driver list
          extractedData.driverKPIs = combinedDrivers;
          driversFound = combinedDrivers.length;
        }
      }
      
      // If we still don't have data, use fallback
      if (!extractedData) {
        console.log("No extraction method found enough drivers, using fallback data");
        extractedData = createFallbackData(weekNum);
      }
      
      // Make sure the week is set correctly based on filename
      if (weekNum > 0) {
        extractedData.week = weekNum;
      }
      
      // If year is missing, use current year
      if (!extractedData.year) {
        extractedData.year = new Date().getFullYear();
      }
      
      console.log(`Final extraction result: ${extractedData.driverKPIs?.length || 0} drivers`);
      
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
