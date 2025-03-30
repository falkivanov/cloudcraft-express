
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

/**
 * Extract drivers using a more flexible pattern matching approach
 */
export const extractDriversWithFlexiblePattern = (text: string): DriverKPI[] => {
  const drivers: DriverKPI[] = [];
  
  // More flexible pattern that might catch more drivers
  // This pattern is more lenient with spacing and formatting
  const flexPattern = /([A-Z0-9]{5,})[\s\n]+([.\d,]+)[\s\n]+([.\d,]+%?)[\s\n]+([.\d,]+)[\s\n]+([.\d,]+%?)[\s\n]+([.\d,]+%?)[\s\n]+([.\d,]+)[\s\n]*([.\d,]+%?)?/g;
  const flexMatches = Array.from(text.matchAll(flexPattern));
  
  console.log(`Flexible pattern matches: ${flexMatches.length}`);
  
  if (flexMatches && flexMatches.length > 0) {
    console.log(`Found ${flexMatches.length} drivers with flexible pattern`);
    
    // Process each match to extract driver data
    flexMatches.forEach(match => {
      const driverID = match[1].trim();
      
      // Skip if it's likely a header row or doesn't look like a driver ID
      if (driverID.toLowerCase().includes('transporter') || driverID.toLowerCase() === 'id') {
        return;
      }
      
      // Create metrics array
      const metrics = [
        { name: "Delivered", value: extractNumeric(match[2] || "0"), target: 0, unit: "", status: determineStatus("Delivered", extractNumeric(match[2] || "0")) },
        { name: "DCR", value: extractNumeric(match[3] || "0"), target: 98.5, unit: "%", status: determineStatus("DCR", extractNumeric(match[3] || "0")) },
        { name: "DNR DPMO", value: extractNumeric(match[4] || "0"), target: 1500, unit: "DPMO", status: determineStatus("DNR DPMO", extractNumeric(match[4] || "0")) }
      ];
      
      // Add additional metrics if available
      if (match[5]) {
        metrics.push({ name: "POD", value: extractNumeric(match[5] || "0"), target: 98, unit: "%", status: determineStatus("POD", extractNumeric(match[5] || "0")) });
      }
      
      if (match[6]) {
        metrics.push({ name: "CC", value: extractNumeric(match[6] || "0"), target: 95, unit: "%", status: determineStatus("Contact Compliance", extractNumeric(match[6] || "0")) });
      }
      
      if (match[7]) {
        metrics.push({ name: "CE", value: extractNumeric(match[7] || "0"), target: 0, unit: "", status: extractNumeric(match[7] || "0") === 0 ? "fantastic" as const : "poor" as const });
      }
      
      if (match[8]) {
        metrics.push({ name: "DEX", value: extractNumeric(match[8] || "0"), target: 95, unit: "%", status: determineStatus("DEX", extractNumeric(match[8] || "0")) });
      }
      
      // Add driver to list
      drivers.push({
        name: driverID,
        status: "active",
        metrics
      });
      
      console.log(`Added driver ${driverID} with ${metrics.length} metrics from flexible pattern`);
    });
  }
  
  return drivers;
}
