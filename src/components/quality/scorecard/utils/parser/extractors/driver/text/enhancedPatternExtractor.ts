
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { createAllStandardMetrics } from '../utils/metricUtils';

type MetricStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Extract drivers with enhanced pattern matching, designed to work with various PDF formats
 */
export const extractDriversWithEnhancedPatterns = (text: string): DriverKPI[] => {
  console.log("Starting enhanced pattern driver extraction");
  const drivers: DriverKPI[] = [];
  const knownDriverIds = new Set<string>();
  
  // Split text into sections to process them separately
  const sections = text.split(/\n{3,}/);
  
  // Try multiple approaches on each section
  for (const section of sections) {
    // Skip short sections
    if (section.length < 50) continue;
    
    // First approach: Look for driver ID followed by metrics in the same line
    extractDriversWithLinePattern(section, drivers, knownDriverIds);
    
    // Second approach: Look for tabular format with columns
    extractDriversFromTabularData(section, drivers, knownDriverIds);
    
    // Third approach: Look for driver IDs and values in consecutive lines
    extractDriversFromConsecutiveLines(section, drivers, knownDriverIds);
  }
  
  // Try extracting drivers with standard-table patterns (common in DSP reports)
  extractDriversFromStandardTable(text, drivers, knownDriverIds);
  
  // Look for any standalone driver IDs that might have been missed
  extractMissedDriverIds(text, drivers, knownDriverIds);
  
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with enhanced patterns`);
  }
  
  // Ensure all drivers have complete metric sets
  return drivers.map(driver => {
    // Complete any missing metrics
    if (driver.metrics.length < 7) {
      return {
        ...driver,
        metrics: createAllStandardMetrics(driver.metrics)
      };
    }
    return driver;
  });
};

/**
 * Extract drivers where ID and metrics are on a single line
 */
function extractDriversWithLinePattern(
  text: string, 
  drivers: DriverKPI[], 
  knownDriverIds: Set<string>
) {
  // Try to match driver ID followed by multiple numbers on the same line
  const linePattern = /\b([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,})[^\n\d]+((?:\d+(?:\.\d+)?[%\s]*)+)/g;
  const matches = Array.from(text.matchAll(linePattern));
  
  for (const match of matches) {
    const driverId = match[1].trim();
    
    // Skip if already processed or looks like a header
    if (knownDriverIds.has(driverId) || 
        isLikelyHeader(driverId)) {
      continue;
    }
    
    // Extract numbers from the metrics part
    const metricsText = match[2];
    const numberMatches = metricsText.match(/\d+(?:\.\d+)?/g);
    
    if (numberMatches && numberMatches.length >= 3) {
      const metrics = createMetricsFromValues(numberMatches);
      
      drivers.push({
        name: driverId,
        status: "active",
        metrics
      });
      
      knownDriverIds.add(driverId);
    }
  }
}

/**
 * Extract drivers from tabular data with column structure
 */
function extractDriversFromTabularData(
  text: string, 
  drivers: DriverKPI[], 
  knownDriverIds: Set<string>
) {
  // Try to detect table rows with a driver ID in first column
  const lines = text.split('\n');
  
  // Process each line as a potential table row
  for (const line of lines) {
    // Skip short lines
    if (line.length < 15) continue;
    
    // Look for a driver ID pattern at the start of the line
    const idMatch = line.match(/^\s*([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,})/);
    
    if (idMatch) {
      const driverId = idMatch[1].trim();
      
      // Skip if already processed or looks like a header
      if (knownDriverIds.has(driverId) || 
          isLikelyHeader(driverId)) {
        continue;
      }
      
      // Extract all numbers from this line
      const numberMatches = line.match(/\d+(?:\.\d+)?/g);
      
      if (numberMatches && numberMatches.length >= 3) {
        const metrics = createMetricsFromValues(numberMatches);
        
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        
        knownDriverIds.add(driverId);
      }
    }
  }
}

/**
 * Extract drivers from consecutive lines (ID on one line, metrics on next)
 */
function extractDriversFromConsecutiveLines(
  text: string, 
  drivers: DriverKPI[], 
  knownDriverIds: Set<string>
) {
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length - 1; i++) {
    // Look for a line with just a driver ID
    const idMatch = lines[i].match(/^\s*([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,})\s*$/);
    
    if (idMatch) {
      const driverId = idMatch[1].trim();
      
      // Skip if already processed or looks like a header
      if (knownDriverIds.has(driverId) || 
          isLikelyHeader(driverId)) {
        continue;
      }
      
      // Check next line for metrics
      const metricsLine = lines[i + 1];
      const numberMatches = metricsLine.match(/\d+(?:\.\d+)?/g);
      
      if (numberMatches && numberMatches.length >= 3) {
        const metrics = createMetricsFromValues(numberMatches);
        
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        
        knownDriverIds.add(driverId);
      }
    }
  }
}

/**
 * Extract drivers from a standard table format commonly used in DSP reports
 */
function extractDriversFromStandardTable(
  text: string, 
  drivers: DriverKPI[], 
  knownDriverIds: Set<string>
) {
  // This pattern looks for rows where columns are separated by multiple spaces
  const tableRowPattern = /\b([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,})\s{2,}(\d+(?:\.\d+)?)\s{2,}(\d+(?:\.\d+)?)\s{2,}(\d+(?:\.\d+)?)/g;
  const matches = Array.from(text.matchAll(tableRowPattern));
  
  if (matches.length > 5) {
    console.log(`Found ${matches.length} potential rows in standard table format`);
    
    for (const match of matches) {
      const driverId = match[1].trim();
      
      // Skip if already processed or looks like a header
      if (knownDriverIds.has(driverId) || 
          isLikelyHeader(driverId)) {
        continue;
      }
      
      // Use exact column values from the table
      const values = [match[2], match[3], match[4]];
      
      // Look for more values in the same row if available
      const additionalValues = [];
      let currentIndex = match.index! + match[0].length;
      const restOfLine = text.substring(currentIndex, text.indexOf('\n', currentIndex));
      
      const moreNumbers = restOfLine.match(/\d+(?:\.\d+)?/g);
      if (moreNumbers) {
        additionalValues.push(...moreNumbers);
      }
      
      // Combine all values
      const allValues = [...values, ...additionalValues];
      const metrics = createMetricsFromValues(allValues);
      
      drivers.push({
        name: driverId,
        status: "active",
        metrics
      });
      
      knownDriverIds.add(driverId);
    }
  }
}

/**
 * Look for any missed driver IDs and extract them
 */
function extractMissedDriverIds(
  text: string, 
  drivers: DriverKPI[], 
  knownDriverIds: Set<string>
) {
  // This is a last resort to find any driver IDs that might have been missed
  const driverIdPattern = /\b([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,})\b/g;
  const matches = Array.from(text.matchAll(driverIdPattern));
  
  if (matches.length > 0) {
    for (const match of matches) {
      const driverId = match[0].trim();
      
      // Skip if already processed or looks like a header
      if (knownDriverIds.has(driverId) || 
          isLikelyHeader(driverId)) {
        continue;
      }
      
      // Look for numbers near this ID
      const startIndex = Math.max(0, match.index! - 30);
      const endIndex = Math.min(text.length, match.index! + 150);
      const context = text.substring(startIndex, endIndex);
      
      const numberMatches = context.match(/\d+(?:\.\d+)?/g);
      
      if (numberMatches && numberMatches.length >= 3) {
        const metrics = createMetricsFromValues(numberMatches);
        
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        
        knownDriverIds.add(driverId);
      }
    }
  }
}

/**
 * Check if a string is likely to be a header row rather than a driver ID
 */
function isLikelyHeader(text: string): boolean {
  const headerKeywords = ['driver', 'id', 'transporter', 'name', 'header', 'title', 'kpi', 'metrics'];
  const lowercaseText = text.toLowerCase();
  
  return headerKeywords.some(keyword => lowercaseText.includes(keyword)) ||
         text.length < 4 ||
         lowercaseText === 'id';
}

/**
 * Create metrics from an array of string values
 */
function createMetricsFromValues(values: string[]): any[] {
  const metrics = [];
  
  // Standard metrics that should be present
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  // Add metrics based on values available
  for (let i = 0; i < Math.min(values.length, metricNames.length); i++) {
    try {
      const value = parseFloat(values[i]);
      
      // Skip if not a valid number
      if (isNaN(value)) continue;
      
      metrics.push({
        name: metricNames[i],
        value: value,
        target: metricTargets[i],
        unit: metricUnits[i],
        status: determineStatus(metricNames[i], value)
      });
    } catch (e) {
      console.warn(`Error parsing value for ${metricNames[i]}: ${values[i]}`);
    }
  }
  
  return metrics;
}
