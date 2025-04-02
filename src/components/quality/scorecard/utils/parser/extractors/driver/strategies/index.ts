
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIsFromText } from '../textExtractor';
import { extractDriversFromDSPWeeklySummary } from '../text/dspWeeklySummaryExtractor';
import { generateSampleDrivers } from '../sampleData';
import { ensureAllMetrics } from '../utils/metricUtils';

/**
 * Extract drivers from multiple pages, trying various strategies
 */
export const extractDriversByPage = (text: string, pageData?: any): DriverKPI[] => {
  // Handle the case when pageData is available
  if (pageData) {
    // Extract drivers from each page
    const allDrivers: DriverKPI[] = [];
    
    // Focus on pages 3 and 4 which typically contain driver data
    const relevantPages = [3, 4, 5].filter(num => pageData[num]);
    
    for (const pageNum of relevantPages) {
      const pageText = pageData[pageNum]?.text || "";
      
      // Try DSP Weekly Summary format for each page
      if (pageText.includes("DSP WEEKLY SUMMARY")) {
        console.log(`Found "DSP WEEKLY SUMMARY" on page ${pageNum}, using specialized extractor`);
        const driversFromPage = extractDriversFromDSPWeeklySummary(pageText);
        
        if (driversFromPage.length > 0) {
          driversFromPage.forEach(driver => {
            if (!allDrivers.some(d => d.name === driver.name)) {
              allDrivers.push(driver);
            }
          });
        }
      }
    }
    
    // If we've found at least 10 drivers this way, use them
    if (allDrivers.length >= 10) {
      console.log(`Found ${allDrivers.length} drivers from page-by-page "DSP WEEKLY SUMMARY" parsing`);
      return ensureAllMetrics(allDrivers);
    }
  }
  
  // If we don't have page data or didn't find enough drivers with the page approach,
  // try parsing the entire text
  return extractDriverKPIsFromText(text);
};

/**
 * Try all extraction strategies for driver KPIs
 */
export const tryAllExtractionStrategies = (text: string): DriverKPI[] => {
  // First, try with DSP WEEKLY SUMMARY format
  if (text.includes("DSP WEEKLY SUMMARY")) {
    const dspWeeklySummaryDrivers = extractDriversFromDSPWeeklySummary(text);
    if (dspWeeklySummaryDrivers.length >= 5) {
      console.log(`Using ${dspWeeklySummaryDrivers.length} drivers from DSP WEEKLY SUMMARY format`);
      return ensureAllMetrics(dspWeeklySummaryDrivers);
    }
  }
  
  // Then try full text extraction with all strategies
  const drivers = extractDriverKPIsFromText(text);
  
  // If we found a good number of drivers, use them
  if (drivers.length >= 5) {
    return drivers;
  }
  
  // If still not enough, use sample data
  console.warn("Extraction strategies found fewer than 5 drivers, using sample data");
  return generateSampleDrivers();
};

/**
 * Main function to extract drivers from text, with fallback to sample data
 */
export const extractDriversOrUseSampleData = (text: string): DriverKPI[] => {
  try {
    // First try with DSP WEEKLY SUMMARY format
    if (text.includes("DSP WEEKLY SUMMARY")) {
      console.log("Text contains 'DSP WEEKLY SUMMARY', using specialized extractor");
      
      const summaryDrivers = extractDriversFromDSPWeeklySummary(text);
      if (summaryDrivers.length >= 5) {
        console.log(`Using ${summaryDrivers.length} drivers from DSP WEEKLY SUMMARY extractor`);
        return ensureAllMetrics(summaryDrivers);
      }
    }
    
    // If DSP extractor didn't find enough, try all strategies
    const drivers = tryAllExtractionStrategies(text);
    
    // If we found a good number of drivers, use them
    if (drivers.length >= 5) {
      console.log(`Found ${drivers.length} drivers with multiple extraction strategies`);
      return drivers;
    }
    
    // If still not enough, use sample data
    console.warn("All strategies found fewer than 5 drivers, using sample data");
    return generateSampleDrivers();
  } catch (error) {
    console.error("Error extracting driver KPIs:", error);
    return generateSampleDrivers();
  }
};
