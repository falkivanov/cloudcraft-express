
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";
import { createAllStandardMetrics } from "../utils/metricUtils";

/**
 * Extract drivers using enhanced pattern matching optimized for
 * common patterns in scorecard PDFs
 */
export function extractDriversWithEnhancedPatterns(text: string): DriverKPI[] {
  console.log("Starting enhanced pattern extraction for drivers");
  const drivers: DriverKPI[] = [];
  const seenDrivers = new Set<string>();
  
  // Split into lines for processing
  const lines = text.split(/\r?\n/);
  
  // Set of pattern matchers to try
  const patterns = [
    // Pattern 1: Standard A-prefixed ID with metrics
    {
      idPattern: /^(A[A-Z0-9]{5,13})\b/,
      valuePattern: /(\d+(?:\.\d+)?)\s*(?:%|DPMO)?/g
    },
    // Pattern 2: A-prefixed ID with spaces and metrics
    {
      idPattern: /\b(A[A-Z0-9]{5,13})\b/,
      valuePattern: /(\d+(?:\.\d+)?)\s*(?:%|DPMO)?/g
    },
    // Pattern 3: Any line with an A-prefixed ID followed by at least 3 numbers
    {
      idPattern: /\b(A[A-Z0-9]{5,13})\b/,
      valuePattern: /\b(\d+(?:\.\d+)?)\b/g
    }
  ];
  
  // Iterate through each line
  for (let line of lines) {
    line = line.trim();
    if (line.length < 10) continue;
    
    // Skip header lines and summary lines
    if (line.includes("Transporter") || 
        line.includes("Driver") || 
        line.includes("Total") ||
        line.includes("Average") ||
        line.includes("SUMMARY")) {
      continue;
    }
    
    // Try each pattern
    for (const pattern of patterns) {
      const idMatch = line.match(pattern.idPattern);
      if (!idMatch) continue;
      
      const driverId = idMatch[1].trim();
      
      // Skip if we've already processed this driver
      if (seenDrivers.has(driverId)) continue;
      
      // Skip if looks like noise
      if (driverId.length < 7 || 
          driverId.includes("PAGE") || 
          driverId.includes("SUMMARY")) {
        continue;
      }
      
      // Match all potential values
      const valueMatches = Array.from(line.matchAll(pattern.valuePattern));
      
      // Need at least 3 metrics for a valid driver
      if (valueMatches.length >= 3) {
        const values = valueMatches.map(m => parseFloat(m[1]));
        
        // Define metrics
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
        
        // Create metrics using available values
        for (let i = 0; i < Math.min(values.length, metricNames.length); i++) {
          const value = values[i];
          metrics.push({
            name: metricNames[i],
            value: value,
            target: metricTargets[i],
            unit: metricUnits[i],
            status: determineMetricStatus(metricNames[i], value)
          });
        }
        
        // Create driver if we have at least 3 metrics
        if (metrics.length >= 3) {
          drivers.push({
            name: driverId,
            status: "active",
            metrics: createAllStandardMetrics(metrics)
          });
          
          seenDrivers.add(driverId);
          console.log(`Found driver ${driverId} with ${metrics.length} metrics`);
        }
      }
    }
  }
  
  // Aggressive search for driver IDs and context
  if (drivers.length < 20) {
    const idPattern = /\b(A[A-Z0-9]{5,13})\b/g;
    let match;
    
    while ((match = idPattern.exec(text)) !== null) {
      const driverId = match[1];
      
      if (!seenDrivers.has(driverId) && 
          driverId.length >= 8 && 
          !driverId.includes("PAGE") && 
          !driverId.includes("SUMMARY")) {
        
        // Get context around the ID
        const contextStart = Math.max(0, match.index - 5);
        const contextEnd = Math.min(text.length, match.index + 200);
        const context = text.substring(contextStart, contextEnd);
        
        // Look for numbers in context
        const numbers = Array.from(context.matchAll(/\b(\d+(?:\.\d+)?)\b/g))
          .map(m => parseFloat(m[1]))
          .filter(n => !isNaN(n));
        
        if (numbers.length >= 3) {
          // Define metrics
          const metrics = [];
          const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
          const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
          const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
          
          // Create metrics using available values
          for (let i = 0; i < Math.min(numbers.length, metricNames.length); i++) {
            const value = numbers[i];
            metrics.push({
              name: metricNames[i],
              value: value,
              target: metricTargets[i],
              unit: metricUnits[i],
              status: determineMetricStatus(metricNames[i], value)
            });
          }
          
          // Create driver if we have at least 3 metrics
          if (metrics.length >= 3) {
            drivers.push({
              name: driverId,
              status: "active",
              metrics: createAllStandardMetrics(metrics)
            });
            
            seenDrivers.add(driverId);
            console.log(`Found driver ${driverId} with aggressive search (${metrics.length} metrics)`);
          }
        }
      }
    }
  }
  
  console.log(`Enhanced pattern extraction found ${drivers.length} drivers`);
  return drivers;
}
