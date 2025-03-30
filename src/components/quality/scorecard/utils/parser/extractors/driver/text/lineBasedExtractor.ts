
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric } from '../structural/valueExtractor';

/**
 * Extract drivers by processing the text content line by line
 */
export const extractDriversLineByLine = (text: string): DriverKPI[] => {
  console.log("Trying line-based extraction approach");
  const lines = text.split(/\r?\n/);
  const drivers: DriverKPI[] = [];
  
  for (const line of lines) {
    const driverIdMatch = line.match(/^([A-Z0-9]{10,})/);
    if (driverIdMatch) {
      const driverId = driverIdMatch[1].trim();
      
      // Try to extract all numbers from this line
      const numbers = line.match(/[\d,.]+%?/g) || [];
      if (numbers.length >= 7) {
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
        
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        
        console.log(`Added driver ${driverId} from line-based extraction`);
      }
    }
  }
  
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with line-based approach`);
  }
  
  return drivers;
}
