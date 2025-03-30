
import { determineStatus } from '../../../helpers/statusHelper';
import { generateSampleDrivers } from './sampleData';
import { DriverKPI } from '../../../../types';
import { extractDriversFromDSPWeeklySummary } from './text/dspWeeklySummaryExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';

/**
 * Extract driver KPIs from text content using regex patterns
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  
  // Try with DSP Weekly Summary pattern first (most structured)
  const driversFromDSPWeeklySummary = extractDriversFromDSPWeeklySummary(text);
  if (driversFromDSPWeeklySummary.length > 0) {
    console.log(`Successfully extracted ${driversFromDSPWeeklySummary.length} drivers from DSP Weekly Summary format`);
    return driversFromDSPWeeklySummary;
  }
  
  // Try with a more flexible pattern
  const driversFromFlexiblePattern = extractDriversWithFlexiblePattern(text);
  if (driversFromFlexiblePattern.length > 0) {
    console.log(`Found ${driversFromFlexiblePattern.length} drivers with flexible pattern`);
    return driversFromFlexiblePattern;
  }
  
  // Try the line-based approach as last resort
  const driversFromLineByLine = extractDriversLineByLine(text);
  if (driversFromLineByLine.length > 0) {
    console.log(`Successfully extracted ${driversFromLineByLine.length} drivers with line-based approach`);
    return driversFromLineByLine;
  }
  
  // Fall back to sample data if no drivers were found
  console.warn("No driver KPIs found in text, using sample data");
  return generateSampleDrivers();
};
