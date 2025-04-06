
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";

interface ExtractionOptions {
  prioritizeAIds?: boolean;
}

/**
 * Extract drivers using enhanced pattern matching optimized for different ID formats
 */
export function extractDriversWithEnhancedPatterns(text: string, options: ExtractionOptions = {}): DriverKPI[] {
  console.log("Using enhanced pattern extraction with options:", options);
  
  const { prioritizeAIds = false } = options;
  const drivers: DriverKPI[] = [];
  
  // Prioritize A-prefixed IDs if requested
  if (prioritizeAIds) {
    // Pattern for 14-character IDs starting with A
    const aIdPattern = /\b(A[A-Z0-9]{13})\b[^\n]*?([\d.]+)[^\n]*?([\d.]+)[^\n]*?([\d.]+)/g;
    let match;
    while ((match = aIdPattern.exec(text)) !== null) {
      const [, id, value1, value2, value3] = match;
      
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
  }
  
  // General driver pattern (fallback)
  const genericPattern = /\b([A-Z][A-Z0-9]{5,})\b[^\n]*?([\d.]+)[^\n]*?([\d.]+)[^\n]*?([\d.]+)/g;
  let genericMatch;
  while ((genericMatch = genericPattern.exec(text)) !== null) {
    const [, id, value1, value2, value3] = genericMatch;
    
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
  
  console.log(`Enhanced pattern extraction found ${drivers.length} drivers`);
  return drivers;
}
