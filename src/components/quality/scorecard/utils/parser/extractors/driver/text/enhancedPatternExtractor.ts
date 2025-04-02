
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { ensureAllMetrics } from '../utils/metricUtils';

interface ExtractorOptions {
  prioritizeAIds?: boolean;
}

/**
 * Extract driver KPIs using enhanced pattern matching
 */
export const extractDriversWithEnhancedPatterns = (text: string, options: ExtractorOptions = {}): DriverKPI[] => {
  console.log("Extracting drivers with enhanced patterns");
  
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
  
  // Process lines after the header
  if (headerIndex !== -1) {
    // Define patterns for IDs starting with 'A'
    const idPatterns = options.prioritizeAIds 
      ? [
          /\b([A][A-Z0-9]{5,})\b/g,  // Matches IDs starting with A followed by at least 5 alphanumeric chars
          /\b([A][A-Z0-9]{2,}[A-Z0-9]*)\b/g  // More flexible pattern for A-prefixed IDs
        ]
      : [
          /\b([A-Z][A-Z0-9]{5,})\b/g,  // Any letter followed by at least 5 alphanumeric
          /\b(TR[-\s]?\d{3,})\b/g  // Traditional TR-### format
        ];
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty or short lines
      if (line.length < 5) continue;
      
      // Skip lines that look like page breaks or section markers
      if (line.includes("Page") || line.includes("Seite") || line.includes("----")) continue;
      
      // Try each pattern to find IDs
      for (const pattern of idPatterns) {
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
            
            // Add the driver
            drivers.push({
              name: id,
              status: "active",
              metrics: metrics
            });
            
            // Mark this ID as processed
            processedDriverIds.add(id);
            
            console.log(`Added driver ${id} with ${metrics.length} metrics`);
          }
        }
      }
    }
  } else {
    // If we can't find a clear header, try to extract using patterns across all text
    console.log("No clear table header found, trying pattern-based extraction across all text");
    
    // Use regex to find patterns like "A12345 1234 98.5 2500" (ID followed by metrics)
    const driverBlocks = textToProcess.match(/\b([A][A-Z0-9]{5,})[^\n]*?(\d+(?:\.\d+)?)[^\n]*?(\d+(?:\.\d+)?)[^\n]*?(\d+(?:\.\d+)?)/g);
    
    if (driverBlocks && driverBlocks.length > 0) {
      console.log(`Found ${driverBlocks.length} potential driver blocks without clear header`);
      
      driverBlocks.forEach(block => {
        // Get the ID
        const idMatch = block.match(/\b([A][A-Z0-9]{5,})\b/);
        if (!idMatch) return;
        
        const id = idMatch[1];
        
        // Skip if we've already processed this ID
        if (processedDriverIds.has(id)) return;
        
        // Extract numeric values
        const numericValues = block.match(/\b(\d+(?:\.\d+)?)\b/g);
        if (!numericValues || numericValues.length < 3) return;
        
        // Convert values to numbers
        const values = numericValues.map(v => parseFloat(v));
        
        // Create metrics (same as above)
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
        
        // Add more metrics if values are available (same as above)
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
        
        // Add the driver
        drivers.push({
          name: id,
          status: "active",
          metrics: metrics
        });
        
        // Mark as processed
        processedDriverIds.add(id);
        
        console.log(`Added driver ${id} with ${metrics.length} metrics from block pattern`);
      });
    }
  }
  
  console.log(`Extracted ${drivers.length} drivers with enhanced patterns`);
  
  // Ensure all drivers have complete metrics
  return ensureAllMetrics(drivers);
};
