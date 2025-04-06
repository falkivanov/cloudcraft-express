
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";

/**
 * Extract drivers by analyzing text line by line
 */
export function extractDriversLineByLine(text: string): DriverKPI[] {
  console.log("Using line-based driver extraction");
  
  const drivers: DriverKPI[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Look for driver IDs in common formats
    const idMatch = line.match(/^(TR[-\s]?\d+|A[A-Z0-9]{5,})/);
    if (!idMatch) continue;
    
    const driverId = idMatch[1];
    
    // Look for numeric values in this line
    const valueMatches = line.match(/\b\d+(?:\.\d+)?\b/g);
    
    if (valueMatches && valueMatches.length >= 2) {
      const metrics = [];
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
      
      // Add metrics based on values found
      for (let j = 0; j < Math.min(valueMatches.length, metricNames.length); j++) {
        const value = parseFloat(valueMatches[j]);
        metrics.push({
          name: metricNames[j],
          value,
          target: getTargetForMetric(metricNames[j]),
          unit: getUnitForMetric(metricNames[j]),
          status: determineMetricStatus(metricNames[j], value)
        });
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
  
  console.log(`Line-based extraction found ${drivers.length} drivers`);
  return drivers;
}

/**
 * Helper function to get the target value for a metric
 */
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

/**
 * Helper function to get the unit for a metric
 */
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
