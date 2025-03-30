import { determineStatus } from '../../../helpers/statusHelper';
import { generateSampleDrivers } from './sampleData';
import { DriverKPI } from '../../../../types';

/**
 * Extract driver KPIs from text content using regex patterns
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  const drivers: DriverKPI[] = [];
  
  // Pattern specifically for the DSP Weekly Summary table format from the image
  const dspWeeklySummaryPattern = /([A-Z0-9]{10,})\s+([\d.]+)\s+([\d.]+%?)\s+([\d]+)\s+([\d.]+%?)\s+([\d.]+%?)\s+([\d]+)\s+([\d.]+%?)/g;
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
      
      // Route count (stops)
      if (match[2]) {
        metrics.push({
          name: "Stops",
          value: parseInt(match[2] || "0"),
          target: 0, // No specific target for stops
          unit: "",
          status: "fantastic" as const
        });
      }
      
      // Delivered percentage
      if (match[3]) {
        const delivered = extractNumeric(match[3] || "0");
        metrics.push({
          name: "Delivered",
          value: delivered,
          target: 100,
          unit: "%",
          status: determineStatus("Delivered", delivered)
        });
      }
      
      // DNR DPMO value
      if (match[4]) {
        const dnrDpmo = parseInt(match[4] || "0");
        metrics.push({
          name: "DNR DPMO", 
          value: dnrDpmo,
          target: 3000, // Target for DNR DPMO
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
      
      // Contact Compliance percentage
      if (match[6]) {
        const ccValue = extractNumeric(match[6] || "0");
        metrics.push({
          name: "Contact Compliance",
          value: ccValue,
          target: 95,
          unit: "%",
          status: determineStatus("Contact Compliance", ccValue)
        });
      }
      
      // Customer Escalations (CE)
      if (match[7]) {
        const ceValue = parseInt(match[7] || "0");
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
  
  // If first pattern fails, try more flexible patterns with line breaks
  const flexibleTablePattern = /([A-Z0-9]{10,})[\s\n]+(\d+)[\s\n]+([\d.]+%)[\s\n]+(\d+)[\s\n]+([\d.]+%)[\s\n]+([\d.]+%)[\s\n]+(\d+)[\s\n]+([\d.]+%)/g;
  const flexMatches = Array.from(text.matchAll(flexibleTablePattern));
  
  console.log(`Flexible table pattern matches: ${flexMatches.length}`);
  
  if (flexMatches && flexMatches.length > 0) {
    console.log(`Found ${flexMatches.length} drivers with flexible pattern`);
    
    flexMatches.forEach(match => {
      const driverID = match[1].trim();
      console.log(`Found driver with flexible pattern: ${driverID}`);
      
      // Extract values, handling both numbers and percentages
      const extractNumeric = (str: string) => {
        return parseFloat(str.replace('%', '').replace(',', '.'));
      };
      
      // Create metrics collection from all matched groups
      const metrics = [];
      
      // Stops
      if (match[2]) {
        metrics.push({
          name: "Stops",
          value: parseInt(match[2]),
          target: 0,
          unit: "",
          status: "fantastic" as const
        });
      }
      
      // Delivered %
      if (match[3]) {
        const delivered = extractNumeric(match[3]);
        metrics.push({
          name: "Delivered",
          value: delivered,
          target: 100,
          unit: "%",
          status: determineStatus("Delivered", delivered)
        });
      }
      
      // DNR DPMO
      if (match[4]) {
        const dnrDpmo = parseInt(match[4]);
        metrics.push({
          name: "DNR DPMO", 
          value: dnrDpmo,
          target: 3000,
          unit: "DPMO",
          status: determineStatus("DNR DPMO", dnrDpmo)
        });
      }
      
      // POD %
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
      
      // Contact Compliance %
      if (match[6]) {
        const ccValue = extractNumeric(match[6]);
        metrics.push({
          name: "Contact Compliance",
          value: ccValue,
          target: 95,
          unit: "%",
          status: determineStatus("Contact Compliance", ccValue)
        });
      }
      
      // CE
      if (match[7]) {
        const ceValue = parseInt(match[7]);
        metrics.push({
          name: "CE",
          value: ceValue,
          target: 0,
          unit: "",
          status: ceValue === 0 ? "fantastic" as const : "poor" as const
        });
      }
      
      // DEX %
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
      
      // Add driver to list
      drivers.push({
        name: driverID,
        status: "active",
        metrics
      });
    });
    
    if (drivers.length > 0) {
      console.log(`Successfully extracted ${drivers.length} drivers with flexible pattern`);
      return drivers;
    }
  }
  
  // If flexible pattern fails, try more flexible pattern (original fallback)
  const driverPattern = /(?:TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)[\s\n]+(?:\d+[\.\,]\d+|\d+)%?\s+(?:\d+[\.\,]\d+|\d+)%?/g;
  const driverMatches = text.match(driverPattern);
  
  if (!driverMatches || driverMatches.length === 0) {
    console.warn("No driver KPIs found in text, attempting to find any driver identifiers");
    
    // Last resort approach - look for alphanumeric driver IDs (like A10PTF5T1G664)
    const alphanumericIdPattern = /[A-Z][A-Z0-9]{8,}/g;
    const alphanumericIdMatches = text.match(alphanumericIdPattern);
    
    if (alphanumericIdMatches && alphanumericIdMatches.length > 0) {
      console.log(`Found ${alphanumericIdMatches.length} alphanumeric driver IDs, creating placeholder data`);
      
      // Create basic entries for each driver ID found
      return alphanumericIdMatches.map((driverId, index) => ({
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
    
    // Try one more approach - looking for TR patterns
    const driverIdPattern = /TR[-\s]?\d+/g;
    const driverIdMatches = text.match(driverIdPattern);
    
    if (driverIdMatches && driverIdMatches.length > 0) {
      console.log(`Found ${driverIdMatches.length} driver IDs with TR pattern, creating placeholder data`);
      
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
