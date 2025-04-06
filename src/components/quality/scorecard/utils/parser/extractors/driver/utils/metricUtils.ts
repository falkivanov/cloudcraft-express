
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "./metricStatus";
import { METRIC_NAMES, METRIC_TARGETS, METRIC_UNITS } from "./metricDefinitions";

/**
 * Makes sure all metrics are present on a driver, adding any missing ones with defaults
 */
export function createAllStandardMetrics(existingMetrics: any[] = []): any[] {
  const metrics = [...existingMetrics];
  const existingNames = metrics.map(m => m.name);
  
  // Add any missing metrics with default values
  for (let i = 0; i < METRIC_NAMES.length; i++) {
    const metricName = METRIC_NAMES[i];
    if (!existingNames.includes(metricName)) {
      metrics.push({
        name: metricName,
        value: metricName === "DNR DPMO" ? 1500 : metricName === "CE" ? 0 : 95,
        target: METRIC_TARGETS[i],
        unit: METRIC_UNITS[i],
        status: determineMetricStatus(metricName, metricName === "DNR DPMO" ? 1500 : metricName === "CE" ? 0 : 95)
      });
    }
  }
  
  return metrics;
}

/**
 * Ensures all drivers have complete metrics
 */
export function ensureAllMetrics(drivers: DriverKPI[]): DriverKPI[] {
  return drivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics(driver.metrics)
  }));
}
