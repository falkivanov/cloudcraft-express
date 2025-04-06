import { KPIStatus } from '../../../helpers/statusHelper';

/**
 * Determine the status of a metric based on its value and any provided status text
 */
export function determineMetricStatus(metricName: string, value: number, statusText?: string): KPIStatus {
  // If status text is provided, use it directly
  if (statusText) {
    const lowerStatus = statusText.toLowerCase().trim();
    if (lowerStatus === "poor") return "poor";
    if (lowerStatus === "fair") return "fair";
    if (lowerStatus === "great") return "great";
    if (lowerStatus === "fantastic") return "fantastic";
    if (lowerStatus === "in compliance") return "in compliance";
    if (lowerStatus === "not in compliance") return "not in compliance";
  }
  
  // Otherwise determine based on metric type and value
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
