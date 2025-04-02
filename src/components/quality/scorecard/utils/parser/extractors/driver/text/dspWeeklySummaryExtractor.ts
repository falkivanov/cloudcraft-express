
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

type MetricStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Extract drivers from a DSP Weekly Summary formatted text
 */
export const extractDriversFromDSPWeeklySummary = (text: string): DriverKPI[] => {
  console.log("Trying DSP Weekly Summary extraction approach");
  
  // Check if the text contains the expected header
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Text does not contain 'DSP WEEKLY SUMMARY'");
    return [];
  }
  
  const drivers: DriverKPI[] = [];
  
  // Look for the header row pattern (we're more flexible now)
  const headerRowPattern = /TRANSPORTER\s+ID|TRANSPORT\s+ID|Driver\s+ID|TR\s+ID/i;
  const headerRowMatch = text.match(headerRowPattern);
  
  if (!headerRowMatch) {
    console.log("Could not find header row in DSP Weekly Summary");
    return [];
  }
  
  // Split text into lines and find the header line
  const lines = text.split(/\r?\n/);
  let headerLineIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (headerRowPattern.test(lines[i])) {
      headerLineIndex = i;
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.log("Could not locate header line index");
    return [];
  }
  
  console.log(`Found header at line ${headerLineIndex}: ${lines[headerLineIndex]}`);
  
  // Process driver rows after the header
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 5) continue;
    
    // Driver IDs starting with 'A' as specified in the PDF example
    const driverIdPattern = /([A][A-Z0-9]{5,})/;
    const idMatch = line.match(driverIdPattern);
    
    if (!idMatch) {
      // If we don't find an ID on this line, check if we've hit a page break or section end
      if (line.includes("Page") || line.includes("Seite") || line.includes("--") || line.includes("===")) {
        continue; // Skip pagination or section separators
      }
      
      // If it's not a pagination marker and doesn't match our pattern, try next line
      continue;
    }
    
    const driverId = idMatch[1].trim();
    console.log(`Found potential driver ID in DSP summary: ${driverId}`);
    
    // Extract values - look for numbers and percentages
    const valuesPattern = /([\d,.]+%?|-|\b\d+\b)/g;
    const values = line.match(valuesPattern) || [];
    
    // Skip the first match if it's part of the ID
    const valueStartIndex = (driverId.match(/\d+/)) ? 1 : 0;
    
    if (values.length >= 3 + valueStartIndex) {
      console.log(`Found ${values.length} values for ${driverId}`);
      
      // Define metric names and targets
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
      const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
      const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
      
      const metrics = [];
      let validValuesCount = 0;
      
      for (let j = valueStartIndex; j < values.length && validValuesCount < metricNames.length; j++) {
        const value = values[j];
        
        // Handle dash case
        if (value === "-") {
          metrics.push({
            name: metricNames[validValuesCount],
            value: 0,
            target: metricTargets[validValuesCount],
            unit: metricUnits[validValuesCount],
            status: "none" as MetricStatus
          });
          validValuesCount++;
          continue;
        }
        
        const numValue = extractNumeric(value);
        if (isNaN(numValue)) continue;
        
        metrics.push({
          name: metricNames[validValuesCount],
          value: numValue,
          target: metricTargets[validValuesCount],
          unit: metricUnits[validValuesCount],
          status: determineStatus(metricNames[validValuesCount], numValue)
        });
        
        validValuesCount++;
      }
      
      if (metrics.length >= 3) {
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        console.log(`Added driver ${driverId} with ${metrics.length} metrics from DSP summary`);
      }
    }
  }
  
  console.log(`Found ${drivers.length} drivers in DSP Weekly Summary format`);
  return drivers;
}
