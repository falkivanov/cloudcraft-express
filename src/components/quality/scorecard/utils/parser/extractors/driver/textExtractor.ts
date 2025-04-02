
import { DriverKPI } from '../../../../types';
import { generateSampleDrivers } from './sampleData';
import { extractDriversFromDSPWeeklySummary } from './text/dspWeeklySummaryExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { ensureAllMetrics } from './utils/metricUtils';

/**
 * Extract driver KPIs from text content using multiple strategies
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  
  // First, prioritize the DSP Weekly Summary format as per requirements
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found 'DSP WEEKLY SUMMARY' in text, prioritizing this extraction method");
    
    const driversFromDSPWeeklySummary = extractDriversFromDSPWeeklySummary(text);
    if (driversFromDSPWeeklySummary.length > 0) {
      console.log(`Successfully extracted ${driversFromDSPWeeklySummary.length} drivers from DSP Weekly Summary format`);
      
      // Ensure each driver has all 7 standard metrics
      return ensureAllMetrics(driversFromDSPWeeklySummary);
    }
  }
  
  // If DSP Weekly Summary extraction didn't work, try other methods
  // Collect all drivers from different extraction methods
  let allDrivers: DriverKPI[] = [];
  
  // Try with a more flexible pattern
  const driversFromFlexiblePattern = extractDriversWithFlexiblePattern(text);
  if (driversFromFlexiblePattern.length > 0) {
    console.log(`Found ${driversFromFlexiblePattern.length} drivers with flexible pattern`);
    allDrivers = [...allDrivers, ...driversFromFlexiblePattern];
  }
  
  // Try the line-based approach
  const driversFromLineByLine = extractDriversLineByLine(text);
  if (driversFromLineByLine.length > 0) {
    console.log(`Successfully extracted ${driversFromLineByLine.length} drivers with line-based approach`);
    
    // Add only new drivers that weren't found in previous methods
    driversFromLineByLine.forEach(newDriver => {
      if (!allDrivers.some(existing => existing.name === newDriver.name)) {
        allDrivers.push(newDriver);
      }
    });
  }
  
  // If we found at least one driver with any method, return the combined results
  if (allDrivers.length > 0) {
    console.log(`Successfully extracted ${allDrivers.length} unique drivers in total`);
    
    // Ensure each driver has all 7 standard metrics
    allDrivers = ensureAllMetrics(allDrivers);
    
    // Only use specific extraction if we found multiple drivers or have high confidence
    if (allDrivers.length > 1) {
      return allDrivers;
    }
  }
  
  // Try enhanced pattern extraction specifically for A-prefixed IDs
  const enhancedOptions = {
    prioritizeAIds: true // Add this option to prioritize IDs starting with 'A'
  };
  
  const driversFromEnhancedPatterns = extractDriversWithEnhancedPatterns(text, enhancedOptions);
  if (driversFromEnhancedPatterns.length > 0) {
    return driversFromEnhancedPatterns;
  }
  
  // Fall back to sample data if no drivers were found
  console.warn("No driver KPIs found in text, using sample data");
  return generateSampleDrivers();
};
