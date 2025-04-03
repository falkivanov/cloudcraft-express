
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";
import { cleanNumericValue } from "./numericExtractor";

/**
 * Process a table row to extract driver data
 */
export function processTableRow(
  driverId: string, 
  values: string[]
): DriverKPI | null {
  if (!driverId || values.length < 4) {
    return null;
  }
  
  try {
    // Extract numeric values
    const numericValues = values.map(v => cleanNumericValue(v));
    
    // Define metric names and their targets
    const metricDefinitions = [
      { name: "Delivered", target: 0, defaultStatus: "fair" },
      { name: "DCR", target: 98.5 },
      { name: "DNR DPMO", target: 1500 },
      { name: "POD", target: 98 },
      { name: "CC", target: 95 },
      { name: "CE", target: 0 },
      { name: "DEX", target: 95 }
    ];
    
    // Create metrics array
    const metrics = [];
    
    // Add as many metrics as we have values for (up to 7)
    for (let i = 0; i < Math.min(numericValues.length, metricDefinitions.length); i++) {
      const value = numericValues[i];
      const definition = metricDefinitions[i];
      
      metrics.push({
        name: definition.name,
        value: value,
        target: definition.target,
        status: definition.defaultStatus || determineMetricStatus(definition.name, value)
      });
    }
    
    if (metrics.length === 0) {
      return null;
    }
    
    // Create and return the driver
    return {
      name: driverId,
      status: "active",
      metrics
    };
  } catch (error) {
    console.error("Error processing table row:", error);
    return null;
  }
}
