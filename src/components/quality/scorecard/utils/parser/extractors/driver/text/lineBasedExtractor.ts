
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

/**
 * Extract drivers by processing the text content line by line
 */
export const extractDriversLineByLine = (text: string): DriverKPI[] => {
  console.log("Trying line-based extraction approach");
  const lines = text.split(/\r?\n/);
  const drivers: DriverKPI[] = [];
  
  // First, identify potential driver ID patterns
  const driverIdPatterns = [
    /^([A-Z][A-Z0-9]{5,})/,         // Standard Amazon driver ID (e.g., ABCD123456)
    /^(TR[-\s]?\d{3,})/,             // TR pattern with optional dash (e.g., TR-001)
    /^([A-Z]{3}\d{5,})/              // Three letters followed by numbers (e.g., ABC12345)
  ];
  
  for (const line of lines) {
    let driverId = null;
    
    // Try all driver ID patterns
    for (const pattern of driverIdPatterns) {
      const match = line.match(pattern);
      if (match) {
        driverId = match[1].trim();
        break;
      }
    }
    
    if (driverId) {
      // Skip if it's likely a header row or doesn't look like a driver ID
      if (driverId.toLowerCase().includes('transporter') || driverId.toLowerCase() === 'id') {
        continue;
      }
      
      console.log(`Found potential driver line: ${line}`);
      
      // Try to extract all numbers and dash symbols from this line
      const valueMatches = line.match(/[\d,.]+%?|-/g) || [];
      
      if (valueMatches.length >= 3) {  // Reduced from 7 to 3 minimum metrics
        console.log(`Extracted ${valueMatches.length} metrics for driver ${driverId}`);
        
        // Create base metrics
        const metrics = [];
        
        // Map available numbers to metrics based on their likely position
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
        
        // Add metrics based on available values
        for (let i = 0; i < Math.min(valueMatches.length, metricNames.length); i++) {
          const value = valueMatches[i];
          // Handle dash case
          if (value === "-") {
            metrics.push({
              name: metricNames[i],
              value: 0,
              target: metricTargets[i],
              unit: metricUnits[i],
              status: "none"
            });
          } else {
            metrics.push({
              name: metricNames[i],
              value: extractNumeric(value),
              target: metricTargets[i],
              unit: metricUnits[i],
              status: determineStatus(metricNames[i], extractNumeric(value))
            });
          }
        }
        
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        
        console.log(`Added driver ${driverId} with ${metrics.length} metrics from line-based extraction`);
      }
    }
  }
  
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with line-based approach`);
  }
  
  return drivers;
}
