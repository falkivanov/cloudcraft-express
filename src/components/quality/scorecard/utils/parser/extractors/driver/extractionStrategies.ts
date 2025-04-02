
import { DriverKPI } from '../../../../../types';
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
 * Extract drivers by trying different strategies based on content type
 */
export const extractDriversByPage = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Extracting drivers with page-based approach");
  let drivers: DriverKPI[] = [];
  
  // Determine if we might have alphanumeric IDs (common in newer formats)
  const hasAlphaNumericIDs = text.includes("A1") || text.includes("A2") || text.includes("A0");
  
  // Start with the main extraction function which tries multiple strategies
  drivers = extractDriverKPIs(text, pageData);
  
  // If we still don't have enough drivers, try additional strategies
  if (drivers.length < 10) {
    // For alphanumeric IDs, prioritize enhanced pattern matching
    if (hasAlphaNumericIDs) {
      drivers = runStrategy(
        extractDriversWithEnhancedPatterns, 
        text, 
        { prioritizeAIds: true },
        drivers
      );
    }
    
    // Try line-by-line extraction
    if (drivers.length < 15) {
      drivers = runStrategy(extractDriversLineByLine, text, undefined, drivers);
    }
    
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
  
  // The main extractDriverKPIs function already tries multiple strategies
  return extractDriverKPIs(text);
};

/**
 * Extract drivers or fall back to sample data
 */
export const extractDriversOrUseSampleData = (text: string, pageData?: any): DriverKPI[] => {
  const drivers = extractDriverKPIs(text, pageData);
  return drivers;
};
