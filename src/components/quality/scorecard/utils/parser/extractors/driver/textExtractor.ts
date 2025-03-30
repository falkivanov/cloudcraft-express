
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
  
  // Collect all drivers from different extraction methods
  let allDrivers: DriverKPI[] = [];
  
  // Try with DSP Weekly Summary pattern first (most structured)
  const driversFromDSPWeeklySummary = extractDriversFromDSPWeeklySummary(text);
  if (driversFromDSPWeeklySummary.length > 0) {
    console.log(`Successfully extracted ${driversFromDSPWeeklySummary.length} drivers from DSP Weekly Summary format`);
    allDrivers = [...allDrivers, ...driversFromDSPWeeklySummary];
  }
  
  // Try with a more flexible pattern
  const driversFromFlexiblePattern = extractDriversWithFlexiblePattern(text);
  if (driversFromFlexiblePattern.length > 0) {
    console.log(`Found ${driversFromFlexiblePattern.length} drivers with flexible pattern`);
    
    // Add only new drivers that weren't found in previous methods
    driversFromFlexiblePattern.forEach(newDriver => {
      if (!allDrivers.some(existing => existing.name === newDriver.name)) {
        allDrivers.push(newDriver);
      }
    });
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
  
  // Try enhanced pattern extraction
  const driversFromEnhancedPatterns = extractDriversWithEnhancedPatterns(text);
  if (driversFromEnhancedPatterns.length > 0) {
    return driversFromEnhancedPatterns;
  }
  
  // Fall back to sample data if no drivers were found
  console.warn("No driver KPIs found in text, using sample data");
  return generateSampleDrivers();
};
