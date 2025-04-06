
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

type MetricStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Extract drivers from text using a flexible pattern matching approach
 */
export const extractDriversWithFlexiblePattern = (text: string): DriverKPI[] => {
  console.log("Trying flexible pattern extraction approach");
  const drivers: DriverKPI[] = [];
  
  // Common patterns for driver IDs that we want to match
  const driverIdPattern = /([A-Z][A-Z0-9]{5,}|TR[-\s]?\d{3,}|[A-Z]{3}\d{5,})/g;
  
  // All numbers including decimals and dash symbols
  const numbersPattern = /([\d,.]+%?|-|\b\d+\b)/g;
  
  // Split text into lines to process each driver separately
  const lines = text.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 5) continue;
    
    // Look for driver ID pattern at the start of the line
    const idMatch = line.match(new RegExp(`^${driverIdPattern.source}`));
    if (!idMatch) continue;
    
    const driverId = idMatch[0].trim();
    
    // Skip if it's likely a header row or doesn't look like a driver ID
    if (driverId.toLowerCase().includes('transporter') || 
        driverId.toLowerCase() === 'id' ||
        driverId.length < 4) {
      continue;
    }
    
    console.log(`Found potential driver ID: ${driverId}`);
    
    // Extract all numbers in this line
    const metrics: any[] = [];
    const values = line.match(numbersPattern) || [];
    
    // Skip the first match if it's part of the ID itself
    const valueStartIndex = (driverId.match(/\d+/)) ? 1 : 0;
    
    if (values.length >= 3 + valueStartIndex) { // At least 3 metrics
      console.log(`Found ${values.length} potential values for ${driverId}`);
      
      // Define metric names and targets
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
      const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
      const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
      
      // Process the values we found
      let validValuesCount = 0;
      
      for (let j = valueStartIndex; j < values.length && validValuesCount < metricNames.length; j++) {
        const value = values[j];
        
        // Handle dash case
        if (value === "-") {
          metrics.push({
            name: metricNames[validValuesCount],
            value: 0,
            target: metricTargets[validValuesCount],
            unit: metricUnits[validValuesCount],
            status: "none" as MetricStatus
          });
        } else {
          // Skip if not a valid numeric value
          const numValue = extractNumeric(value);
          if (isNaN(numValue)) continue;
          
          metrics.push({
            name: metricNames[validValuesCount],
            value: numValue,
            target: metricTargets[validValuesCount],
            unit: metricUnits[validValuesCount],
            status: determineStatus(metricNames[validValuesCount], numValue)
          });
        }
        
        validValuesCount++;
      }
      
      if (metrics.length >= 3) {
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        console.log(`Added driver ${driverId} with ${metrics.length} metrics`);
      }
    }
  }
  
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with flexible pattern approach`);
  }
  
  return drivers;
}
