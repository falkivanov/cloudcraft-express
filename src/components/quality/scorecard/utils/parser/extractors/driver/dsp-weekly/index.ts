
import { DriverKPI } from "../../../../../types";
import { createAllStandardMetrics } from "../utils/metricUtils";
import { extractDriversFromDSPWeeklySummary, extractDriversFromFixedWidthTable } from "./extractors";
import { extractDriversWithEnhancedPatterns } from "../text/enhancedPatternExtractor";

/**
 * Main entry point for DSP Weekly Summary extraction
 * Tries multiple extraction strategies in order of reliability
 */
export function extractDriversFromDSPWeekly(text: string): DriverKPI[] {
  // First check if the text contains DSP WEEKLY SUMMARY
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY format not detected");
    return [];
  }
  
  console.log("Detected DSP WEEKLY SUMMARY format, attempting extraction");
  
  // Try the enhanced pattern matcher first (optimized for the format shown in the image)
  const enhancedDrivers = extractDriversWithEnhancedPatterns(text);
  if (enhancedDrivers.length > 5) {
    console.log(`Successfully extracted ${enhancedDrivers.length} drivers with enhanced pattern matcher`);
    return enhancedDrivers;
  }
  
  // If that didn't work well, try fixed-width extractor
  const fixedWidthDrivers = extractDriversFromFixedWidthTable(text);
  if (fixedWidthDrivers.length > 5) {
    console.log(`Successfully extracted ${fixedWidthDrivers.length} drivers with fixed-width method`);
    return fixedWidthDrivers;
  }
  
  // Fall back to standard line-based extraction
  const lineBasedDrivers = extractDriversFromDSPWeeklySummary(text);
  if (lineBasedDrivers.length > 0) {
    console.log(`Successfully extracted ${lineBasedDrivers.length} drivers with line-based method`);
    return lineBasedDrivers;
  }
  
  // If we got any drivers from any method, return the best result
  const bestResult = [enhancedDrivers, fixedWidthDrivers, lineBasedDrivers]
    .sort((a, b) => b.length - a.length)[0];
    
  if (bestResult.length > 0) {
    console.log(`Returning best result with ${bestResult.length} drivers`);
    return bestResult;
  }
  
  console.log("No drivers extracted from DSP WEEKLY SUMMARY format");
  return [];
}

/**
 * Ensure all drivers have complete metrics
 */
export function getDriversWithCompleteMetrics(drivers: DriverKPI[]): DriverKPI[] {
  return drivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics(driver.metrics)
  }));
}
