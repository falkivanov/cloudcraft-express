
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
 * prioritizing 14-character A-prefixed IDs
 */
export const extractDriversByPage = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Extracting drivers with page-based approach");
  let drivers: DriverKPI[] = [];
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, prioritizing enhanced pattern extraction");
    // First try the enhanced pattern extractor optimized for A-prefixed IDs
    drivers = runStrategy(
      extractDriversWithEnhancedPatterns, 
      text, 
      { prioritizeAIds: true }
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
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, using enhanced pattern extraction first");
    // First try the enhanced pattern extractor optimized for A-prefixed IDs
    const drivers = extractDriversWithEnhancedPatterns(text, { prioritizeAIds: true });
    
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
  const drivers = extractDriverKPIs(text, pageData);
  return drivers;
};
