import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

/**
 * Extract drivers from the DSP Weekly Summary table format
 */
export const extractDriversFromDSPWeeklySummary = (text: string): DriverKPI[] => {
  const drivers: DriverKPI[] = [];
  
  // First check if the text contains the DSP Weekly Summary header
  const hasDSPWeeklySummary = /DSP\s+WEEKLY\s+SUMMARY/i.test(text);
  console.log(`Text contains DSP Weekly Summary header: ${hasDSPWeeklySummary}`);
  
  // Multiple patterns to match different DSP Weekly Summary formats
  const patterns = [
    // Standard format with 7-8 columns
    /([A-Z0-9]{5,})\s+([\d,\.]+)\s+([\d,\.]+%?)\s+([\d,\.]+)\s+([\d,\.]+%?)\s+([\d,\.]+%?)\s+([\d,\.]+)(?:\s+([\d,\.]+%?))?/g,
    
    // Alternative format with fewer columns (at least 4)
    /([A-Z0-9]{5,})\s+([\d,\.]+)\s+([\d,\.]+%?)\s+([\d,\.]+)(?:\s+([\d,\.]+%?))?/g,
    
    // TR-format pattern with numbers
    /(TR[-\s]?\d{3,})\s+([\d,\.]+)\s+([\d,\.]+%?)\s+([\d,\.]+)(?:\s+([\d,\.]+%?))?/g
  ];
  
  let totalMatches = 0;
  
  // Try each pattern
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    totalMatches += matches.length;
    console.log(`Pattern matches: ${matches.length}`);
    
    if (matches && matches.length > 0) {
      console.log(`Found ${matches.length} drivers with pattern`);
      
      matches.forEach(match => {
        const driverID = match[1].trim();
        
        // Skip if it's likely a header row
        if (driverID.toLowerCase().includes('transporter') || 
            driverID.toLowerCase() === 'id' ||
            driverID.toLowerCase().includes('driver')) {
          return;
        }
        
        console.log(`Processing driver ID: ${driverID} with ${match.length} columns`);
        
        // Create metrics array
        const metrics = [];
        
        // Delivered value
        if (match[2]) {
          metrics.push({
            name: "Delivered",
            value: extractNumeric(match[2]),
            target: 0,
            unit: "",
            status: determineStatus("Delivered", extractNumeric(match[2]))
          });
        }
        
        // DCR percentage
        if (match[3]) {
          const dcr = extractNumeric(match[3]);
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
          const dnrDpmo = extractNumeric(match[4]);
          metrics.push({
            name: "DNR DPMO", 
            value: dnrDpmo,
            target: 1500,
            unit: "DPMO",
            status: determineStatus("DNR DPMO", dnrDpmo)
          });
        }
        
        // Add optional metrics if available
        if (match[5]) {
          const podValue = extractNumeric(match[5]);
          metrics.push({
            name: "POD",
            value: podValue,
            target: 98,
            unit: "%",
            status: determineStatus("POD", podValue)
          });
        }
        
        if (match[6]) {
          const ccValue = extractNumeric(match[6]);
          metrics.push({
            name: "CC",
            value: ccValue,
            target: 95,
            unit: "%",
            status: determineStatus("Contact Compliance", ccValue)
          });
        }
        
        if (match[7]) {
          const ceValue = extractNumeric(match[7]);
          metrics.push({
            name: "CE",
            value: ceValue,
            target: 0,
            unit: "",
            status: ceValue === 0 ? "fantastic" as const : "poor" as const
          });
        }
        
        if (match[8]) {
          const dexValue = extractNumeric(match[8]);
          metrics.push({
            name: "DEX",
            value: dexValue,
            target: 95,
            unit: "%",
            status: determineStatus("DEX", dexValue)
          });
        }
        
        // Only add driver if we have at least some metrics
        if (metrics.length > 0) {
          // Check if this driver ID already exists (avoid duplicates)
          const existingDriverIndex = drivers.findIndex(d => d.name === driverID);
          
          if (existingDriverIndex === -1) {
            // New driver, add to list
            drivers.push({
              name: driverID,
              status: "active",
              metrics
            });
            console.log(`Added new driver ${driverID} with ${metrics.length} metrics`);
          } else {
            // Existing driver, possibly merge metrics if new ones found
            console.log(`Driver ${driverID} already exists, skipping`);
          }
        }
      });
    }
  }
  
  console.log(`DSP Weekly Summary extraction total matches: ${totalMatches}, unique drivers: ${drivers.length}`);
  return drivers;
}
