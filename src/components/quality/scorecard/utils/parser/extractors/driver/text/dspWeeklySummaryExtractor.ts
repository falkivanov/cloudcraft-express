import { DriverKPI } from '../../../../../types';
import { determineMetricStatus } from '../utils/metricStatus';
import { createAllStandardMetrics } from '../utils/metricUtils';

/**
 * Extract drivers from DSP Weekly Summary format text
 */
export function extractDriversFromDSPWeeklySummary(text: string): DriverKPI[] {
  console.log("Extracting drivers from DSP Weekly Summary format");
  
  // Multiple pattern matching to catch different variations
  const drivers: DriverKPI[] = [];
  
  // Primary pattern - look for the table section after "DSP WEEKLY SUMMARY"
  const summaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  if (summaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY not found in text");
    return [];
  }
  
  // Extract relevant text section
  const relevantText = text.substring(summaryIndex);
  
  // Split into lines
  const lines = relevantText.split('\n');
  
  // Flag to track when we're in the drivers section
  let inDriverSection = false;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this line contains header information
    if (line.match(/transporter|id|delivered|dcr|dnr|dpmo|pod|cc|ce|dex/i) && !inDriverSection) {
      inDriverSection = true;
      console.log("Found driver table header: " + line);
      continue;
    }
    
    // If we're in the driver section, look for driver IDs
    if (inDriverSection) {
      // Look for driver ID at the start of the line (starting with A)
      const driverMatch = line.match(/^(A[A-Z0-9]+)/);
      
      if (driverMatch) {
        const driverId = driverMatch[1];
        console.log("Found driver ID: " + driverId);
        
        // Now extract metrics - look for series of numbers
        const metrics = [];
        const metricNames = ['Delivered', 'DCR', 'DNR DPMO', 'POD', 'CC', 'CE', 'DEX'];
        
        // Extract numbers from the line
        const numberMatches = line.match(/\b\d+(?:\.\d+)?%?\b/g);
        
        if (numberMatches && numberMatches.length > 0) {
          for (let j = 0; j < Math.min(numberMatches.length, metricNames.length); j++) {
            // Clean the number string and convert to float
            const valueStr = numberMatches[j].replace('%', '');
            const value = parseFloat(valueStr);
            
            if (!isNaN(value)) {
              metrics.push({
                name: metricNames[j],
                value,
                target: getTargetForMetric(metricNames[j]),
                unit: getUnitForMetric(metricNames[j]),
                status: determineMetricStatus(metricNames[j], value)
              });
            }
          }
          
          if (metrics.length > 0) {
            drivers.push({
              name: driverId,
              status: "active",
              metrics
            });
          }
        }
      }
      // If we hit a line that doesn't look like driver data after being in the section,
      // we might be at the end of the driver table
      else if (line.match(/total|average|mean/i) && drivers.length > 0) {
        // Likely at the end of the driver section
        break;
      }
    }
  }
  
  console.log(`Found ${drivers.length} drivers in DSP Weekly Summary format`);
  
  // Fill in missing metrics for each driver
  return drivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics()
  }));
}

// Helper functions to get target and unit for metrics
function getTargetForMetric(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 0;
    case "DCR": return 98.5;
    case "DNR DPMO": return 1500;
    case "POD": return 98;
    case "CC": return 95;
    case "CE": return 0;
    case "DEX": return 95;
    default: return 0;
  }
}

function getUnitForMetric(metricName: string): string {
  switch (metricName) {
    case "DCR": return "%";
    case "DNR DPMO": return "DPMO";
    case "POD": return "%";
    case "CC": return "%";
    case "CE": return "";
    case "DEX": return "%";
    default: return "";
  }
}
