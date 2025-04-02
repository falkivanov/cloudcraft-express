import { DriverKPI } from '../../../../types';
import { extractDriverKPIs } from './index';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { ensureAllMetrics } from './utils/metricUtils';

/**
 * Run a specific extraction strategy and combine results
 */
const runStrategy = (
  strategyFn: (text: string, options?: any) => DriverKPI[],
  text: string,
  options?: any,
  existingDrivers: DriverKPI[] = []
): DriverKPI[] => {
  const newDrivers = strategyFn(text, options);
  console.log(`Strategy found ${newDrivers.length} drivers`);
  
  if (newDrivers.length === 0) return existingDrivers;
  
  // Only add drivers that don't already exist
  const combinedDrivers = [...existingDrivers];
  newDrivers.forEach(driver => {
    if (!combinedDrivers.some(d => d.name === driver.name)) {
      combinedDrivers.push(driver);
    }
  });
  
  return combinedDrivers;
};

/**
 * Extract drivers by trying different strategies based on content type,
 * prioritizing 14-character A-prefixed IDs and processing multiple pages
 */
export const extractDriversByPage = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Extracting drivers with multi-page approach");
  let drivers: DriverKPI[] = [];
  
  // Split text by page markers if available
  const pageTexts: string[] = [];
  if (pageData && Object.keys(pageData).length > 0) {
    // If we have structured page data, use it
    Object.keys(pageData).forEach(key => {
      if (pageData[Number(key)]?.text) {
        pageTexts.push(pageData[Number(key)].text);
      }
    });
  } else {
    // Otherwise try to split text by page markers
    const pageMatches = text.match(/(?:Page|Seite)\s+\d+\s+(?:of|von)\s+\d+/gi);
    if (pageMatches && pageMatches.length > 1) {
      const splitText = text.split(/(?:Page|Seite)\s+\d+\s+(?:of|von)\s+\d+/i);
      pageTexts.push(...splitText);
    } else {
      // If no page markers, treat whole text as one page
      pageTexts.push(text);
    }
  }
  
  console.log(`Processing ${pageTexts.length} pages of text`);
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, prioritizing enhanced pattern extraction");
    
    // First try enhanced pattern extraction on each page
    for (let i = 0; i < pageTexts.length; i++) {
      const pageText = pageTexts[i];
      console.log(`Analyzing page ${i+1} for A-prefixed IDs`);
      
      // Skip pages that don't contain A-prefixed IDs
      if (!/\bA[A-Z0-9]{5,}\b/.test(pageText)) {
        console.log(`Page ${i+1} doesn't contain A-prefixed IDs, skipping`);
        continue;
      }
      
      // Try enhanced pattern extraction on this page
      const pageDrivers = extractDriversWithEnhancedPatterns(pageText, { 
        prioritizeAIds: true,
        strictFormat: true  // Enforce strict 14-character format
      });
      
      if (pageDrivers.length > 0) {
        console.log(`Found ${pageDrivers.length} drivers with A-prefixed IDs on page ${i+1}`);
        
        // Add only new drivers
        pageDrivers.forEach(driver => {
          if (!drivers.some(d => d.name === driver.name)) {
            drivers.push(driver);
          }
        });
      }
    }
    
    // If we found enough drivers, return them
    if (drivers.length >= 15) {
      console.log(`Found ${drivers.length} drivers with enhanced A-ID extraction, returning early`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // If we don't have enough drivers yet, try the main extraction function on each page
  if (drivers.length < 15) {
    console.log("Trying main extraction function on each page");
    
    for (let i = 0; i < pageTexts.length; i++) {
      const pageText = pageTexts[i];
      
      // Process this page with the main extractor
      const pageData = { [i+2]: { text: pageText, items: [] } }; // Page numbers typically start at 2
      const mainDrivers = extractDriverKPIs(pageText, pageData);
      
      console.log(`Found ${mainDrivers.length} drivers on page ${i+1} with main extraction`);
      
      // Add only new drivers
      mainDrivers.forEach(driver => {
        if (!drivers.some(d => d.name === driver.name)) {
          drivers.push(driver);
        }
      });
    }
  }
  
  // If we still don't have enough drivers, try additional strategies
  if (drivers.length < 15) {
    console.log("Still need more drivers, trying additional strategies");
    
    // Try on the complete text with multiple strategies
    // Try line-by-line extraction
    drivers = runStrategy(extractDriversLineByLine, text, undefined, drivers);
    
    // Try flexible pattern extraction as a last resort
    if (drivers.length < 15) {
      drivers = runStrategy(extractDriversWithFlexiblePattern, text, undefined, drivers);
    }
  }
  
  // If we have exactly one driver from each strategy, it might be sample data that's being regenerated
  // Let's try to extract from the full text as a last resort
  if (drivers.length <= 3) {
    console.log("Very few drivers found, trying one final extraction on full text");
    const fullTextDrivers = extractDriverKPIs(text);
    
    if (fullTextDrivers.length > drivers.length) {
      console.log(`Found ${fullTextDrivers.length} drivers with full text extraction, using these instead`);
      drivers = fullTextDrivers;
    }
  }
  
  console.log(`Final driver count: ${drivers.length}`);
  
  // Ensure all drivers have complete metrics
  return ensureAllMetrics(drivers);
};

/**
 * Combined strategy that tries multiple extraction methods across all pages
 */
export const tryAllExtractionStrategies = (text: string): DriverKPI[] => {
  console.log("Trying all extraction strategies across multiple pages");
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, using enhanced pattern extraction first");
    // First try the enhanced pattern extractor optimized for A-prefixed IDs
    const drivers = extractDriversWithEnhancedPatterns(text, { 
      prioritizeAIds: true,
      strictFormat: true,
      multiPageAnalysis: true  // Enable multi-page analysis
    });
    
    if (drivers.length >= 10) {
      console.log(`Found ${drivers.length} drivers with enhanced pattern extraction, returning directly`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // Try page-by-page extraction as a fallback
  return extractDriversByPage(text);
};

/**
 * Extract drivers or fall back to sample data
 */
export const extractDriversOrUseSampleData = (text: string, pageData?: any): DriverKPI[] => {
  // First try with multi-page analysis for better coverage
  const drivers = extractDriversByPage(text, pageData);
  
  if (drivers.length <= 3) {
    // If very few drivers found, try one more time with all strategies
    console.log("Few drivers found, making one final attempt with all strategies");
    const finalDrivers = tryAllExtractionStrategies(text);
    
    if (finalDrivers.length > drivers.length) {
      return finalDrivers;
    }
  }
  
  return drivers;
};
