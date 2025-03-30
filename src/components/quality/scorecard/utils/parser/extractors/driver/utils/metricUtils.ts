
import { determineStatus } from '../../../helpers/statusHelper';
import { METRIC_NAMES, METRIC_TARGETS, METRIC_UNITS } from './metricDefinitions';

type MetricStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Creates a standard set of all 7 metrics for a driver
 */
export function createAllStandardMetrics(index: number) {
  // Create random values with slight variation based on index
  const baseValues = {
    "Delivered": 900 + (index % 10) * 50,
    "DCR": 98 + (index % 3),
    "DNR DPMO": 1500 - (index * 50) % 1000,
    "POD": 97 + (index % 3),
    "CC": 95 + (index % 5),
    "CE": index % 5 === 0 ? 1 : 0, // Occasional CE value of 1
    "DEX": 94 + (index % 6)
  };
  
  return [
    {
      name: "Delivered",
      value: baseValues["Delivered"],
      target: METRIC_TARGETS[0],
      unit: METRIC_UNITS[0],
      status: determineStatus("Delivered", baseValues["Delivered"]) as MetricStatus
    },
    {
      name: "DCR",
      value: baseValues["DCR"],
      target: METRIC_TARGETS[1],
      unit: METRIC_UNITS[1],
      status: determineStatus("DCR", baseValues["DCR"]) as MetricStatus
    },
    {
      name: "DNR DPMO",
      value: baseValues["DNR DPMO"],
      target: METRIC_TARGETS[2],
      unit: METRIC_UNITS[2],
      status: determineStatus("DNR DPMO", baseValues["DNR DPMO"]) as MetricStatus
    },
    {
      name: "POD",
      value: baseValues["POD"],
      target: METRIC_TARGETS[3],
      unit: METRIC_UNITS[3],
      status: determineStatus("POD", baseValues["POD"]) as MetricStatus
    },
    {
      name: "CC",
      value: baseValues["CC"],
      target: METRIC_TARGETS[4],
      unit: METRIC_UNITS[4],
      status: determineStatus("CC", baseValues["CC"]) as MetricStatus
    },
    {
      name: "CE",
      value: baseValues["CE"],
      target: METRIC_TARGETS[5],
      unit: METRIC_UNITS[5],
      status: baseValues["CE"] === 0 ? "fantastic" as MetricStatus : "poor" as MetricStatus
    },
    {
      name: "DEX",
      value: baseValues["DEX"],
      target: METRIC_TARGETS[6],
      unit: METRIC_UNITS[6],
      status: determineStatus("DEX", baseValues["DEX"]) as MetricStatus
    }
  ];
}

/**
 * Ensures all drivers have the complete set of 7 standard metrics
 */
export function ensureAllMetrics(drivers: any[]): any[] {
  return drivers.map((driver, driverIndex) => {
    const metrics = [...driver.metrics];
    const metricNames = metrics.map(m => m.name);
    
    // Add any missing metrics
    METRIC_NAMES.forEach((metricName, index) => {
      if (!metricNames.includes(metricName)) {
        // Create values based on driver index for some variability
        let metricValue = 0;
        let target = METRIC_TARGETS[index];
        let unit = METRIC_UNITS[index];
        let status: MetricStatus = "fair";
        
        switch (metricName) {
          case "Delivered":
            metricValue = 900 + (driverIndex % 10) * 50;
            status = determineStatus("Delivered", metricValue) as MetricStatus;
            break;
          case "DCR":
            metricValue = 98 + (driverIndex % 3);
            status = determineStatus("DCR", metricValue) as MetricStatus;
            break;
          case "DNR DPMO":
            metricValue = 1500 - (driverIndex * 50) % 1000;
            status = determineStatus("DNR DPMO", metricValue) as MetricStatus;
            break;
          case "POD":
            metricValue = 97 + (driverIndex % 3);
            status = determineStatus("POD", metricValue) as MetricStatus;
            break;
          case "CC":
            metricValue = 95 + (driverIndex % 5);
            status = determineStatus("CC", metricValue) as MetricStatus;
            break;
          case "CE":
            metricValue = driverIndex % 5 === 0 ? 1 : 0;
            status = metricValue === 0 ? "fantastic" as MetricStatus : "poor" as MetricStatus;
            break;
          case "DEX":
            metricValue = 94 + (driverIndex % 6);
            status = determineStatus("DEX", metricValue) as MetricStatus;
            break;
        }
        
        metrics.push({
          name: metricName,
          value: metricValue,
          target,
          unit,
          status
        });
      }
    });
    
    return {
      ...driver,
      metrics
    };
  });
}
