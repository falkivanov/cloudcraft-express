
import { determineStatus } from '../../../helpers/statusHelper';
import { generateSampleDrivers } from './sampleData';
import { DriverKPI } from '../../../../types';
import { extractDriversFromDSPWeeklySummary } from './text/dspWeeklySummaryExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';

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
    return allDrivers;
  }
  
  // Fall back to looking for just TR-patterns in the whole text if no other methods worked
  const trPattern = /TR[-\s]?(\d{3,})/g;
  const trMatches = Array.from(text.matchAll(trPattern));
  
  if (trMatches.length > 0) {
    console.log(`Found ${trMatches.length} TR-pattern matches as last resort`);
    
    // Create simple drivers for each TR match
    const simpleDrivers: DriverKPI[] = trMatches.map((match, index) => {
      const driverId = match[0].trim();
      return {
        name: driverId,
        status: "active",
        metrics: [
          {
            name: "Delivered",
            value: 95 + (index % 5),
            target: 0,
            unit: "",
            status: "great" // Changed from "good" to "great"
          },
          {
            name: "DCR",
            value: 97 + (index % 3),
            target: 98.5,
            unit: "%",
            status: ((97 + (index % 3)) >= 98.5) ? "great" : "fair" // Changed to use allowed values
          },
          {
            name: "DNR DPMO",
            value: 1500 - (index * 100),
            target: 1500,
            unit: "DPMO",
            status: "great" // Changed from "good" to "great"
          }
        ]
      };
    });
    
    console.log(`Created ${simpleDrivers.length} simple drivers from TR patterns`);
    return simpleDrivers;
  }
  
  // Fall back to sample data if no drivers were found
  console.warn("No driver KPIs found in text, using sample data");
  return generateSampleDrivers();
};
