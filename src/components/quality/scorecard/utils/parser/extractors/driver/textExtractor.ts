
import { determineStatus } from '../../../helpers/statusHelper';
import { generateSampleDrivers } from './sampleData';
import { DriverKPI } from '../../../../types';

/**
 * Extract driver KPIs from text content using regex patterns
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  const drivers: DriverKPI[] = [];
  
  // First try with a more specific tabular pattern
  const driverTablePattern = /(TR[-\s]?\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)[\s\r\n]+([\d.]+%?)[\s\r\n]+([\d.]+%?)[\s\r\n]+([\d.]+%?)/g;
  const tableMatches = Array.from(text.matchAll(driverTablePattern));
  
  if (tableMatches && tableMatches.length > 0) {
    console.log(`Found ${tableMatches.length} drivers in table format`);
    
    // Process each driver match from table
    tableMatches.forEach(match => {
      const driverName = match[1].trim();
      console.log(`Found driver in table format: ${driverName}`);
      
      // Extract values, handling both numbers and percentages
      const extractNumeric = (str: string) => {
        return parseFloat(str.replace('%', '').replace(',', '.'));
      };
      
      const metrics = [
        {
          name: "Delivered",
          value: extractNumeric(match[2]),
          target: 100,
          unit: "%",
          status: determineStatus("Delivered", extractNumeric(match[2]))
        },
        {
          name: "DNR DPMO", 
          value: extractNumeric(match[3]),
          target: 3000,
          unit: "DPMO",
          status: determineStatus("DNR DPMO", extractNumeric(match[3]))
        }
      ];
      
      // Add a third metric if present
      if (match[4]) {
        metrics.push({
          name: "Contact Compliance",
          value: extractNumeric(match[4]),
          target: 95,
          unit: "%",
          status: determineStatus("Contact Compliance", extractNumeric(match[4]))
        });
      }
      
      // Add driver to list
      drivers.push({
        name: driverName,
        status: "active",
        metrics
      });
    });
    
    if (drivers.length > 0) {
      return drivers;
    }
  }
  
  // If table format fails, try more flexible pattern
  const driverPattern = /(?:TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)[\s\n]+(?:\d+[\.\,]\d+|\d+)%?\s+(?:\d+[\.\,]\d+|\d+)%?/g;
  const driverMatches = text.match(driverPattern);
  
  if (!driverMatches || driverMatches.length === 0) {
    console.warn("No driver KPIs found in text, attempting to find any driver identifiers");
    
    // Last resort approach - look for just driver IDs and assign placeholder metrics
    const driverIdPattern = /TR[-\s]?\d+/g;
    const driverIdMatches = text.match(driverIdPattern);
    
    if (driverIdMatches && driverIdMatches.length > 0) {
      console.log(`Found ${driverIdMatches.length} driver IDs, creating placeholder data`);
      
      // Create basic entries for each driver ID found
      return driverIdMatches.map((driverId, index) => ({
        name: driverId.trim(),
        status: "active",
        metrics: [
          {
            name: "Delivered",
            value: 95 + (index % 5),
            target: 100,
            unit: "%",
            status: "great" as const
          },
          {
            name: "DNR DPMO",
            value: 3000 - (index * 200),
            target: 3000,
            unit: "DPMO",
            status: "great" as const
          }
        ]
      }));
    }
    
    // If still no drivers found, use sample data with warning
    console.warn("No driver IDs found, using sample data");
    return generateSampleDrivers();
  }
  
  // Process driver matches from flexible pattern
  return processDriverTextMatches(driverMatches);
};

/**
 * Helper function to process driver matches from text
 */
const processDriverTextMatches = (driverMatches: RegExpMatchArray): DriverKPI[] => {
  const drivers: DriverKPI[] = [];
  
  driverMatches.forEach(match => {
    // Extract driver ID or name
    const nameMatch = match.match(/^(TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (!nameMatch) return;
    
    const driverName = nameMatch[1];
    console.log(`Found driver with flexible pattern: ${driverName}`);
    
    // Extract numerical metrics that follow the name
    const metricMatches = match.match(/(\d+(?:[.,]\d+)?)/g);
    if (!metricMatches || metricMatches.length < 2) return;
    
    // Create metrics based on the numbers found
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
    
    // Add driver to list
    drivers.push({
      name: driverName,
      status: "active",
      metrics
    });
  });
  
  return drivers;
};
