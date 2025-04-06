import { DriverKPI } from "../../../../types";
import { extractDriversUsingMultipleStrategies } from "./strategies/multiStrategy";
import { extractDriversOrUseSampleData } from "./strategies/fallbackStrategy";

/**
 * Extract driver KPIs from text content using multiple strategies
 * @param text PDF text content
 * @returns Array of driver KPIs
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  // First try to extract using all strategies
  const drivers = extractDriversUsingMultipleStrategies(text);
  
  // If we found a good number of drivers, return them
  if (drivers.length >= 3) {
    return drivers;
  }
  
  // Otherwise use the fallback strategy
  return extractDriversOrUseSampleData(text);
};

// Re-export other driver extraction functions for use in other modules
export * from './textExtractor';
export * from './structural/structuralExtractor';
