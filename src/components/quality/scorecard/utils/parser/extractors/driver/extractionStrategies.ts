
import { DriverKPI } from '../../../../types';
import { extractDriverKPIs } from './index';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { ensureAllMetrics } from './utils/metricUtils';
import { extractDriversFromDSPWeeklySummary, extractDriversFromFixedWidthTable } from './dsp-weekly/extractors';

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
 * prioritizing DSP WEEKLY SUMMARY format
 */
export const extractDriversByPage = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Extracting drivers with page-based approach");
  let drivers: DriverKPI[] = [];
  
  // First check if we have a DSP WEEKLY SUMMARY table which has the most predictable format
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found DSP WEEKLY SUMMARY heading, trying specialized extractors");
    
    // Try the fixed width table extractor first (better for perfectly aligned tables)
    drivers = runStrategy(extractDriversFromFixedWidthTable, text);
    
    // If we didn't get enough drivers, try the general DSP WEEKLY SUMMARY extractor
    if (drivers.length < 15) {
      drivers = runStrategy(extractDriversFromDSPWeeklySummary, text, undefined, drivers);
    }
    
    // If we found enough drivers, return them
    if (drivers.length >= 10) {
      console.log(`Found ${drivers.length} drivers with DSP WEEKLY SUMMARY extraction, returning early`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, prioritizing enhanced pattern extraction");
    // Try the enhanced pattern extractor optimized for A-prefixed IDs
    drivers = runStrategy(
      extractDriversWithEnhancedPatterns, 
      text, 
      { prioritizeAIds: true },
      drivers
    );
    
    // If we found enough drivers, return them
    if (drivers.length >= 15) {
      console.log(`Found ${drivers.length} drivers with enhanced pattern extraction, returning early`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // If we don't have enough drivers yet, try the main extraction function
  if (drivers.length < 15) {
    console.log("Trying main extraction function");
    const mainDrivers = extractDriverKPIs(text, pageData);
    
    // Combine with any drivers found so far
    drivers.forEach(driver => {
      if (!mainDrivers.some(d => d.name === driver.name)) {
        mainDrivers.push(driver);
      }
    });
    
    drivers = mainDrivers;
  }
  
  // If we still don't have enough drivers, try additional strategies
  if (drivers.length < 15) {
    console.log("Still need more drivers, trying additional strategies");
    
    // Try line-by-line extraction
    drivers = runStrategy(extractDriversLineByLine, text, undefined, drivers);
    
    // Try flexible pattern extraction as a last resort
    if (drivers.length < 15) {
      drivers = runStrategy(extractDriversWithFlexiblePattern, text, undefined, drivers);
    }
  }
  
  // Ensure all drivers have complete metrics
  return ensureAllMetrics(drivers);
};

/**
 * Combined strategy that tries multiple extraction methods
 */
export const tryAllExtractionStrategies = (text: string): DriverKPI[] => {
  console.log("Trying all extraction strategies");
  let drivers: DriverKPI[] = [];
  
  // First check if we have a DSP WEEKLY SUMMARY table
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found DSP WEEKLY SUMMARY, using specialized extractors first");
    drivers = runStrategy(extractDriversFromFixedWidthTable, text);
    
    if (drivers.length < 10) {
      drivers = runStrategy(extractDriversFromDSPWeeklySummary, text, undefined, drivers);
    }
    
    if (drivers.length >= 10) {
      console.log(`Found ${drivers.length} drivers with DSP WEEKLY SUMMARY extraction, returning directly`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, using enhanced pattern extraction");
    // Try the enhanced pattern extractor optimized for A-prefixed IDs
    drivers = runStrategy(
      extractDriversWithEnhancedPatterns, 
      text, 
      { prioritizeAIds: true },
      drivers
    );
    
    if (drivers.length >= 10) {
      console.log(`Found ${drivers.length} drivers with enhanced pattern extraction, returning directly`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // Fall back to the main extraction function
  return extractDriverKPIs(text);
};

/**
 * Extract drivers or fall back to sample data
 */
export const extractDriversOrUseSampleData = (text: string, pageData?: any): DriverKPI[] => {
  try {
    // First check if we have a DSP WEEKLY SUMMARY table
    if (text.includes("DSP WEEKLY SUMMARY")) {
      console.log("Found DSP WEEKLY SUMMARY, applying specialized extraction first");
      
      // Try the fixed width table extractor first
      let drivers = extractDriversFromFixedWidthTable(text);
      
      // If that didn't work well, try the general DSP WEEKLY SUMMARY extractor
      if (drivers.length < 10) {
        drivers = extractDriversFromDSPWeeklySummary(text);
      }
      
      if (drivers.length >= 10) {
        console.log(`Successfully extracted ${drivers.length} drivers from DSP WEEKLY SUMMARY`);
        return ensureAllMetrics(drivers);
      }
    }
    
    // If DSP WEEKLY SUMMARY extraction didn't yield enough results, try page-based approach
    console.log("Attempting extract with extractDriversByPage");
    const drivers = extractDriversByPage(text, pageData);
    
    if (drivers && drivers.length > 0) {
      console.log(`Successfully extracted ${drivers.length} drivers`);
      return drivers;
    }
    
    // If page-based extraction didn't work, try all strategies
    console.log("Page-based extraction failed, trying all strategies");
    const allStrategiesDrivers = tryAllExtractionStrategies(text);
    
    if (allStrategiesDrivers && allStrategiesDrivers.length > 0) {
      console.log(`Successfully extracted ${allStrategiesDrivers.length} drivers using all strategies`);
      return allStrategiesDrivers;
    }
    
    // Last resort - fallback to direct extraction
    console.log("All strategies failed, using direct extraction");
    return extractDriverKPIs(text, pageData);
  } catch (error) {
    // If all extraction methods fail, log and use direct extraction
    console.error("Error in driver extraction:", error);
    return extractDriverKPIs(text, pageData);
  }
};
