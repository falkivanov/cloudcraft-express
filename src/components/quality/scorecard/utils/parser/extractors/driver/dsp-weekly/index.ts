import { DriverKPI } from "../../../../types";
import { createAllStandardMetrics } from "../utils/metricUtils";
import { extractDriversFromDSPWeeklySummary, extractDriversFromFixedWidthTable } from "./extractors";

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
  
  // First try fixed-width extractor (more reliable when format matches)
  const fixedWidthDrivers = extractDriversFromFixedWidthTable(text);
  if (fixedWidthDrivers.length > 0) {
    console.log(`Successfully extracted ${fixedWidthDrivers.length} drivers with fixed-width method`);
    return fixedWidthDrivers;
  }
  
  // Fall back to standard line-based extraction
  const lineBasedDrivers = extractDriversFromDSPWeeklySummary(text);
  if (lineBasedDrivers.length > 0) {
    console.log(`Successfully extracted ${lineBasedDrivers.length} drivers with line-based method`);
    return lineBasedDrivers;
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
    metrics: createAllStandardMetrics()
  }));
}
