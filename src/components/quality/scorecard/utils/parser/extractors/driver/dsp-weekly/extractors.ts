
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
  
  // 2. Find the header line (looking for "Transporter ID" and typical columns)
  let headerLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((line.includes("Transporter") || line.includes("Transport")) && 
        line.includes("ID") && 
        (line.includes("Delivered") || line.includes("DCR") || 
         line.includes("DNR") || line.includes("DPMO"))) {
      headerLineIndex = i;
      console.log(`Table header found at line ${i}: ${lines[i]}`);
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
      const matches = line.match(/\d+(?:\.\d+)?%?/g) || [];
      
      // We need at least 4 metrics for a valid driver
      if (matches.length >= 4) {
        // Clean and convert values to numbers
        const values = matches.map(v => parseFloat(v.replace('%', '')));
        
        // Create driver with metrics
        const driver: DriverKPI = {
          name: driverId,
          status: "active",
          metrics: [
            {
              name: "Delivered",
              value: values[0],
              target: 0,
              status: "fair" // Changed from "neutral" to "fair"
            },
            {
              name: "DCR",
              value: values[1],
              target: 98.5,
              status: determineMetricStatus("DCR", values[1])
            },
            {
              name: "DNR DPMO",
              value: values[2],
              target: 1500,
              status: determineMetricStatus("DNR DPMO", values[2])
            },
            {
              name: "POD",
              value: values[3],
              target: 98,
              status: determineMetricStatus("POD", values[3])
            }
          ]
        };
        
        // Add additional metrics if available
        if (values.length > 4) {
          driver.metrics.push({
            name: "CC",
            value: values[4],
            target: 95,
            status: determineMetricStatus("CC", values[4])
          });
        }
        
        if (values.length > 5) {
          driver.metrics.push({
            name: "CE",
            value: values[5] || 0,
            target: 0,
            status: determineMetricStatus("CE", values[5] || 0)
          });
        }
        
        if (values.length > 6) {
          driver.metrics.push({
            name: "DEX",
            value: values[6],
            target: 95,
            status: determineMetricStatus("DEX", values[6])
          });
        }
        
        // Ensure complete metrics
        driver.metrics = createAllStandardMetrics(driver.metrics);
        drivers.push(driver);
        processedIds.add(driverId);
        
        console.log(`Added driver ${driverId} with ${driver.metrics.length} metrics`);
      }
    } catch (error) {
      console.error(`Error processing driver at line ${i}:`, error);
      // Continue with the next line
    }
  }
  
  console.log(`Extracted ${drivers.length} drivers from DSP WEEKLY SUMMARY table`);
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
  
  // Define regex pattern for driver rows - improved to match the image format
  // Format: A-Code + numbers with spaces between them, handling varying number of digits and decimals
  const rowPattern = /\b(A[A-Z0-9]+)\s+(\d+(?:\.\d+)?)\s+([\d.]+)(?:%?)\s+([\d.]+)(?:%?)\s+([\d.]+)(?:%?)\s+([\d.]+)(?:%?)\s+(\d+(?:\.\d+)?)\s+([\d.]+)(?:%?)/gm;
  
  const drivers: DriverKPI[] = [];
  const processedIds = new Set<string>();
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
      
      // Skip if we've already processed this driver
      if (processedIds.has(driverId)) continue;
      
      console.log(`Found driver with regex: ${driverId}`);
      
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
      processedIds.add(driverId);
      
      console.log(`Added driver ${driverId} with ${driver.metrics.length} metrics from regex`);
    } catch (error) {
      console.error("Error processing table entry:", error);
      // Continue with next match
    }
  }
  
  // Try a simpler pattern if the detailed one didn't work
  if (drivers.length < 5) {
    console.log("Few drivers found with detailed pattern, trying simpler pattern");
    
    // Simpler pattern: A-code followed by at least 4 numbers
    const simpleRowPattern = /\b(A[A-Z0-9]+)\s+(\d+(?:\.\d+)?)\s+([\d.]+)(?:%?)\s+([\d.]+)(?:%?)\s+([\d.]+)(?:%?)/gm;
    
    while ((match = simpleRowPattern.exec(text)) !== null) {
      try {
        const [
          _, // Full match
          driverId,
          delivered,
          dcr,
          dnrDpmo,
          pod
        ] = match;
        
        // Skip if we've already processed this driver
        if (processedIds.has(driverId)) continue;
        
        console.log(`Found driver with simple pattern: ${driverId}`);
        
        // Create driver with extracted values
        const driver: DriverKPI = {
          name: driverId,
          status: "active",
          metrics: [
            {
              name: "Delivered",
              value: parseFloat(delivered),
              target: 0,
              status: "fair" 
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
            }
          ]
        };
        
        // Add the driver with complete metrics
        driver.metrics = createAllStandardMetrics(driver.metrics);
        drivers.push(driver);
        processedIds.add(driverId);
        
        console.log(`Added driver ${driverId} with ${driver.metrics.length} metrics from simple pattern`);
      } catch (error) {
        console.error("Error processing table entry:", error);
        // Continue with next match
      }
    }
  }
  
  // If regex method found no drivers, try line-based method
  if (drivers.length === 0) {
    console.log("Regex methods found no drivers, trying line-based extraction");
    return extractDriversFromDSPWeeklySummary(text);
  }
  
  console.log(`Extracted: ${drivers.length} drivers with fixed column width method`);
  return drivers;
}
