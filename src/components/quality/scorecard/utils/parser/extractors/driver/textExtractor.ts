import { determineStatus } from '../../../helpers/statusHelper';
import { generateSampleDrivers } from './sampleData';
import { DriverKPI } from '../../../../types';

/**
 * Extract driver KPIs from text content using regex patterns
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  const drivers: DriverKPI[] = [];
  
  // Pattern specifically for the DSP Weekly Summary table format
  // Format in PDF: TransporterID Delivered DCR DNR_DPMO POD CC CE DEX
  const dspWeeklySummaryPattern = /([A-Z0-9]{10,})\s+([\d,\.]+)\s+([\d,\.]+%?)\s+([\d,\.]+)\s+([\d,\.]+%?)\s+([\d,\.]+%?)\s+([\d,\.]+)\s+([\d,\.]+%?)/g;
  const dspMatches = Array.from(text.matchAll(dspWeeklySummaryPattern));
  
  console.log(`DSP Weekly Summary pattern matches: ${dspMatches.length}`);
  
  if (dspMatches && dspMatches.length > 0) {
    console.log(`Found ${dspMatches.length} drivers in DSP Weekly Summary format`);
    
    dspMatches.forEach(match => {
      const driverID = match[1].trim();
      console.log(`Found driver ID: ${driverID} with ${match.length} columns`);
      
      // Extract values, handling both numbers and percentages
      const extractNumeric = (str: string) => {
        return parseFloat(str.replace('%', '').replace(',', '.'));
      };
      
      // Create full metrics array based on all captured columns
      const metrics = [];
      
      // Delivered value (keep original name from PDF)
      if (match[2]) {
        metrics.push({
          name: "Delivered",
          value: extractNumeric(match[2] || "0"),
          target: 0,
          unit: "",
          status: determineStatus("Delivered", extractNumeric(match[2] || "0"))
        });
      }
      
      // DCR percentage (keep original name from PDF)
      if (match[3]) {
        const dcr = extractNumeric(match[3] || "0");
        metrics.push({
          name: "DCR",
          value: dcr,
          target: 98.5,
          unit: "%",
          status: determineStatus("DCR", dcr)
        });
      }
      
      // DNR DPMO value
      if (match[4]) {
        const dnrDpmo = extractNumeric(match[4] || "0");
        metrics.push({
          name: "DNR DPMO", 
          value: dnrDpmo,
          target: 1500,
          unit: "DPMO",
          status: determineStatus("DNR DPMO", dnrDpmo)
        });
      }
      
      // POD percentage
      if (match[5]) {
        const podValue = extractNumeric(match[5] || "0");
        metrics.push({
          name: "POD",
          value: podValue,
          target: 98,
          unit: "%",
          status: determineStatus("POD", podValue)
        });
      }
      
      // CC percentage (Contact Compliance)
      if (match[6]) {
        const ccValue = extractNumeric(match[6] || "0");
        metrics.push({
          name: "CC",
          value: ccValue,
          target: 95,
          unit: "%",
          status: determineStatus("Contact Compliance", ccValue)
        });
      }
      
      // CE (Customer Escalations)
      if (match[7]) {
        const ceValue = extractNumeric(match[7] || "0");
        metrics.push({
          name: "CE",
          value: ceValue,
          target: 0,
          unit: "",
          status: ceValue === 0 ? "fantastic" as const : "poor" as const
        });
      }
      
      // DEX percentage
      if (match[8]) {
        const dexValue = extractNumeric(match[8] || "0");
        metrics.push({
          name: "DEX",
          value: dexValue,
          target: 95,
          unit: "%",
          status: determineStatus("DEX", dexValue)
        });
      }
      
      // Add driver to list if we found some metrics
      if (metrics.length > 0) {
        drivers.push({
          name: driverID,
          status: "active",
          metrics
        });
      }
    });
    
    if (drivers.length > 0) {
      console.log(`Successfully extracted ${drivers.length} drivers from DSP Weekly Summary format with ${drivers[0]?.metrics.length || 0} metrics each`);
      return drivers;
    }
  }
  
  // Try with a more flexible pattern that might catch more drivers
  const flexPattern = /([A-Z0-9]{10,})[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)/g;
  const flexMatches = Array.from(text.matchAll(flexPattern));
  
  console.log(`Flexible pattern matches: ${flexMatches.length}`);
  
  if (flexMatches && flexMatches.length > 0) {
    // Process results similar to above
    // This is a backup in case the stricter pattern fails
    console.log(`Found ${flexMatches.length} drivers with flexible pattern`);
    return processFlexMatches(flexMatches);
  }
  
  // Try the line-based approach which looks for driver patterns line by line
  console.log("Trying line-based extraction approach");
  const lines = text.split(/\r?\n/);
  const lineDrivers: DriverKPI[] = [];
  
  for (const line of lines) {
    const driverIdMatch = line.match(/^([A-Z0-9]{10,})/);
    if (driverIdMatch) {
      const driverId = driverIdMatch[1].trim();
      
      // Try to extract all numbers from this line
      const numbers = line.match(/[\d,.]+%?/g) || [];
      if (numbers.length >= 7) {
        const extractNumeric = (str: string) => {
          return parseFloat(str.replace('%', '').replace(',', '.'));
        };
        
        // Map numbers to metrics
        const metrics = [
          { name: "Delivered", value: extractNumeric(numbers[0]), target: 0, unit: "", status: determineStatus("Delivered", extractNumeric(numbers[0])) },
          { name: "DCR", value: extractNumeric(numbers[1]), target: 98.5, unit: "%", status: determineStatus("DCR", extractNumeric(numbers[1])) },
          { name: "DNR DPMO", value: extractNumeric(numbers[2]), target: 1500, unit: "DPMO", status: determineStatus("DNR DPMO", extractNumeric(numbers[2])) },
          { name: "POD", value: extractNumeric(numbers[3]), target: 98, unit: "%", status: determineStatus("POD", extractNumeric(numbers[3])) },
          { name: "CC", value: extractNumeric(numbers[4]), target: 95, unit: "%", status: determineStatus("Contact Compliance", extractNumeric(numbers[4])) },
          { name: "CE", value: extractNumeric(numbers[5]), target: 0, unit: "", status: extractNumeric(numbers[5]) === 0 ? "fantastic" as const : "poor" as const },
          { name: "DEX", value: extractNumeric(numbers[6]), target: 95, unit: "%", status: determineStatus("DEX", extractNumeric(numbers[6])) }
        ];
        
        lineDrivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        
        console.log(`Added driver ${driverId} from line-based extraction`);
      }
    }
  }
  
  if (lineDrivers.length > 0) {
    console.log(`Successfully extracted ${lineDrivers.length} drivers with line-based approach`);
    return lineDrivers;
  }
  
  // Fall back to sample data if no drivers were found
  console.warn("No driver KPIs found in text, using sample data");
  return generateSampleDrivers();
};

/**
 * Process matches from the flexible pattern
 */
function processFlexMatches(matches: RegExpMatchArray[]): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  
  matches.forEach(match => {
    const driverID = match[1].trim();
    
    // Extract numeric values
    const extractNumeric = (str: string) => {
      return parseFloat(str.replace('%', '').replace(',', '.'));
    };
    
    // Create metrics array
    const metrics = [
      { name: "Delivered", value: extractNumeric(match[2] || "0"), target: 0, unit: "", status: determineStatus("Delivered", extractNumeric(match[2] || "0")) },
      { name: "DCR", value: extractNumeric(match[3] || "0"), target: 98.5, unit: "%", status: determineStatus("DCR", extractNumeric(match[3] || "0")) },
      { name: "DNR DPMO", value: extractNumeric(match[4] || "0"), target: 1500, unit: "DPMO", status: determineStatus("DNR DPMO", extractNumeric(match[4] || "0")) },
      { name: "POD", value: extractNumeric(match[5] || "0"), target: 98, unit: "%", status: determineStatus("POD", extractNumeric(match[5] || "0")) },
      { name: "CC", value: extractNumeric(match[6] || "0"), target: 95, unit: "%", status: determineStatus("Contact Compliance", extractNumeric(match[6] || "0")) },
      { name: "CE", value: extractNumeric(match[7] || "0"), target: 0, unit: "", status: extractNumeric(match[7] || "0") === 0 ? "fantastic" as const : "poor" as const },
      { name: "DEX", value: extractNumeric(match[8] || "0"), target: 95, unit: "%", status: determineStatus("DEX", extractNumeric(match[8] || "0")) }
    ];
    
    // Add driver to list
    drivers.push({
      name: driverID,
      status: "active",
      metrics
    });
  });
  
  return drivers;
}
