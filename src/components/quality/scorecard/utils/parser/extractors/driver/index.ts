
import { DriverKPI } from '../../../../types';
import { extractDriversFromDSPWeekly } from './dsp-weekly';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { ensureAllMetrics } from './utils/metricUtils';
import { extractDriverKPIsFromText } from './textExtractor';

/**
 * Extract driver KPIs from text content using multiple strategies
 * @param text Text content from which to extract driver KPIs
 * @param pageData Optional structured page data for enhanced extraction
 * @returns Array of DriverKPIs
 */
export const extractDriverKPIs = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Starting driver KPI extraction with multiple strategies");
  
  let drivers: DriverKPI[] = [];
  
  // First check if we have the DSP WEEKLY SUMMARY format that we see in the image
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY format detected, using specialized extractor");
    drivers = extractDriversFromDSPWeekly(text);
    
    // If we found a good number of drivers, return them
    if (drivers.length > 10) {
      console.log(`DSP WEEKLY SUMMARY extraction successful, found ${drivers.length} drivers`);
      return drivers;
    }
    
    if (drivers.length > 0) {
      console.log(`DSP WEEKLY SUMMARY extraction found ${drivers.length} drivers, but trying more methods`);
    }
  }
  
  // If DSP WEEKLY format didn't yield good results, try the enhanced pattern extractor
  console.log("Trying enhanced pattern extractor");
  const enhancedDrivers = extractDriversWithEnhancedPatterns(text);
  
  if (enhancedDrivers.length > drivers.length) {
    console.log(`Enhanced pattern extraction found ${enhancedDrivers.length} drivers, using these results`);
    drivers = enhancedDrivers;
    
    // If we found a good number of drivers, return them
    if (drivers.length > 10) {
      return drivers;
    }
  }
  
  // Try line-based extraction
  console.log("Trying line-based extraction");
  const lineBasedDrivers = extractDriversLineByLine(text);
  
  if (lineBasedDrivers.length > drivers.length) {
    console.log(`Line-based extraction found ${lineBasedDrivers.length} drivers, using these results`);
    drivers = lineBasedDrivers;
    
    // If we found a good number of drivers, return them
    if (drivers.length > 10) {
      return drivers;
    }
  }
  
  // Try flexible pattern extraction
  console.log("Trying flexible pattern extraction");
  const flexibleDrivers = extractDriversWithFlexiblePattern(text);
  
  if (flexibleDrivers.length > drivers.length) {
    console.log(`Flexible pattern extraction found ${flexibleDrivers.length} drivers, using these results`);
    drivers = flexibleDrivers;
  }
  
  // If we still don't have many drivers, try the original extractor as a fallback
  if (drivers.length < 5) {
    console.log("Few drivers found with new extractors, trying original extractor");
    const originalDrivers = extractDriverKPIsFromText(text);
    
    if (originalDrivers.length > drivers.length) {
      console.log(`Original extractor found ${originalDrivers.length} drivers, using these results`);
      drivers = originalDrivers;
    }
  }
  
  // Ensure all drivers have complete metrics
  console.log(`Final driver extraction result: ${drivers.length} drivers`);
  return ensureAllMetrics(drivers);
};

export {
  generateSampleDrivers,
  determineMetricStatus,
  ensureAllMetrics
} from './driver';
