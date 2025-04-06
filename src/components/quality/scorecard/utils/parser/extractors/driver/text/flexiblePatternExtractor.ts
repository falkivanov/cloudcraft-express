
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";

/**
 * Extract drivers using flexible pattern matching for different ID formats
 */
export function extractDriversWithFlexiblePattern(text: string): DriverKPI[] {
  console.log("Using flexible pattern driver extraction");
  
  const drivers: DriverKPI[] = [];
  
  // Pattern for any alphanumeric pattern that resembles a driver ID followed by numbers
  const flexPattern = /\b([A-Z][A-Z0-9]{2,}[-\s]?\d*)\s+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/g;
  
  let match;
  while ((match = flexPattern.exec(text)) !== null) {
    const [, id, value1, value2, value3] = match;
    
    // Skip if we already have this driver
    if (drivers.some(d => d.name === id)) {
      continue;
    }
    
    drivers.push({
      name: id,
      status: "active",
      metrics: [
        {
          name: "Delivered",
          value: parseFloat(value1),
          target: 0,
          unit: "",
          status: determineMetricStatus("Delivered", parseFloat(value1))
        },
        {
          name: "DCR",
          value: parseFloat(value2),
          target: 98.5,
          unit: "%",
          status: determineMetricStatus("DCR", parseFloat(value2))
        },
        {
          name: "DNR DPMO",
          value: parseFloat(value3),
          target: 1500,
          unit: "DPMO",
          status: determineMetricStatus("DNR DPMO", parseFloat(value3))
        }
      ]
    });
  }
  
  console.log(`Flexible pattern extraction found ${drivers.length} drivers`);
  return drivers;
}
