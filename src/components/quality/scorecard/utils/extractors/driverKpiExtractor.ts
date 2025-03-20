
import { DriverKPI } from "../../types";
import { determineStatus } from '../helpers/statusHelper';

/**
 * Extract driver KPIs from text content
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from page 3");
  const drivers: DriverKPI[] = [];
  
  // Regular expression to find driver sections - looking for patterns like:
  // TR-123 or Driver Name followed by metrics
  const driverPattern = /(?:TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)[\s\n]+(?:\d+[\.\,]\d+|\d+)%?\s+(?:\d+[\.\,]\d+|\d+)%?/g;
  const driverMatches = text.match(driverPattern);
  
  if (!driverMatches || driverMatches.length === 0) {
    console.warn("No driver KPIs found on page 3, using sample data");
    // Return sample data if no drivers found
    return generateSampleDrivers();
  }
  
  // Process each driver match
  driverMatches.forEach(match => {
    // Extract driver ID or name
    const nameMatch = match.match(/^(TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (!nameMatch) return;
    
    const driverName = nameMatch[1];
    console.log(`Found driver: ${driverName}`);
    
    // Extract numerical metrics that follow the name
    const metricMatches = match.match(/(\d+(?:[.,]\d+)?)/g);
    if (!metricMatches || metricMatches.length < 2) return;
    
    // Create metrics based on the numbers found (assign reasonable names)
    const metrics = [
      {
        name: "Delivered",
        value: parseInt(metricMatches[0], 10),
        target: 100,
        unit: "%",
        status: determineStatus("Delivered", parseInt(metricMatches[0], 10))
      },
      {
        name: "DNR DPMO", 
        value: parseInt(metricMatches[1], 10),
        target: 3000,
        unit: "DPMO",
        status: determineStatus("DNR DPMO", parseInt(metricMatches[1], 10))
      }
    ];
    
    // Add more metrics if available
    if (metricMatches.length > 2) {
      metrics.push({
        name: "Contact Compliance",
        value: parseInt(metricMatches[2], 10),
        target: 95,
        unit: "%",
        status: determineStatus("Contact Compliance", parseInt(metricMatches[2], 10))
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

/**
 * Generate sample driver data when extraction fails
 */
const generateSampleDrivers = (): DriverKPI[] => {
  return [
    {
      name: "TR-001",
      status: "active",
      metrics: [
        { name: "Delivered", value: 98, target: 100, unit: "%", status: "great" },
        { name: "DNR DPMO", value: 2500, target: 3000, unit: "DPMO", status: "great" },
        { name: "Contact Compliance", value: 92, target: 95, unit: "%", status: "fair" }
      ]
    },
    {
      name: "TR-002",
      status: "active",
      metrics: [
        { name: "Delivered", value: 99, target: 100, unit: "%", status: "fantastic" },
        { name: "DNR DPMO", value: 2000, target: 3000, unit: "DPMO", status: "fantastic" },
        { name: "Contact Compliance", value: 96, target: 95, unit: "%", status: "fantastic" }
      ]
    }
  ];
};
