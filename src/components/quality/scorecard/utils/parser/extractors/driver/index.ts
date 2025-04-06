
import { DriverKPI } from "../../../../types";
import { extractDriverKPIsFromText } from "./textExtractor";
import { extractDriversFromDSPWeekly } from "./dsp-weekly";
import { extractDriversWithEnhancedPatterns } from "./text/enhancedPatternExtractor";
import { extractDriversWithFlexiblePattern } from "./text/flexiblePatternExtractor";
import { tryAllExtractionStrategies } from "./strategies/multiStrategy";
import { createAllStandardMetrics } from "./utils/metricUtils";

/**
 * Enhanced extraction for driver KPIs that tries multiple strategies
 * to maximize the chances of finding all drivers in different PDF formats
 */
export const extractDriverKPIs = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Starting enhanced driver extraction");
  let allDrivers: DriverKPI[] = [];
  let bestDriverCount = 0;
  
  // Try DSP Weekly Summary format first (most structured)
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Detected DSP WEEKLY SUMMARY format");
    const dspDrivers = extractDriversFromDSPWeekly(text);
    
    if (dspDrivers.length > bestDriverCount) {
      console.log(`Found ${dspDrivers.length} drivers with DSP WEEKLY SUMMARY extraction`);
      allDrivers = dspDrivers;
      bestDriverCount = dspDrivers.length;
    }
  }
  
  // Try enhanced pattern extraction (tailored to specific formats)
  if (bestDriverCount < 40) {
    console.log("Trying enhanced pattern extraction");
    const enhancedDrivers = extractDriversWithEnhancedPatterns(text);
    
    if (enhancedDrivers.length > bestDriverCount) {
      console.log(`Found ${enhancedDrivers.length} drivers with enhanced pattern extraction`);
      allDrivers = enhancedDrivers;
      bestDriverCount = enhancedDrivers.length;
    }
  }
  
  // Try flexible pattern extraction (more generic but less accurate)
  if (bestDriverCount < 40) {
    console.log("Trying flexible pattern extraction");
    const flexibleDrivers = extractDriversWithFlexiblePattern(text);
    
    if (flexibleDrivers.length > bestDriverCount) {
      console.log(`Found ${flexibleDrivers.length} drivers with flexible pattern extraction`);
      allDrivers = flexibleDrivers;
      bestDriverCount = flexibleDrivers.length;
    }
  }
  
  // Try basic text extraction
  if (bestDriverCount < 40) {
    console.log("Trying basic text extraction");
    const textDrivers = extractDriverKPIsFromText(text);
    
    if (textDrivers.length > bestDriverCount) {
      console.log(`Found ${textDrivers.length} drivers with basic text extraction`);
      allDrivers = textDrivers;
      bestDriverCount = textDrivers.length;
    }
  }
  
  // Try all strategies as last resort
  if (bestDriverCount < 40) {
    console.log("Trying combined multi-strategy approach");
    const multiStrategyDrivers = tryAllExtractionStrategies(text);
    
    if (multiStrategyDrivers.length > bestDriverCount) {
      console.log(`Found ${multiStrategyDrivers.length} drivers with multi-strategy approach`);
      allDrivers = multiStrategyDrivers;
      bestDriverCount = multiStrategyDrivers.length;
    }
  }
  
  // Extract all A-prefixed IDs as a fallback
  if (bestDriverCount < 20) {
    console.log("Attempting extraction of all A-prefixed IDs as fallback");
    const aPrefixPattern = /\b(A[A-Z0-9]{5,13})\b/g;
    const matches = Array.from(text.matchAll(aPrefixPattern));
    
    if (matches.length > bestDriverCount) {
      console.log(`Found ${matches.length} A-prefixed IDs`);
      
      const seenIds = new Set();
      const fallbackDrivers: DriverKPI[] = [];
      
      matches.forEach(match => {
        const driverId = match[1];
        
        // Skip duplicates and IDs that might be codes but not drivers
        if (!seenIds.has(driverId) && 
            !driverId.includes('PAGE') && 
            !driverId.includes('SUMMARY') &&
            driverId.length >= 7) {
          
          seenIds.add(driverId);
          
          // Create a basic driver object with default metrics
          fallbackDrivers.push({
            name: driverId,
            status: "active",
            metrics: [
              { name: "Delivered", value: 0, target: 0, unit: "", status: "neutral" },
              { name: "DCR", value: 0, target: 98.5, unit: "%", status: "none" },
              { name: "DNR DPMO", value: 0, target: 1500, unit: "DPMO", status: "none" },
              { name: "POD", value: 0, target: 98, unit: "%", status: "none" },
              { name: "CC", value: 0, target: 95, unit: "%", status: "none" },
              { name: "CE", value: 0, target: 0, unit: "", status: "none" },
              { name: "DEX", value: 0, target: 95, unit: "%", status: "none" }
            ]
          });
        }
      });
      
      if (fallbackDrivers.length > bestDriverCount) {
        allDrivers = fallbackDrivers;
        bestDriverCount = fallbackDrivers.length;
      }
    }
  }
  
  console.log(`Final extraction result: ${allDrivers.length} drivers`);
  
  // Ensure all drivers have complete metrics
  const completeDrivers = allDrivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics(driver.metrics)
  }));
  
  return completeDrivers;
};

/**
 * Generate sample drivers for testing
 * @returns Array of sample driver KPIs
 */
export const generateSampleDrivers = (): DriverKPI[] => {
  // Generate a few sample driver records for testing
  return Array(5).fill(0).map((_, index) => ({
    name: `A${String(index + 1).padStart(3, '0')}SAMPLE`,
    status: "active",
    metrics: [
      { name: "Delivered", value: 850 + index * 20, target: 0, unit: "", status: "neutral" },
      { name: "DCR", value: 97 + index * 0.5, target: 98.5, unit: "%", status: index > 1 ? "great" : "fair" },
      { name: "DNR DPMO", value: 2000 - index * 250, target: 1500, unit: "DPMO", status: index > 2 ? "great" : "poor" },
      { name: "POD", value: 96 + index * 0.7, target: 98, unit: "%", status: index > 1 ? "great" : "fair" },
      { name: "CC", value: 93 + index, target: 95, unit: "%", status: index > 1 ? "great" : "fair" },
      { name: "CE", value: index > 3 ? 1 : 0, target: 0, unit: "", status: index > 3 ? "poor" : "great" },
      { name: "DEX", value: 91 + index, target: 95, unit: "%", status: index > 3 ? "great" : "fair" }
    ]
  }));
};

/**
 * Ensure all drivers have a complete set of metrics
 * @param drivers Array of driver KPIs
 * @returns Array with complete metrics
 */
export const ensureAllMetrics = (drivers: DriverKPI[]): DriverKPI[] => {
  return drivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics(driver.metrics)
  }));
};
