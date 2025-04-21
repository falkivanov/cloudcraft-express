
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
  
  // 2. Find the header line and detect format (with or without LoR DPMO)
  let headerLineIndex = -1;
  let hasLoRColumn = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if ((line.includes("transporter") || line.includes("transport")) && 
        line.includes("id") && line.includes("delivered")) {
      headerLineIndex = i;
      // Check if this format includes the LoR DPMO column
      hasLoRColumn = line.includes("lor dpmo");
      console.log(`Table header found at line ${i}, hasLoRColumn: ${hasLoRColumn}`);
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.log("Table headers not found");
    return [];
  }
  
  // 3. Extract data rows
  const drivers: DriverKPI[] = [];
  const processedIds = new Set<string>();
  
  // Start with the line after the header
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines or lines that don't start with 'A'
    if (!line || !line.startsWith('A')) continue;
    
    // Stop if we reach the end of the table or a new section
    if (line.startsWith("Total") || line.startsWith("Page")) break;
    
    try {
      // Get the driver ID (first word on the line)
      const driverId = line.split(/\s+/)[0];
      
      // Skip if we've already processed this driver
      if (processedIds.has(driverId)) continue;
      
      console.log(`Processing driver line: ${driverId}`);
      
      // Extract all numeric values from the line
      const matches = line.match(/[-]|\d+(?:\.\d+)?%?/g) || [];
      const values = matches
        .map(v => v === "-" ? "0" : v)
        .map(v => parseFloat(v.replace('%', '')));
      
      // We need at least 4 metrics for a valid driver
      if (values.length >= 4) {
        // Handle values based on table format
        let currentIndex = 1; // Skip driver ID
        const metrics = [];
        
        // Always present: Delivered
        metrics.push({
          name: "Delivered",
          value: values[currentIndex++],
          target: 0,
          status: "fair"
        });
        
        // Always present: DCR
        metrics.push({
          name: "DCR",
          value: values[currentIndex++],
          target: 98.5,
          status: determineMetricStatus("DCR", values[currentIndex-1])
        });
        
        // Always present: DNR DPMO
        metrics.push({
          name: "DNR DPMO",
          value: values[currentIndex++],
          target: 1500,
          status: determineMetricStatus("DNR DPMO", values[currentIndex-1])
        });
        
        // Handle LoR DPMO if present
        if (hasLoRColumn) {
          // LoR DPMO is present but we don't store it as a metric
          currentIndex++; // Skip the LoR DPMO value
        }
        
        // Add remaining standard metrics
        if (currentIndex < values.length) {
          metrics.push({
            name: "POD",
            value: values[currentIndex++],
            target: 98,
            status: determineMetricStatus("POD", values[currentIndex-1])
          });
        }
        
        if (currentIndex < values.length) {
          metrics.push({
            name: "CC",
            value: values[currentIndex++],
            target: 95,
            status: determineMetricStatus("CC", values[currentIndex-1])
          });
        }
        
        if (currentIndex < values.length) {
          metrics.push({
            name: "CE",
            value: values[currentIndex++],
            target: 0,
            status: determineMetricStatus("CE", values[currentIndex-1])
          });
        }
        
        if (currentIndex < values.length) {
          metrics.push({
            name: "DEX",
            value: values[currentIndex++],
            target: 95,
            status: determineMetricStatus("DEX", values[currentIndex-1])
          });
        }
        
        // Create driver with complete metrics
        const driver: DriverKPI = {
          name: driverId,
          status: "active",
          metrics: createAllStandardMetrics(metrics)
        };
        
        drivers.push(driver);
        processedIds.add(driverId);
        
        console.log(`Added driver ${driverId} with ${driver.metrics.length} metrics`);
      }
    } catch (error) {
      console.error(`Error processing driver at line ${i}:`, error);
      // Continue with next line
    }
  }
  
  console.log(`Extracted ${drivers.length} drivers from DSP WEEKLY SUMMARY table`);
  return drivers;
}

