
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
    let foundDSPWeeklySummary = false;
    
    // First, find which pages contain "DSP WEEKLY SUMMARY"
    const relevantPages: number[] = [];
    for (const pageNum in pageData) {
      const pageText = pageData[pageNum]?.text || "";
      if (pageText.includes("DSP WEEKLY SUMMARY")) {
        relevantPages.push(parseInt(pageNum));
        foundDSPWeeklySummary = true;
      }
    }
    
    // If we found DSP Weekly Summary, focus on those pages and the ones immediately after
    // (since tables might continue to next page)
    if (foundDSPWeeklySummary) {
      console.log(`Found "DSP WEEKLY SUMMARY" on pages: ${relevantPages.join(", ")}`);
      
      // Add pages after each DSP Weekly Summary page (for multi-page tables)
      const pagesToCheck = new Set<number>();
      relevantPages.forEach(pageNum => {
        pagesToCheck.add(pageNum);
        pagesToCheck.add(pageNum + 1); // Add next page
      });
      
      // Sort the pages to process them in order
      const sortedPages = Array.from(pagesToCheck).sort((a, b) => a - b);
      
      // First try to extract from combined text of all relevant pages
      let combinedText = "";
      sortedPages.forEach(pageNum => {
        if (pageData[pageNum]) {
          combinedText += pageData[pageNum].text + "\n";
        }
      });
      
      if (combinedText.includes("DSP WEEKLY SUMMARY")) {
        const driversFromCombined = extractDriversFromDSPWeeklySummary(combinedText);
        if (driversFromCombined.length >= 5) {
          console.log(`Successfully extracted ${driversFromCombined.length} drivers from combined DSP Weekly Summary pages`);
          return ensureAllMetrics(driversFromCombined);
        }
      }
      
      // If combined approach didn't work well, try page by page and combine results
      for (const pageNum of sortedPages) {
        const pageText = pageData[pageNum]?.text || "";
        
        // Use the specialized DSP Weekly Summary extractor
        const driversFromPage = extractDriversFromDSPWeeklySummary(pageText);
        
        if (driversFromPage.length > 0) {
          console.log(`Found ${driversFromPage.length} drivers on page ${pageNum}`);
          driversFromPage.forEach(driver => {
            if (!allDrivers.some(d => d.name === driver.name)) {
              allDrivers.push(driver);
            }
          });
        }
      }
      
      // If we've found a good number of drivers this way, use them
      if (allDrivers.length >= 5) {
        console.log(`Found ${allDrivers.length} unique drivers from page-by-page "DSP WEEKLY SUMMARY" parsing`);
        return ensureAllMetrics(allDrivers);
      }
    } else {
      // If no DSP Weekly Summary found, check all pages for table headers
      const tableHeaderPattern = /Transport\s*ID.*Delivered.*DCR.*DNR\s*DPMO.*POD.*CC.*CE.*DEX/i;
      const pagesWithTableHeaders: number[] = [];
      
      for (const pageNum in pageData) {
        const pageText = pageData[pageNum]?.text || "";
        if (tableHeaderPattern.test(pageText)) {
          pagesWithTableHeaders.push(parseInt(pageNum));
        }
      }
      
      if (pagesWithTableHeaders.length > 0) {
        console.log(`Found driver table headers on pages: ${pagesWithTableHeaders.join(", ")}`);
        
        // Add the pages after headers (for continuing tables)
        const pagesToCheck = new Set<number>();
        pagesWithTableHeaders.forEach(pageNum => {
          pagesToCheck.add(pageNum);
          pagesToCheck.add(pageNum + 1); // Add next page
        });
        
        let combinedText = "";
        Array.from(pagesToCheck).sort().forEach(pageNum => {
          if (pageData[pageNum]) {
            combinedText += pageData[pageNum].text + "\n";
          }
        });
        
        // Use the general text extractor
        const driversFromCombined = extractDriverKPIsFromText(combinedText);
        if (driversFromCombined.length >= 5) {
          return driversFromCombined;
        }
      }
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
  
  // Look specifically for A-prefixed IDs
  const aDriverPattern = /\b(A\d{7,})\b/g;
  const potentialADrivers = [...text.matchAll(aDriverPattern)].map(match => match[1]);
  
  if (potentialADrivers.length > 0) {
    console.log(`Found ${potentialADrivers.length} potential driver IDs starting with 'A'`);
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
    // First check if the text contains table headers we expect in the driver section
    const hasTableHeaders = /Transport\s*ID.*Delivered.*DCR.*DNR\s*DPMO.*POD.*CC.*CE.*DEX/i.test(text);
    
    // First try with DSP WEEKLY SUMMARY format
    if (text.includes("DSP WEEKLY SUMMARY")) {
      console.log("Text contains 'DSP WEEKLY SUMMARY', using specialized extractor");
      
      const summaryDrivers = extractDriversFromDSPWeeklySummary(text);
      if (summaryDrivers.length >= 5) {
        console.log(`Using ${summaryDrivers.length} drivers from DSP WEEKLY SUMMARY extractor`);
        return ensureAllMetrics(summaryDrivers);
      } else if (hasTableHeaders) {
        console.log("Found table headers but DSP Weekly Summary extractor couldn't find enough drivers");
      }
    } else if (hasTableHeaders) {
      console.log("Found expected table headers for driver data");
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
