
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";
import { createAllStandardMetrics } from "../utils/metricUtils";
import { extractNumericValues } from "./numericExtractor";
import { processTableRow } from "./rowProcessor";

/**
 * Extract drivers from DSP Weekly Summary format using line-by-line analysis
 */
export function extractDriversFromDSPWeeklySummary(text: string): DriverKPI[] {
  console.log("Extracting drivers from DSP Weekly Summary format");
  
  // Check if the text contains the DSP WEEKLY SUMMARY header
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY not found");
    return [];
  }
  
  // 1. Split into lines
  const lines = text.split('\n');
  
  // 2. Find the header line
  let headerLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Transporter ID") && 
        lines[i].includes("Delivered") && 
        lines[i].includes("DCR") && 
        lines[i].includes("DNR DPMO")) {
      headerLineIndex = i;
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.log("Table headers not found");
    return [];
  }
  
  console.log(`Table header found at line ${headerLineIndex}`);
  
  // 3. Extract data rows
  const drivers: DriverKPI[] = [];
  
  // Start with the line after the header
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop if we reach an empty line or the end of the table
    if (!line || line.startsWith("Total")) break;
    
    // Check if the line starts with a Transporter ID (A followed by alphanumeric)
    if (/^A[A-Z0-9]/.test(line)) {
      try {
        // Process the driver line
        const columns = line.split(/\s+/);
        
        // Skip if we don't have enough columns
        if (columns.length < 5) continue;
        
        // Extract the driver ID (first column)
        const driverId = columns[0];
        
        // Find numeric values in the line
        const metricIndices: number[] = [];
        for (let j = 1; j < columns.length; j++) {
          if (/^[0-9]+(\.[0-9]+)?%?$/.test(columns[j])) {
            metricIndices.push(j);
          }
        }
        
        // If not enough numeric values found, try alternative extraction
        if (metricIndices.length < 4) {
          const numbersMatch = line.match(/\b(\d+(?:\.\d+)?)\b/g);
          if (numbersMatch && numbersMatch.length >= 4) {
            console.log(`Alternative extraction for line: ${line}`);
            
            // Create driver with extracted values
            const driver: DriverKPI = {
              name: driverId,
              status: "active",
              metrics: [
                {
                  name: "Delivered",
                  value: parseFloat(numbersMatch[0]),
                  target: 0,
                  status: "fair" // Changed from "neutral" to "fair"
                },
                {
                  name: "DCR",
                  value: parseFloat(numbersMatch[1]),
                  target: 98.5,
                  status: determineMetricStatus("DCR", parseFloat(numbersMatch[1]))
                },
                {
                  name: "DNR DPMO",
                  value: parseFloat(numbersMatch[2]),
                  target: 1500,
                  status: determineMetricStatus("DNR DPMO", parseFloat(numbersMatch[2]))
                },
                {
                  name: "POD",
                  value: parseFloat(numbersMatch[3]),
                  target: 98,
                  status: determineMetricStatus("POD", parseFloat(numbersMatch[3]))
                }
              ]
            };
            
            // Add additional metrics if available
            if (numbersMatch.length > 4) {
              driver.metrics.push({
                name: "CC",
                value: parseFloat(numbersMatch[4]),
                target: 95,
                status: determineMetricStatus("CC", parseFloat(numbersMatch[4]))
              });
            }
            
            if (numbersMatch.length > 5) {
              driver.metrics.push({
                name: "CE",
                value: parseFloat(numbersMatch[5] || "0"),
                target: 0,
                status: determineMetricStatus("CE", parseFloat(numbersMatch[5] || "0"))
              });
            }
            
            if (numbersMatch.length > 6) {
              driver.metrics.push({
                name: "DEX",
                value: parseFloat(numbersMatch[6]),
                target: 95,
                status: determineMetricStatus("DEX", parseFloat(numbersMatch[6]))
              });
            }
            
            // Add complete metrics and add to drivers list
            driver.metrics = createAllStandardMetrics(driver.metrics);
            drivers.push(driver);
            continue;
          }
        }
        
        // Process metrics if we have enough values
        if (metricIndices.length >= 4) {
          console.log(`Extraction for driver: ${driverId} with ${metricIndices.length} metrics`);
          
          // Map column indices to metrics
          const metrics = [
            {
              name: "Delivered",
              value: parseFloat(columns[metricIndices[0]].replace('%', '')),
              target: 0,
              status: "fair" // Changed from "neutral" to "fair"
            },
            {
              name: "DCR",
              value: parseFloat(columns[metricIndices[1]].replace('%', '')),
              target: 98.5,
              status: determineMetricStatus("DCR", parseFloat(columns[metricIndices[1]].replace('%', '')))
            },
            {
              name: "DNR DPMO",
              value: parseFloat(columns[metricIndices[2]].replace('%', '')),
              target: 1500,
              status: determineMetricStatus("DNR DPMO", parseFloat(columns[metricIndices[2]].replace('%', '')))
            },
            {
              name: "POD",
              value: parseFloat(columns[metricIndices[3]].replace('%', '')),
              target: 98,
              status: determineMetricStatus("POD", parseFloat(columns[metricIndices[3]].replace('%', '')))
            }
          ];
          
          // Add additional metrics if available
          if (metricIndices.length > 4) {
            metrics.push({
              name: "CC",
              value: parseFloat(columns[metricIndices[4]].replace('%', '')),
              target: 95,
              status: determineMetricStatus("CC", parseFloat(columns[metricIndices[4]].replace('%', '')))
            });
          }
          
          if (metricIndices.length > 5) {
            metrics.push({
              name: "CE",
              value: parseFloat(columns[metricIndices[5]].replace('%', '') || "0"),
              target: 0,
              status: determineMetricStatus("CE", parseFloat(columns[metricIndices[5]].replace('%', '') || "0"))
            });
          }
          
          if (metricIndices.length > 6) {
            metrics.push({
              name: "DEX",
              value: parseFloat(columns[metricIndices[6]].replace('%', '')),
              target: 95,
              status: determineMetricStatus("DEX", parseFloat(columns[metricIndices[6]].replace('%', '')))
            });
          }
          
          // Create the driver and add to list
          const driver: DriverKPI = {
            name: driverId,
            status: "active",
            metrics: createAllStandardMetrics(metrics)
          };
          
          drivers.push(driver);
        }
      } catch (error) {
        console.error(`Error processing line ${i}:`, error);
        // Continue with next line
      }
    }
  }
  
  console.log(`Extracted: ${drivers.length} drivers from DSP WEEKLY SUMMARY table`);
  return drivers;
}

/**
 * Optimized extraction for fixed-width table format specifically for DSP WEEKLY SUMMARY
 */
export function extractDriversFromFixedWidthTable(text: string): DriverKPI[] {
  console.log("Extracting drivers from DSP WEEKLY SUMMARY with fixed column width");
  
  // Check for DSP WEEKLY SUMMARY header
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY not found");
    return [];
  }
  
  // Define regex pattern for driver rows
  // Format: A-Code + numbers + percentages
  const rowPattern = /^(A[A-Z0-9]+)\s+(\d+)\s+([\d.]+)%?\s+([\d.]+)\s+([\d.]+)%?\s+([\d.]+)%?\s+(\d+)\s+([\d.]+)%?/gm;
  
  const drivers: DriverKPI[] = [];
  let match;
  
  // Find all matching rows
  while ((match = rowPattern.exec(text)) !== null) {
    try {
      const [
        _, // Full match
        driverId,
        delivered,
        dcr,
        dnrDpmo,
        pod,
        cc,
        ce,
        dex
      ] = match;
      
      // Create driver with extracted values
      const driver: DriverKPI = {
        name: driverId,
        status: "active",
        metrics: [
          {
            name: "Delivered",
            value: parseFloat(delivered),
            target: 0,
            status: "fair" // Changed from "neutral" to "fair"
          },
          {
            name: "DCR",
            value: parseFloat(dcr),
            target: 98.5,
            status: determineMetricStatus("DCR", parseFloat(dcr))
          },
          {
            name: "DNR DPMO",
            value: parseFloat(dnrDpmo),
            target: 1500,
            status: determineMetricStatus("DNR DPMO", parseFloat(dnrDpmo))
          },
          {
            name: "POD",
            value: parseFloat(pod),
            target: 98,
            status: determineMetricStatus("POD", parseFloat(pod))
          },
          {
            name: "CC",
            value: parseFloat(cc),
            target: 95,
            status: determineMetricStatus("CC", parseFloat(cc))
          },
          {
            name: "CE",
            value: parseFloat(ce),
            target: 0,
            status: determineMetricStatus("CE", parseFloat(ce))
          },
          {
            name: "DEX",
            value: parseFloat(dex),
            target: 95,
            status: determineMetricStatus("DEX", parseFloat(dex))
          }
        ]
      };
      
      drivers.push(driver);
    } catch (error) {
      console.error("Error processing table entry:", error);
      // Continue with next match
    }
  }
  
  // If regex method found no drivers, try line-based method
  if (drivers.length === 0) {
    console.log("Regex method found no drivers, trying line-based extraction");
    return extractDriversFromDSPWeeklySummary(text);
  }
  
  console.log(`Extracted: ${drivers.length} drivers with fixed column width method`);
  return drivers;
}
