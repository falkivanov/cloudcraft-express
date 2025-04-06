
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { ensureAllMetrics } from '../utils/metricUtils';

interface ExtractorOptions {
  prioritizeAIds?: boolean;
}

/**
 * Extract driver KPIs using enhanced pattern matching
 * Specifically targeting 14-character IDs that start with 'A'
 */
export const extractDriversWithEnhancedPatterns = (text: string, options: ExtractorOptions = {}): DriverKPI[] => {
  console.log("Extracting drivers with enhanced patterns, focusing on 14-character A-prefixed IDs");
  
  const drivers: DriverKPI[] = [];
  const processedDriverIds = new Set<string>();
  
  // Extract section after "DSP WEEKLY SUMMARY" if present
  let textToProcess = text;
  if (text.includes("DSP WEEKLY SUMMARY")) {
    const sections = text.split("DSP WEEKLY SUMMARY");
    if (sections.length > 1) {
      textToProcess = sections[1]; // Focus on the part after "DSP WEEKLY SUMMARY"
      console.log("Processing section after DSP WEEKLY SUMMARY");
    }
  }
  
  // Split text into lines to process
  const lines = textToProcess.split(/\r?\n/);
  
  // Look for table header
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if ((line.includes("transporter") || line.includes("transport")) && 
        line.includes("id") && 
        (line.includes("delivered") || line.includes("dcr") || line.includes("dpmo"))) {
      headerIndex = i;
      console.log(`Found table header at line ${i}: ${lines[i]}`);
      break;
    }
  }
  
  // Define patterns specifically for 14-character IDs starting with 'A'
  // This is our primary target pattern now
  const exactPattern = /\b(A[A-Z0-9]{13})\b/g;  // Matches exactly 14 chars: A followed by 13 alphanumeric
  
  // Fallback patterns if exact pattern doesn't find enough matches
  const fallbackPatterns = [
    /\b(A[A-Z0-9]{10,15})\b/g,  // More flexible length (11-16 chars)
    /\b(A[A-Z0-9]{5,})\b/g      // Any A-prefixed ID with at least 6 chars
  ];
  
  // First pass: process lines after the header with our exact pattern
  if (headerIndex !== -1) {
    console.log("Searching for 14-character A-prefixed IDs in table rows");
    processLinesWithPattern(lines, headerIndex, exactPattern, drivers, processedDriverIds);
  }
  
  // If we didn't find enough drivers with the exact pattern, try the fallback patterns
  if (drivers.length < 10) {
    console.log(`Only found ${drivers.length} drivers with exact pattern, trying fallback patterns`);
    
    // Try the fallback patterns in order of decreasing specificity
    for (const pattern of fallbackPatterns) {
      if (drivers.length >= 20) break; // Stop if we have enough drivers
      
      if (headerIndex !== -1) {
        processLinesWithPattern(lines, headerIndex, pattern, drivers, processedDriverIds);
      } else {
        // If no header found, try to find patterns across all text
        processTextWithPattern(textToProcess, pattern, drivers, processedDriverIds);
      }
    }
  }
  
  console.log(`Extracted ${drivers.length} drivers with enhanced patterns focusing on A-prefixed IDs`);
  
  // Ensure all drivers have complete metrics
  return ensureAllMetrics(drivers);
};

/**
 * Process lines after a header with a specific pattern
 */
function processLinesWithPattern(
  lines: string[], 
  headerIndex: number, 
  pattern: RegExp, 
  drivers: DriverKPI[], 
  processedDriverIds: Set<string>
): void {
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty or short lines
    if (line.length < 5) continue;
    
    // Skip lines that look like page breaks or section markers
    if (line.includes("Page") || line.includes("Seite") || line.includes("----")) continue;
    
    const matches = Array.from(line.matchAll(pattern));
    
    for (const match of matches) {
      const id = match[1].trim();
      
      // Skip if we've already processed this ID
      if (processedDriverIds.has(id)) continue;
      
      // Skip if the ID is obviously not a driver ID
      if (id.toLowerCase().includes("page") || id.length < 6) continue;
      
      // Look for metrics in the rest of the line
      const metricsText = line.substring(match.index! + match[0].length);
      const numericValues = metricsText.match(/\b(\d+(?:\.\d+)?)\b/g);
      
      if (numericValues && numericValues.length >= 3) {
        // Convert values to numbers
        const values = numericValues.map(v => parseFloat(v));
        
        // Create driver with metrics
        const driver = createDriverWithMetrics(id, values);
        
        // Add the driver
        drivers.push(driver);
        
        // Mark this ID as processed
        processedDriverIds.add(id);
        
        console.log(`Added driver ${id} with ${driver.metrics.length} metrics`);
      }
    }
  }
}

/**
 * Process entire text block with a specific pattern
 */
function processTextWithPattern(
  text: string, 
  pattern: RegExp, 
  drivers: DriverKPI[], 
  processedDriverIds: Set<string>
): void {
  // Use regex to find patterns like "A12345... 1234 98.5 2500" (ID followed by metrics)
  const driverBlocks = text.match(new RegExp(pattern.source + "[^\\n]*?(\\d+(?:\\.\\d+)?)[^\\n]*?(\\d+(?:\\.\\d+)?)[^\\n]*?(\\d+(?:\\.\\d+)?)", "g"));
  
  if (driverBlocks && driverBlocks.length > 0) {
    console.log(`Found ${driverBlocks.length} potential driver blocks with pattern ${pattern}`);
    
    driverBlocks.forEach(block => {
      // Get the ID
      const idMatch = block.match(pattern);
      if (!idMatch) return;
      
      const id = idMatch[1];
      
      // Skip if we've already processed this ID
      if (processedDriverIds.has(id)) return;
      
      // Extract numeric values
      const numericValues = block.match(/\b(\d+(?:\.\d+)?)\b/g);
      if (!numericValues || numericValues.length < 3) return;
      
      // Convert values to numbers
      const values = numericValues.map(v => parseFloat(v));
      
      // Create driver with metrics
      const driver = createDriverWithMetrics(id, values);
      
      // Add the driver
      drivers.push(driver);
      
      // Mark as processed
      processedDriverIds.add(id);
      
      console.log(`Added driver ${id} with ${driver.metrics.length} metrics from block pattern`);
    });
  }
}

/**
 * Create a driver object with metrics based on values array
 */
function createDriverWithMetrics(id: string, values: number[]): DriverKPI {
  // Set up metrics with corresponding status
  const metrics = [
    {
      name: "Delivered",
      value: values[0] || 0,
      target: 0,
      unit: "",
      status: determineStatus("Delivered", values[0] || 0)
    },
    {
      name: "DCR",
      value: values[1] || 0,
      target: 98.5,
      unit: "%",
      status: determineStatus("DCR", values[1] || 0)
    },
    {
      name: "DNR DPMO",
      value: values[2] || 0,
      target: 1500,
      unit: "DPMO",
      status: determineStatus("DNR DPMO", values[2] || 0)
    }
  ];
  
  // Add more metrics if values are available
  if (values.length > 3) {
    metrics.push({
      name: "POD",
      value: values[3] || 0,
      target: 98,
      unit: "%",
      status: determineStatus("POD", values[3] || 0)
    });
  }
  
  if (values.length > 4) {
    metrics.push({
      name: "CC",
      value: values[4] || 0,
      target: 95,
      unit: "%",
      status: determineStatus("CC", values[4] || 0)
    });
  }
  
  if (values.length > 5) {
    metrics.push({
      name: "CE",
      value: values[5] || 0,
      target: 0,
      unit: "",
      status: determineStatus("CE", values[5] || 0)
    });
  }
  
  if (values.length > 6) {
    metrics.push({
      name: "DEX",
      value: values[6] || 0,
      target: 95,
      unit: "%",
      status: determineStatus("DEX", values[6] || 0)
    });
  }
  
  // Return the complete driver object
  return {
    name: id,
    status: "active",
    metrics: metrics
  };
}
