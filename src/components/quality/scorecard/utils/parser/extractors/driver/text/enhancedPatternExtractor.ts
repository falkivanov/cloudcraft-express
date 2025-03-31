
import { DriverKPI } from '../../../../../types';
import { generateSampleDrivers } from '../sampleData';
import { determineMetricStatus } from '../../../driver/utils/metricStatus';

/**
 * Extract driver KPIs from text content using enhanced pattern matching
 * with support for status indicators
 */
export const extractDriversWithEnhancedPatterns = (text: string): DriverKPI[] => {
  console.log("Extracting drivers with enhanced pattern matching");
  
  const drivers: DriverKPI[] = [];
  const namePatterns = [
    /(\w+(?:\s+\w+)?)\s+(\d+)\s+(\d+\.\d+)%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)?/gi, // Name followed by numbers and percentage with optional status
    /(\w+(?:\s+\w+)?)\s+(\d+\.\d+)%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)?/gi // Name followed by percentage with optional status
  ];
  
  // Try to find driver sections - look for header patterns
  const driverSectionPatterns = [
    /Driver(?:\s+ID)?\s+DCR\s+DNR/i,
    /Transporter(?:\s+ID)?\s+Deliver(?:ed)?\s+DCR/i,
    /Name\s+Deliver(?:ed)?\s+DCR/i
  ];
  
  let driverSectionText = text;
  for (const pattern of driverSectionPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Get text after this header
      const startIndex = text.indexOf(match[0]);
      driverSectionText = text.substring(startIndex);
      console.log("Found driver section header:", match[0]);
      break;
    }
  }
  
  // Process the driver section with stricter pattern matching
  const driverPattern = /(\w+(?:\s+\w+)?)\s+(\d+)\s+(\d+\.\d+)(?:%)?(?:\s*\|\s*(poor|fair|great|fantastic))?\s+(\d+)(?:\s*\|\s*(poor|fair|great|fantastic))?\s+(\d+\.\d+)(?:%)?(?:\s*\|\s*(poor|fair|great|fantastic))?\s+(\d+\.\d+)(?:%)?(?:\s*\|\s*(poor|fair|great|fantastic))?\s+(\d+)(?:\s*\|\s*(poor|fair|great|fantastic))?\s+(\d+\.\d+)(?:%)?(?:\s*\|\s*(poor|fair|great|fantastic))?/gi;
  
  let match;
  while ((match = driverPattern.exec(driverSectionText)) !== null) {
    const name = match[1].trim();
    
    // Extract metrics and their status indicators
    const delivered = parseInt(match[2], 10);
    const deliveredStatus = match[4] || determineDefaultStatus("Delivered", delivered);
    
    const dcrValue = parseFloat(match[3]);
    const dcrStatus = match[6] || determineDefaultStatus("DCR", dcrValue);
    
    const dnrDpmoValue = parseInt(match[5], 10);
    const dnrDpmoStatus = match[8] || determineDefaultStatus("DNR DPMO", dnrDpmoValue);
    
    const podValue = parseFloat(match[7]);
    const podStatus = match[10] || determineDefaultStatus("POD", podValue);
    
    const ccValue = parseFloat(match[9]);
    const ccStatus = match[12] || determineDefaultStatus("CC", ccValue);
    
    const ceValue = parseInt(match[11], 10);
    const ceStatus = match[14] || determineDefaultStatus("CE", ceValue);
    
    try {
      const dexValue = parseFloat(match[13]);
      const dexStatus = "fair"; // Default
      
      drivers.push({
        name,
        status: "active", // Set default status to active
        metrics: [
          { name: "Delivered", value: delivered, target: 0, unit: "", status: deliveredStatus as any },
          { name: "DCR", value: dcrValue, target: 98.5, unit: "%", status: dcrStatus as any },
          { name: "DNR DPMO", value: dnrDpmoValue, target: 1500, unit: "DPMO", status: dnrDpmoStatus as any },
          { name: "POD", value: podValue, target: 98, unit: "%", status: podStatus as any },
          { name: "CC", value: ccValue, target: 95, unit: "%", status: ccStatus as any },
          { name: "CE", value: ceValue, target: 0, unit: "", status: ceStatus as any },
          { name: "DEX", value: dexValue, target: 95, unit: "%", status: dexStatus as any }
        ]
      });
    } catch (error) {
      console.log("Error parsing driver:", name, error);
    }
  }
  
  // If we found at least one driver with the strict pattern, return them
  if (drivers.length > 0) {
    console.log(`Found ${drivers.length} drivers with enhanced pattern matching`);
    return drivers;
  }
  
  // Fall back to a more flexible approach - look for each metric separately
  console.log("Falling back to more flexible approach for driver extraction");
  
  // Extract names first
  const nameMatches = [];
  for (const pattern of namePatterns) {
    let nameMatch;
    pattern.lastIndex = 0; // Reset the regex index
    while ((nameMatch = pattern.exec(driverSectionText)) !== null) {
      nameMatches.push(nameMatch[1].trim());
    }
  }
  
  // Deduplicate names
  const uniqueNames = [...new Set(nameMatches)];
  console.log(`Found ${uniqueNames.length} unique driver names`);
  
  if (uniqueNames.length > 0) {
    // For each name, try to find its metrics
    for (const name of uniqueNames) {
      const nameRegex = new RegExp(name + '\\s+([\\d.]+)(?:\\s*\\|\\s*([a-z]+))?\\s+([\\d.]+)(?:\\s*\\|\\s*([a-z]+))?\\s+([\\d.]+)(?:\\s*\\|\\s*([a-z]+))?', 'i');
      const metricMatch = driverSectionText.match(nameRegex);
      
      if (metricMatch) {
        try {
          const driverMetrics = [];
          const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
          const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
          const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
          
          for (let i = 0; i < 7; i++) {
            const valueIndex = 1 + (i * 2);
            const statusIndex = valueIndex + 1;
            
            if (metricMatch[valueIndex]) {
              const value = parseFloat(metricMatch[valueIndex]);
              const status = metricMatch[statusIndex] || determineDefaultStatus(metricNames[i], value);
              
              driverMetrics.push({
                name: metricNames[i],
                value: value,
                target: metricTargets[i],
                unit: metricUnits[i],
                status: status as any
              });
            }
          }
          
          if (driverMetrics.length > 0) {
            drivers.push({
              name,
              status: "active",
              metrics: driverMetrics
            });
          }
        } catch (error) {
          console.log("Error parsing driver metrics for:", name, error);
        }
      }
    }
  }
  
  // If we still have no drivers, return sample data
  if (drivers.length === 0) {
    console.warn("Could not extract any drivers with status information, using sample data");
    return generateSampleDrivers();
  }
  
  console.log(`Extracted ${drivers.length} drivers with status information`);
  return drivers;
};

/**
 * Determine the default status for a metric based on its value
 */
function determineDefaultStatus(metricName: string, value: number): string {
  switch (metricName) {
    case "Delivered":
      return value >= 1000 ? "fantastic" : value >= 800 ? "great" : "fair";
    
    case "DCR":
      return value >= 99 ? "fantastic" : value >= 98.5 ? "great" : value >= 98 ? "fair" : "poor";
    
    case "DNR DPMO":
      return value <= 1000 ? "fantastic" : value <= 1500 ? "great" : value <= 2000 ? "fair" : "poor";
    
    case "POD":
      return value >= 99 ? "fantastic" : value >= 98 ? "great" : value >= 97 ? "fair" : "poor";
    
    case "CC":
      return value >= 97 ? "fantastic" : value >= 95 ? "great" : value >= 90 ? "fair" : "poor";
    
    case "CE":
      return value === 0 ? "fantastic" : "poor";
    
    case "DEX":
      return value >= 96 ? "fantastic" : value >= 95 ? "great" : value >= 90 ? "fair" : "poor";
    
    default:
      return "fair";
  }
}
