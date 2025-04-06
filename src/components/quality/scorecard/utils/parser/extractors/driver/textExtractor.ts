
import { DriverKPI } from "../../../../types";
import { determineStatus } from "../../../helpers/statusHelper";

/**
 * Extract driver KPIs from text content using pattern matching
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text using pattern matching");
  const drivers: DriverKPI[] = [];
  
  // Common pattern for drivers - ID followed by metric values
  const driverPattern = /(?:TR[-\s]?\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)[\s\n]+(?:\d+[\.\,]\d+|\d+)%?\s+(?:\d+[\.\,]\d+|\d+)%?/g;
  const driverMatches = text.match(driverPattern);
  
  if (driverMatches && driverMatches.length > 0) {
    console.log(`Found ${driverMatches.length} potential driver matches`);
    
    // Process each driver match
    driverMatches.forEach(match => {
      // Extract driver ID or name
      const nameMatch = match.match(/^(TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)/);
      if (!nameMatch) return;
      
      const driverName = nameMatch[1];
      
      // Extract numerical metrics that follow the name
      const metricMatches = match.match(/(\d+(?:[.,]\d+)?)/g);
      if (!metricMatches || metricMatches.length < 2) return;
      
      // Create metrics based on the numbers found (assign reasonable names)
      const metrics = [
        {
          name: "Delivered",
          value: parseFloat(metricMatches[0].replace(',', '.')),
          target: 100,
          unit: "%",
          status: determineStatus("Delivered", parseFloat(metricMatches[0].replace(',', '.')))
        },
        {
          name: "DNR DPMO", 
          value: parseFloat(metricMatches[1].replace(',', '.')),
          target: 3000,
          unit: "DPMO",
          status: determineStatus("DNR DPMO", parseFloat(metricMatches[1].replace(',', '.')))
        }
      ];
      
      // Add more metrics if available
      if (metricMatches.length > 2) {
        metrics.push({
          name: "Contact Compliance",
          value: parseFloat(metricMatches[2].replace(',', '.')),
          target: 95,
          unit: "%",
          status: determineStatus("Contact Compliance", parseFloat(metricMatches[2].replace(',', '.')))
        });
      }
      
      // Add driver if not already in array (prevent duplicates)
      if (!drivers.some(d => d.name === driverName)) {
        drivers.push({
          name: driverName,
          status: "active",
          metrics
        });
      }
    });
  }
  
  console.log(`Extracted ${drivers.length} unique drivers from text`);
  return drivers;
};
