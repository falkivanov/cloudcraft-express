import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

/**
 * Extract drivers from the DSP Weekly Summary table format
 */
export const extractDriversFromDSPWeeklySummary = (text: string): DriverKPI[] => {
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
  }
  
  return drivers;
}
