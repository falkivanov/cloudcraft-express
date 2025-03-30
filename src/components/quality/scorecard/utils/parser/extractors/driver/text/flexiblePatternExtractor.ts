
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

/**
 * Extract drivers using a more flexible pattern matching approach
 */
export const extractDriversWithFlexiblePattern = (text: string): DriverKPI[] => {
  const drivers: DriverKPI[] = [];
  
  // More flexible pattern that might catch more drivers
  const flexPattern = /([A-Z0-9]{10,})[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)[\s\n]+([\d,.]+)/g;
  const flexMatches = Array.from(text.matchAll(flexPattern));
  
  console.log(`Flexible pattern matches: ${flexMatches.length}`);
  
  if (flexMatches && flexMatches.length > 0) {
    console.log(`Found ${flexMatches.length} drivers with flexible pattern`);
    
    flexMatches.forEach(match => {
      const driverID = match[1].trim();
      
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
  }
  
  return drivers;
}
