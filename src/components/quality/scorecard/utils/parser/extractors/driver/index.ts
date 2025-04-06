
import { DriverKPI } from '../../../../types';
import { extractDriversFromDSPWeekly } from './dsp-weekly';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { extractDriverKPIsFromText } from './textExtractor';
import { KPIStatus } from '../../../../utils/helpers/statusHelper';

/**
 * Extract driver KPIs from text content using multiple strategies
 * @param text Text content from which to extract driver KPIs
 * @param pageData Optional structured page data for enhanced extraction
 * @returns Array of DriverKPIs
 */
export const extractDriverKPIs = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Starting driver KPI extraction with multiple strategies");
  
  let drivers: DriverKPI[] = [];
  
  // First check if we have the DSP WEEKLY SUMMARY format that we see in the image
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY format detected, using specialized extractor");
    drivers = extractDriversFromDSPWeekly(text);
    
    // If we found a good number of drivers, return them
    if (drivers.length > 10) {
      console.log(`DSP WEEKLY SUMMARY extraction successful, found ${drivers.length} drivers`);
      return ensureAllMetrics(drivers);
    }
    
    if (drivers.length > 0) {
      console.log(`DSP WEEKLY SUMMARY extraction found ${drivers.length} drivers, but trying more methods`);
    }
  }
  
  // If DSP WEEKLY format didn't yield good results, try the enhanced pattern extractor
  console.log("Trying enhanced pattern extractor");
  const enhancedDrivers = extractDriversWithEnhancedPatterns(text);
  
  if (enhancedDrivers.length > drivers.length) {
    console.log(`Enhanced pattern extraction found ${enhancedDrivers.length} drivers, using these results`);
    drivers = enhancedDrivers;
    
    // If we found a good number of drivers, return them
    if (drivers.length > 10) {
      return ensureAllMetrics(drivers);
    }
  }
  
  // Try line-based extraction
  console.log("Trying line-based extraction");
  const lineBasedDrivers = extractDriversLineByLine(text);
  
  if (lineBasedDrivers.length > drivers.length) {
    console.log(`Line-based extraction found ${lineBasedDrivers.length} drivers, using these results`);
    drivers = lineBasedDrivers;
    
    // If we found a good number of drivers, return them
    if (drivers.length > 10) {
      return ensureAllMetrics(drivers);
    }
  }
  
  // Try flexible pattern extraction
  console.log("Trying flexible pattern extraction");
  const flexibleDrivers = extractDriversWithFlexiblePattern(text);
  
  if (flexibleDrivers.length > drivers.length) {
    console.log(`Flexible pattern extraction found ${flexibleDrivers.length} drivers, using these results`);
    drivers = flexibleDrivers;
  }
  
  // If we still don't have many drivers, try the original extractor as a fallback
  if (drivers.length < 5) {
    console.log("Few drivers found with new extractors, trying original extractor");
    const originalDrivers = extractDriverKPIsFromText(text);
    
    if (originalDrivers.length > drivers.length) {
      console.log(`Original extractor found ${originalDrivers.length} drivers, using these results`);
      drivers = originalDrivers;
    }
  }
  
  // Ensure all drivers have complete metrics
  console.log(`Final driver extraction result: ${drivers.length} drivers`);
  return ensureAllMetrics(drivers);
};

// Create utility functions for generating sample data
export const generateSampleDrivers = (): DriverKPI[] => {
  return [
    {
      name: "TR-001",
      status: "active",
      metrics: [
        { name: "Delivered", value: 98, target: 100, unit: "%", status: "great" as KPIStatus },
        { name: "DNR DPMO", value: 2500, target: 3000, unit: "DPMO", status: "great" as KPIStatus },
        { name: "Contact Compliance", value: 92, target: 95, unit: "%", status: "fair" as KPIStatus }
      ]
    },
    {
      name: "TR-002",
      status: "active",
      metrics: [
        { name: "Delivered", value: 99, target: 100, unit: "%", status: "fantastic" as KPIStatus },
        { name: "DNR DPMO", value: 2000, target: 3000, unit: "DPMO", status: "fantastic" as KPIStatus },
        { name: "Contact Compliance", value: 96, target: 95, unit: "%", status: "fantastic" as KPIStatus }
      ]
    }
  ];
};

// Function to determine metric status based on value and target
export const determineMetricStatus = (metricName: string, value: number): KPIStatus => {
  // Default thresholds for common metrics
  if (metricName === "Delivered" || metricName.includes("Delivered")) {
    if (value >= 99.5) return "fantastic";
    if (value >= 98.5) return "great";
    if (value >= 97) return "fair";  // Changed from "good" to "fair" to match KPIStatus type
    if (value >= 95) return "fair";
    return "poor";
  }
  
  if (metricName === "DNR DPMO" || metricName.includes("DNR") || metricName.includes("DPMO")) {
    // Lower is better for DPMO metrics
    if (value <= 1000) return "fantastic";
    if (value <= 2000) return "great";
    if (value <= 3000) return "fair";  // Changed from "good" to "fair"
    if (value <= 4000) return "fair";
    return "poor";
  }
  
  if (metricName === "Contact Compliance" || metricName.includes("Compliance") || metricName.includes("CC")) {
    if (value >= 98) return "fantastic";
    if (value >= 95) return "great";
    if (value >= 92) return "fair";  // Changed from "good" to "fair"
    if (value >= 90) return "fair";
    return "poor";
  }
  
  // Default generic thresholds for other metrics
  if (value >= 95) return "fantastic";
  if (value >= 90) return "great";
  if (value >= 80) return "fair";  // Changed from "good" to "fair"
  if (value >= 70) return "fair";
  return "poor";
};

// Ensure all drivers have complete metrics
export const ensureAllMetrics = (drivers: DriverKPI[]): DriverKPI[] => {
  return drivers.map(driver => {
    const metrics = [...driver.metrics];
    
    // Check if required metrics exist, add if missing
    const requiredMetrics = ["Delivered", "DNR DPMO", "Contact Compliance"];
    
    requiredMetrics.forEach(metricName => {
      if (!metrics.some(m => m.name === metricName)) {
        // Add default metric
        let defaultValue = 0;
        let defaultTarget = 0;
        let defaultUnit = "";
        
        if (metricName === "Delivered") {
          defaultValue = 97;
          defaultTarget = 100;
          defaultUnit = "%";
        } else if (metricName === "DNR DPMO") {
          defaultValue = 3000;
          defaultTarget = 3000;
          defaultUnit = "DPMO";
        } else if (metricName === "Contact Compliance") {
          defaultValue = 92;
          defaultTarget = 95;
          defaultUnit = "%";
        }
        
        metrics.push({
          name: metricName,
          value: defaultValue,
          target: defaultTarget,
          unit: defaultUnit,
          status: determineMetricStatus(metricName, defaultValue)
        });
      }
    });
    
    return {
      ...driver,
      metrics
    };
  });
};
