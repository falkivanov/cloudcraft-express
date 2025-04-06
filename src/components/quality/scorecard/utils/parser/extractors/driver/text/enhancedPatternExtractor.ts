
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
  console.log("Extracting drivers with enhanced patterns, focusing on A-prefixed IDs");
  
  const drivers: DriverKPI[] = [];
  const processedDriverIds = new Set<string>();
  
  // Extract section after "DSP WEEKLY SUMMARY" if present
  let textToProcess = text;
  let dspWeeklySummaryFound = false;
  if (text.includes("DSP WEEKLY SUMMARY")) {
    const sections = text.split("DSP WEEKLY SUMMARY");
    if (sections.length > 1) {
      textToProcess = sections[1]; // Focus on the part after "DSP WEEKLY SUMMARY"
      console.log("Processing section after DSP WEEKLY SUMMARY");
      dspWeeklySummaryFound = true;
    }
  }
  
  // Split text into lines to process
  const lines = textToProcess.split(/\r?\n/);
  
  // Look for table header containing "Transporter ID" and other column headers
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
  
  // If header found, process all lines after it that start with 'A'
  if (headerIndex !== -1) {
    console.log("Processing driver rows from table...");
    
    // Process each line after the header
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines or lines that don't start with 'A'
      if (!line || !line.startsWith('A')) continue;
      
      // Extract the driver ID (first part of the line before whitespace)
      const driverId = line.split(/\s+/)[0];
      
      // Skip if already processed or if it's obviously not a driver ID 
      if (processedDriverIds.has(driverId) || driverId.length < 5) continue;
      
      console.log(`Processing line for driver: ${driverId}`);
      
      // Extract all numeric values from the line
      const numericValues = line.match(/\d+(?:\.\d+)?%?/g);
      
      if (numericValues && numericValues.length >= 4) {
        // Clean and convert values to numbers
        const values = numericValues.map(val => parseFloat(val.replace('%', '')));
        
        // Create driver with metrics
        const metrics = [];
        
        // Map values to metrics based on expected column order
        // Based on the image: Delivered, DCR, DNR DPMO, POD, CC, CE, DEX
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        
        for (let j = 0; j < Math.min(values.length, metricNames.length); j++) {
          metrics.push({
            name: metricNames[j],
            value: values[j],
            target: metricTargets[j],
            status: determineStatus(metricNames[j], values[j])
          });
        }
        
        // Add the driver with complete metrics
        drivers.push({
          name: driverId,
          status: "active",
          metrics: ensureAllMetrics(metrics)
        });
        
        // Mark as processed
        processedDriverIds.add(driverId);
        console.log(`Added driver ${driverId} with ${metrics.length} metrics`);
      }
    }
  } else if (dspWeeklySummaryFound) {
    // If we found DSP WEEKLY SUMMARY but not the header, try a more flexible approach
    console.log("Header row not found, using flexible line parsing for DSP WEEKLY SUMMARY");
    
    // Process each line and look for driver IDs (starting with 'A')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines or lines that don't start with 'A'
      if (!line || !line.startsWith('A')) continue;
      
      // Extract the driver ID (first part of the line before whitespace)
      const parts = line.split(/\s+/);
      const driverId = parts[0];
      
      // Skip if already processed or if it's obviously not a driver ID
      if (processedDriverIds.has(driverId) || driverId.length < 5) continue;
      
      // Extract numeric values from the remaining parts
      const values = parts.filter(part => /^\d+(?:\.\d+)?%?$/.test(part))
                          .map(val => parseFloat(val.replace('%', '')));
      
      if (values.length >= 4) {  // Need at least 4 metrics to be valid
        const metrics = [];
        
        // Map values to metrics based on expected column order
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        
        for (let j = 0; j < Math.min(values.length, metricNames.length); j++) {
          metrics.push({
            name: metricNames[j],
            value: values[j],
            target: metricTargets[j],
            status: determineStatus(metricNames[j], values[j])
          });
        }
        
        // Add the driver with complete metrics
        drivers.push({
          name: driverId,
          status: "active",
          metrics: ensureAllMetrics(metrics)
        });
        
        // Mark as processed
        processedDriverIds.add(driverId);
        console.log(`Added driver ${driverId} with ${metrics.length} metrics from flexible parsing`);
      }
    }
  }
  
  // If still no drivers found, try an even more aggressive extraction 
  if (drivers.length === 0) {
    console.log("No drivers found with structured approaches, trying aggressive pattern matching");
    
    // Find any 'A' prefixed ID followed by numbers
    const driverPattern = /\b(A[A-Z0-9]{5,})\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)/g;
    
    let match;
    while ((match = driverPattern.exec(text)) !== null) {
      const [_, driverId, ...valueStrings] = match;
      
      // Skip if already processed
      if (processedDriverIds.has(driverId)) continue;
      
      // Convert values to numbers
      const values = valueStrings.map(val => parseFloat(val.replace('%', '')));
      
      if (values.length >= 4) {
        const metrics = [];
        
        // Map values to metrics
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        
        for (let j = 0; j < Math.min(values.length, metricNames.length); j++) {
          metrics.push({
            name: metricNames[j],
            value: values[j],
            target: metricTargets[j],
            status: determineStatus(metricNames[j], values[j])
          });
        }
        
        // Add the driver
        drivers.push({
          name: driverId,
          status: "active",
          metrics: ensureAllMetrics(metrics)
        });
        
        // Mark as processed
        processedDriverIds.add(driverId);
        console.log(`Added driver ${driverId} with ${metrics.length} metrics from aggressive pattern matching`);
      }
    }
  }
  
  console.log(`Extracted ${drivers.length} drivers with enhanced patterns focusing on A-prefixed IDs`);
  
  // Ensure all drivers have complete metrics
  return drivers;
}
