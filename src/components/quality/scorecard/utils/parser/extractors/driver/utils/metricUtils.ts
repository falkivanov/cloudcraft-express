
import { determineStatus } from '../../../../helpers/statusHelper';

/**
 * Create a complete set of all 7 standard metrics for a driver
 * @param existingMetrics Any existing metrics to include
 * @returns Complete set of all standard metrics
 */
export function createAllStandardMetrics(existingMetrics: any[] = []): any[] {
  // Get existing metric names
  const existingMetricNames = existingMetrics.map(m => m.name);
  
  // Standard metrics that should be present
  const standardMetrics = [
    {name: "Delivered", target: 0, unit: "", defaultValue: 1000},
    {name: "DCR", target: 98.5, unit: "%", defaultValue: 98.5},
    {name: "DNR DPMO", target: 1500, unit: "DPMO", defaultValue: 800},
    {name: "POD", target: 98, unit: "%", defaultValue: 98},
    {name: "CC", target: 95, unit: "%", defaultValue: 95},
    {name: "CE", target: 0, unit: "", defaultValue: 0},
    {name: "DEX", target: 95, unit: "%", defaultValue: 92}
  ];
  
  // Create a copy of metrics to avoid mutating the original
  const enhancedMetrics = [...existingMetrics];
  
  // Add any missing metrics
  standardMetrics.forEach(metric => {
    if (!existingMetricNames.includes(metric.name)) {
      enhancedMetrics.push({
        name: metric.name,
        value: metric.defaultValue,
        target: metric.target,
        unit: metric.unit,
        status: determineStatus(metric.name, metric.defaultValue)
      });
    }
  });
  
  return enhancedMetrics;
}

/**
 * Ensure all drivers have all 7 standard metrics
 * @param drivers Array of drivers to ensure metrics for
 * @returns Drivers with all standard metrics
 */
export function ensureAllMetrics(drivers: any[]): any[] {
  return drivers.map(driver => {
    return {
      ...driver,
      metrics: createAllStandardMetrics(driver.metrics)
    };
  });
}
