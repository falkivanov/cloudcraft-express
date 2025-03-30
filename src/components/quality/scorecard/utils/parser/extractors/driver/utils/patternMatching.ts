
import { DriverKPI } from '../../../../../types';
import { determineMetricStatus } from './metricStatus';
import { METRIC_NAMES, METRIC_TARGETS, METRIC_UNITS } from './metricDefinitions';

/**
 * Extract driver KPIs using direct pattern matching for tabular data
 */
export function extractDriversWithTablePattern(text: string): DriverKPI[] {
  console.log("Attempting direct table pattern extraction from text");
  const extractedDrivers: DriverKPI[] = [];
  
  // Pattern matching for driver data in tabular format
  const driverTablePattern = /\b([A-Z0-9]{6,}|TR[-\s]?\d{3,})\s+([\d.,]+)%?\s+([\d.,]+)%?\s+([\d.,]+)%?\s+([\d.,]+)%?/g;
  
  const matches = Array.from(text.matchAll(driverTablePattern));
  if (matches.length > 0) {
    console.log(`Found ${matches.length} driver matches in table format`);
    
    for (const match of matches) {
      const driverId = match[1].trim();
      
      // Skip if we already have this driver
      if (extractedDrivers.some(d => d.name === driverId)) {
        continue;
      }
      
      // Clean and convert metrics values
      const values = [];
      for (let i = 2; i < match.length; i++) {
        if (match[i]) {
          values.push(parseFloat(match[i].replace(',', '.')));
        }
      }
      
      if (values.length >= 3) {  // At least 3 metrics to be considered valid
        const metrics = [];
        
        // Create metrics with values from the pattern match
        for (let i = 0; i < Math.min(values.length, METRIC_NAMES.length); i++) {
          metrics.push({
            name: METRIC_NAMES[i],
            value: values[i],
            target: METRIC_TARGETS[i],
            unit: METRIC_UNITS[i],
            status: determineMetricStatus(METRIC_NAMES[i], values[i])
          });
        }
        
        extractedDrivers.push({
          name: driverId,
          status: "active",
          metrics
        });
      }
    }
  }
  
  return extractedDrivers;
}

/**
 * Extract driver KPIs using line-by-line pattern matching
 */
export function extractDriversLineByLine(text: string): DriverKPI[] {
  console.log("Attempting line-by-line driver extraction");
  const extractedDrivers: DriverKPI[] = [];
  
  // Split the text into lines
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Look for driver ID patterns at the beginning of lines
    const driverIdPatterns = [
      /^([A-Z][A-Z0-9]{5,})\s/,  // Standard driver ID format
      /^(TR[-\s]?\d{3,})\s/      // TR format with numbers
    ];
    
    let driverId = null;
    
    // Try each pattern until we find a match
    for (const pattern of driverIdPatterns) {
      const match = line.match(pattern);
      if (match) {
        driverId = match[1].trim();
        break;
      }
    }
    
    if (driverId) {
      // Skip if we already have this driver
      if (extractedDrivers.some(d => d.name === driverId)) {
        continue;
      }
      
      // Try to extract all numbers from the line
      const numberMatches = line.match(/(\d+[.,]?\d*)/g);
      if (numberMatches && numberMatches.length >= 3) {
        console.log(`Found driver ${driverId} with ${numberMatches.length} metrics`);
        
        const metrics = [];
        
        // Create metrics with available values
        for (let i = 0; i < Math.min(numberMatches.length, METRIC_NAMES.length); i++) {
          const value = parseFloat(numberMatches[i].replace(',', '.'));
          metrics.push({
            name: METRIC_NAMES[i],
            value: value,
            target: METRIC_TARGETS[i],
            unit: METRIC_UNITS[i],
            status: determineMetricStatus(METRIC_NAMES[i], value)
          });
        }
        
        extractedDrivers.push({
          name: driverId,
          status: "active",
          metrics
        });
      }
    }
  }
  
  return extractedDrivers;
}

/**
 * Enhanced pattern matching for specific driver KPI formats
 */
export function extractDriversWithEnhancedPattern(text: string): DriverKPI[] {
  console.log("Attempting enhanced pattern matching for driver KPIs");
  const extractedDrivers: DriverKPI[] = [];
  
  // Try looking for TR or standard driver IDs followed by metrics
  const enhancedDriverPattern = /\b([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,})\b[\s\n]+([\d.,]+)[\s\n]+([\d.,]+)[\s\n]+([\d.,]+)/g;
  const enhancedMatches = Array.from(text.matchAll(enhancedDriverPattern));
  
  if (enhancedMatches.length > 0) {
    console.log(`Found ${enhancedMatches.length} drivers with enhanced pattern`);
    
    for (const match of enhancedMatches) {
      const driverId = match[1].trim();
      
      // Skip if we already have this driver
      if (extractedDrivers.some(d => d.name === driverId)) {
        continue;
      }
      
      const metrics = [];
      
      for (let i = 0; i < 3; i++) {
        const valueIndex = i + 2;
        if (match[valueIndex]) {
          const value = parseFloat(match[valueIndex].replace(',', '.'));
          metrics.push({
            name: METRIC_NAMES[i],
            value: value,
            target: METRIC_TARGETS[i],
            unit: METRIC_UNITS[i],
            status: determineMetricStatus(METRIC_NAMES[i], value)
          });
        }
      }
      
      if (metrics.length > 0) {
        extractedDrivers.push({
          name: driverId,
          status: "active",
          metrics
        });
      }
    }
  }
  
  return extractedDrivers;
}
