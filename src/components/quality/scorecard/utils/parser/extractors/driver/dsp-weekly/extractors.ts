
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

/**
 * Extract drivers from DSP Weekly Summary using fixed-width parsing
 * This extractor is optimized for perfectly aligned tabular data
 */
export function extractDriversFromFixedWidthTable(text: string): DriverKPI[] {
  console.log("Extracting drivers from fixed width table format");
  
  // Check if the text contains the DSP WEEKLY SUMMARY header
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Fixed width table: DSP WEEKLY SUMMARY not found");
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
      console.log(`Fixed width table: Header found at line ${i}, hasLoRColumn: ${hasLoRColumn}`);
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.log("Fixed width table: Headers not found");
    return [];
  }
  
  // 3. Extract data rows using column positions
  const drivers: DriverKPI[] = [];
  const processedIds = new Set<string>();
  
  // Get the header line to analyze column positions
  const headerLine = lines[headerLineIndex].toLowerCase();
  
  // Find positions of key columns in the header
  const idPosition = headerLine.indexOf("transport");
  const deliveredPosition = headerLine.indexOf("delivered");
  const dcrPosition = headerLine.indexOf("dcr");
  const dnrPosition = headerLine.indexOf("dnr dpmo");
  
  // Find LoR position if it exists
  const lorPosition = hasLoRColumn ? headerLine.indexOf("lor dpmo") : -1;
  
  // Find positions of other metrics
  const podPosition = headerLine.indexOf("pod");
  const ccPosition = headerLine.indexOf("cc");
  const cePosition = headerLine.indexOf("ce");
  const dexPosition = headerLine.indexOf("dex");
  
  // Process each line after the header
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Stop if we reach the end of the table or a new section
    if (line.startsWith("Total") || line.startsWith("Page")) break;
    
    try {
      // Extract driver ID from its position
      // We look for a pattern starting with 'A' in the ID column area
      const idMatch = line.substring(0, deliveredPosition).match(/A[A-Z0-9]{5,14}/);
      if (!idMatch) continue;
      
      const driverId = idMatch[0].trim();
      
      // Skip if we've already processed this driver
      if (processedIds.has(driverId)) continue;
      
      console.log(`Fixed width table: Processing driver: ${driverId}`);
      
      // Extract metrics based on their positions
      const extractMetric = (startPos: number, endPos: number) => {
        if (startPos < 0) return null;
        
        const valueText = line.substring(startPos, endPos > 0 ? endPos : undefined).trim();
        // Handle dash as zero and remove % signs
        const cleanValue = valueText.replace(/%/g, '').replace(/-/g, '0');
        return isNaN(parseFloat(cleanValue)) ? 0 : parseFloat(cleanValue);
      };
      
      // Extract each metric
      const delivered = extractMetric(deliveredPosition, dcrPosition);
      const dcr = extractMetric(dcrPosition, dnrPosition);
      const dnrDpmo = extractMetric(dnrPosition, lorPosition > 0 ? lorPosition : podPosition);
      
      // Skip LoR if present and adjust next position
      const nextPos = hasLoRColumn ? lorPosition : dnrPosition;
      const podStartPos = hasLoRColumn ? lorPosition : dnrPosition;
      
      // Get remaining metrics
      const pod = podPosition > 0 ? extractMetric(podPosition, ccPosition > 0 ? ccPosition : undefined) : null;
      const cc = ccPosition > 0 ? extractMetric(ccPosition, cePosition > 0 ? cePosition : undefined) : null;
      const ce = cePosition > 0 ? extractMetric(cePosition, dexPosition > 0 ? dexPosition : undefined) : null;
      const dex = dexPosition > 0 ? extractMetric(dexPosition, undefined) : null;
      
      // Create metrics array
      const metrics = [];
      
      // Add metrics if they were successfully extracted
      if (delivered !== null) {
        metrics.push({
          name: "Delivered",
          value: delivered,
          target: 0,
          status: "fair"
        });
      }
      
      if (dcr !== null) {
        metrics.push({
          name: "DCR",
          value: dcr,
          target: 98.5,
          status: determineMetricStatus("DCR", dcr)
        });
      }
      
      if (dnrDpmo !== null) {
        metrics.push({
          name: "DNR DPMO",
          value: dnrDpmo,
          target: 1500,
          status: determineMetricStatus("DNR DPMO", dnrDpmo)
        });
      }
      
      if (pod !== null) {
        metrics.push({
          name: "POD",
          value: pod,
          target: 98,
          status: determineMetricStatus("POD", pod)
        });
      }
      
      if (cc !== null) {
        metrics.push({
          name: "CC",
          value: cc,
          target: 95,
          status: determineMetricStatus("CC", cc)
        });
      }
      
      if (ce !== null) {
        metrics.push({
          name: "CE",
          value: ce,
          target: 0,
          status: determineMetricStatus("CE", ce)
        });
      }
      
      if (dex !== null) {
        metrics.push({
          name: "DEX",
          value: dex,
          target: 95,
          status: determineMetricStatus("DEX", dex)
        });
      }
      
      // Only create driver if we got enough metrics
      if (metrics.length >= 3) {
        const driver: DriverKPI = {
          name: driverId,
          status: "active",
          metrics: createAllStandardMetrics(metrics)
        };
        
        drivers.push(driver);
        processedIds.add(driverId);
        
        console.log(`Fixed width table: Added driver ${driverId} with ${driver.metrics.length} metrics`);
      }
    } catch (error) {
      console.error(`Fixed width table: Error processing driver at line ${i}:`, error);
      // Continue with next line
    }
  }
  
  console.log(`Fixed width table: Extracted ${drivers.length} drivers`);
  return drivers;
}
