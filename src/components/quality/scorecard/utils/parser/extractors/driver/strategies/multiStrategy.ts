
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIs } from '../';
import { extractDriverKPIsFromStructure } from '../structural/structuralExtractor';
import { extractDriversWithEnhancedPatterns } from '../text/enhancedPatternExtractor';
import { extractDriversLineByLine } from '../text/lineBasedExtractor';
import { ensureAllMetrics } from '../utils/metricUtils';

/**
 * Extract drivers using multiple strategies and combine results
 */
export const extractDriversWithCombinedStrategies = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Attempting driver extraction with combined strategies approach");
  
  // Start with an empty result set
  let allDrivers: DriverKPI[] = [];
  let existingDriverNames = new Set<string>();
  
  // Try structure-based extraction if we have page data
  if (pageData) {
    console.log("Trying structural extraction with page data");
    const structuralDrivers = extractDriverKPIsFromStructure(pageData);
    
    if (structuralDrivers.length > 0) {
      console.log(`Found ${structuralDrivers.length} drivers with structural extraction`);
      
      // Add all structural drivers
      allDrivers = [...structuralDrivers];
      existingDriverNames = new Set(allDrivers.map(d => d.name));
    }
  }
  
  // Try enhanced pattern extraction next
  console.log("Trying enhanced pattern extraction");
  const patternDrivers = extractDriversWithEnhancedPatterns(text, { prioritizeAIds: true });
  
  if (patternDrivers.length > 0) {
    console.log(`Found ${patternDrivers.length} drivers with enhanced pattern extraction`);
    
    // Add drivers that don't already exist
    for (const driver of patternDrivers) {
      if (!existingDriverNames.has(driver.name)) {
        allDrivers.push(driver);
        existingDriverNames.add(driver.name);
      }
    }
  }
  
  // Try line-based extraction
  console.log("Trying line-based extraction");
  const lineBasedDrivers = extractDriversLineByLine(text);
  
  if (lineBasedDrivers.length > 0) {
    console.log(`Found ${lineBasedDrivers.length} drivers with line-based extraction`);
    
    // Add drivers that don't already exist
    for (const driver of lineBasedDrivers) {
      if (!existingDriverNames.has(driver.name)) {
        allDrivers.push(driver);
        existingDriverNames.add(driver.name);
      }
    }
  }
  
  // If we found any drivers, ensure they all have complete metrics
  if (allDrivers.length > 0) {
    console.log(`Returning ${allDrivers.length} drivers from combined strategies`);
    return ensureAllMetrics(allDrivers);
  }
  
  // If all specialized methods failed, fall back to the main extraction function
  console.log("All specialized methods failed, falling back to main extraction function");
  return extractDriverKPIs(text, pageData);
};

/**
 * Legacy compatibility function - export this to fix the error
 */
export const tryAllExtractionStrategies = (text: string): DriverKPI[] => {
  return extractDriverKPIs(text);
};

/**
 * Legacy compatibility function
 */
export const tryAllStrategiesForDriver = (text: string): DriverKPI[] => {
  return extractDriverKPIs(text);
};
