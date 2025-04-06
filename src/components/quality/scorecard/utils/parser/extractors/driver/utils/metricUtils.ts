import { determineMetricStatus } from './metricStatus';
import { KPIStatus } from "../../../helpers/statusHelper";
import { DriverKPI } from "../../../types/index";

/**
 * Helper function to get the target value for a metric
 */
export function getTargetForMetric(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 0;
    case "DCR": return 98.5;
    case "DNR DPMO": return 1500;
    case "POD": return 98;
    case "CC": return 95;
    case "CE": return 0;
    case "DEX": return 95;
    default: return 0;
  }
}

/**
 * Helper function to get the unit for a metric
 */
export function getUnitForMetric(metricName: string): string {
  switch (metricName) {
    case "DCR": return "%";
    case "DNR DPMO": return "DPMO";
    case "POD": return "%";
    case "CC": return "%";
    case "CE": return "";
    case "DEX": return "%";
    default: return "";
  }
}

/**
 * Creates a metric object with all required properties
 */
export function createMetric(name: string, value: number, status?: KPIStatus) {
  const calculatedStatus = status || determineMetricStatus(name, value);
  
  return {
    name,
    value,
    target: getTargetForMetric(name),
    unit: getUnitForMetric(name),
    status: calculatedStatus
  };
}

/**
 * Ensures all drivers have the complete set of standard metrics
 */
export function ensureAllMetrics(drivers: DriverKPI[]): DriverKPI[] {
  if (!drivers || drivers.length === 0) return [];
  
  return drivers.map(driver => {
    // Create a map of existing metrics by name
    const metricMap = new Map();
    driver.metrics.forEach(metric => {
      metricMap.set(metric.name, metric);
    });
    
    // Create the full array of metrics, using existing ones when available
    const fullMetrics = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"].map(name => {
      if (metricMap.has(name)) {
        return metricMap.get(name);
      } else {
        // Create default metric when missing
        return createMetric(name, 0);
      }
    });
    
    return {
      ...driver,
      metrics: fullMetrics
    };
  });
}

/**
 * Creates a complete set of standard metrics
 */
export function createAllStandardMetrics(): any[] {
  return ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"].map((name, index) => {
    const value = index === 0 ? 900 : index === 2 ? 1500 : 95;
    return createMetric(name, value);
  });
}
