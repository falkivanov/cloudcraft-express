
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { ensureAllMetrics } from '../utils/metricUtils';

interface ExtractorOptions {
  prioritizeAIds?: boolean;
  strictFormat?: boolean;
  multiPageAnalysis?: boolean;
}

/**
 * Extract driver KPIs using enhanced pattern matching
 * Specifically targeting 14-character IDs that start with 'A'
 */
export const extractDriversWithEnhancedPatterns = (text: string, options: ExtractorOptions = {}): DriverKPI[] => {
  console.log("Extracting drivers with enhanced patterns, focusing on 14-character A-prefixed IDs");
  
  const drivers: DriverKPI[] = [];
  const processedDriverIds = new Set<string>();
  
  // Process text by page if multiPageAnalysis is enabled
  let textsToProcess: string[] = [text];
  
  if (options.multiPageAnalysis) {
    // Try to split text into pages
    const pageMarkers = text.match(/(?:Page|Seite)\s+\d+\s+(?:of|von)\s+\d+/gi);
    
    if (pageMarkers && pageMarkers.length > 0) {
      const splitText = text.split(/(?:Page|Seite)\s+\d+\s+(?:of|von)\s+\d+/i);
      textsToProcess = splitText.filter(t => t.trim().length > 0);
      console.log(`Split text into ${textsToProcess.length} pages for analysis`);
    }
  }
  
  // Process each text section (page)
  for (let pageIndex = 0; pageIndex < textsToProcess.length; pageIndex++) {
    const textToProcess = textsToProcess[pageIndex];
    
    // Skip sections without A-prefixed IDs to save processing time
    if (!/\bA[A-Z0-9]{5,}\b/.test(textToProcess)) {
      console.log(`Section ${pageIndex + 1} doesn't contain A-prefixed IDs, skipping`);
      continue;
    }
    
    console.log(`Processing section ${pageIndex + 1}`);
    
    // Extract section after "DSP WEEKLY SUMMARY" if present
    let sectionText = textToProcess;
    if (textToProcess.includes("DSP WEEKLY SUMMARY")) {
      const sections = textToProcess.split("DSP WEEKLY SUMMARY");
      if (sections.length > 1) {
        sectionText = sections[1]; // Focus on the part after "DSP WEEKLY SUMMARY"
        console.log("Found DSP WEEKLY SUMMARY, focusing on text after it");
      }
    }
    
    // Split text into lines to process
    const lines = sectionText.split(/\r?\n/);
    
    // Look for table header
    let headerIndex = -1;
    const headerPatterns = [
      /(?:transporter|transport).*(?:id)/i,
      /(?:driver).*(?:id)/i,
      /(?:id).*(?:delivered|dcr|dpmo)/i
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (headerPatterns.some(pattern => pattern.test(line))) {
        headerIndex = i;
        console.log(`Found table header at line ${i}: ${lines[i]}`);
        break;
      }
    }
    
    // Define patterns specifically for 14-character IDs starting with 'A'
    const exactPattern = /\b(A[A-Z0-9]{13})\b/g;  // Matches exactly 14 chars: A followed by 13 alphanumeric
    
    // Fallback patterns if exact pattern doesn't find enough matches
    const fallbackPatterns = [
      /\b(A[A-Z0-9]{12,14})\b/g,  // More flexible length (13-15 chars)
      /\b(A[A-Z0-9]{10,})\b/g,    // Any A-prefixed ID with at least 11 chars
      /\b(A[A-Z0-9]{5,})\b/g      // Any A-prefixed ID with at least 6 chars
    ];
    
    // First pass: process lines after the header with our exact pattern
    if (headerIndex !== -1) {
      console.log("Searching for 14-character A-prefixed IDs in table rows");
      processLinesWithPattern(lines, headerIndex, exactPattern, drivers, processedDriverIds);
    } else {
      // If no header found, try to find exact patterns across all lines
      console.log("No header found, searching all lines for 14-character A-prefixed IDs");
      for (let i = 0; i < lines.length; i++) {
        processLinesWithPattern([lines[i]], 0, exactPattern, drivers, processedDriverIds);
      }
    }
    
    // If strict format is not required or we don't have enough drivers, try fallback patterns
    if (!options.strictFormat || drivers.length < 10) {
      console.log(`Only found ${drivers.length} drivers with exact pattern, trying fallback patterns`);
      
      // Try the fallback patterns in order of decreasing specificity
      for (const pattern of fallbackPatterns) {
        if (drivers.length >= 20) break; // Stop if we have enough drivers
        
        if (headerIndex !== -1) {
          processLinesWithPattern(lines, headerIndex, pattern, drivers, processedDriverIds);
        } else {
          // If no header found, try to find patterns across all text
          processTextWithPattern(sectionText, pattern, drivers, processedDriverIds);
        }
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
  startIndex: number, 
  pattern: RegExp, 
  drivers: DriverKPI[], 
  processedDriverIds: Set<string>
): void {
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty or short lines
    if (line.length < 5) continue;
    
    // Skip lines that look like page breaks or section markers
    if (line.includes("Page") || line.includes("Seite") || line.includes("----")) continue;
    
    // Reset pattern lastIndex to ensure we find all matches
    pattern.lastIndex = 0;
    const matches = Array.from(line.matchAll(pattern));
    
    for (const match of matches) {
      const id = match[1].trim();
      
      // Skip if we've already processed this ID
      if (processedDriverIds.has(id)) continue;
      
      // Skip if the ID is obviously not a driver ID
      if (id.toLowerCase().includes("page") || id.length < 6) continue;
      
      // Look for metrics in the rest of the line
      const metricsText = line.substring(match.index! + match[0].length);
      const numericValues = metricsText.match(/[-+]?(\d+(?:\.\d+)?)/g);
      
      if (numericValues && numericValues.length >= 2) {
        // Convert values to numbers
        const values = numericValues.map(v => parseFloat(v));
        
        // Create driver with metrics
        const driver = createDriverWithMetrics(id, values);
        
        // Add the driver
        drivers.push(driver);
        
        // Mark this ID as processed
        processedDriverIds.add(id);
        
        console.log(`Added driver ${id} with ${driver.metrics.length} metrics`);
      } else {
        // If no metrics on this line, look for metrics on following lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.length < 5 || /\bA[A-Z0-9]{5,}\b/.test(nextLine)) {
            // Skip empty lines or lines with other driver IDs
            continue;
          }
          
          // Look for metrics
          const nextLineValues = nextLine.match(/[-+]?(\d+(?:\.\d+)?)/g);
          if (nextLineValues && nextLineValues.length >= 3) {
            // Found metrics on a following line
            const values = nextLineValues.map(v => parseFloat(v));
            const driver = createDriverWithMetrics(id, values);
            drivers.push(driver);
            processedDriverIds.add(id);
            console.log(`Added driver ${id} with ${driver.metrics.length} metrics from following line`);
            break;
          }
        }
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
  // Reset pattern lastIndex to ensure we find all matches
  pattern.lastIndex = 0;
  
  // Use regex to find patterns like "A12345... 1234 98.5 2500" (ID followed by metrics)
  const driverBlocks = text.match(new RegExp(pattern.source + "[^\\n]*?([-+]?\\d+(?:\\.\\d+)?)[^\\n]*?([-+]?\\d+(?:\\.\\d+)?)[^\\n]*?([-+]?\\d+(?:\\.\\d+)?)", "g"));
  
  if (driverBlocks && driverBlocks.length > 0) {
    console.log(`Found ${driverBlocks.length} potential driver blocks with pattern ${pattern}`);
    
    driverBlocks.forEach(block => {
      // Reset pattern lastIndex to ensure we find all matches
      pattern.lastIndex = 0;
      
      // Get the ID
      const idMatch = block.match(pattern);
      if (!idMatch) return;
      
      const id = idMatch[1];
      
      // Skip if we've already processed this ID
      if (processedDriverIds.has(id)) return;
      
      // Extract numeric values
      const numericValues = block.match(/[-+]?(\d+(?:\.\d+)?)/g);
      if (!numericValues || numericValues.length < 2) return;
      
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
  
  // Second pass: look for IDs appearing near numbers across the whole text
  // This helps with non-tabular formats
  pattern.lastIndex = 0;
  const allIds = Array.from(text.matchAll(pattern)).map(match => ({
    id: match[1],
    index: match.index!
  }));
  
  allIds.forEach(({id, index}) => {
    // Skip if already processed
    if (processedDriverIds.has(id)) return;
    
    // Skip if the ID is obviously not a driver ID
    if (id.toLowerCase().includes("page") || id.length < 6) return;
    
    // Check for numbers within a reasonable distance (200 chars) after the ID
    const contextAfter = text.substring(index, index + 200);
    const numericValues = contextAfter.match(/[-+]?(\d+(?:\.\d+)?)/g);
    
    if (numericValues && numericValues.length >= 3) {
      // Found metrics in context
      const values = numericValues.slice(0, 7).map(v => parseFloat(v));
      const driver = createDriverWithMetrics(id, values);
      drivers.push(driver);
      processedDriverIds.add(id);
      console.log(`Added driver ${id} with ${driver.metrics.length} metrics from context search`);
    }
  });
}

/**
 * Create a driver object with metrics based on values array
 */
function createDriverWithMetrics(id: string, values: number[]): DriverKPI {
  // Interpret small values (< 100) as percentages, large values as absolute numbers
  const metrics = [];
  
  // Only use the first 7 values to avoid including unrelated numbers
  const numValues = Math.min(values.length, 7);
  
  // Set up potential metric names based on common formats
  const metricNames = ['Delivered', 'DCR', 'DNR DPMO', 'POD', 'CC', 'CE', 'DEX'];
  
  // Create metrics based on available values
  for (let i = 0; i < numValues; i++) {
    const value = values[i];
    const name = metricNames[i];
    
    metrics.push({
      name,
      value,
      target: getTargetForMetric(name),
      unit: getUnitForMetric(name),
      status: determineStatus(name, value)
    });
  }
  
  // Return the complete driver object
  return {
    name: id,
    status: "active",
    metrics: metrics
  };
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
