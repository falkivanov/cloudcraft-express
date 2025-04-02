
import { determineStatus } from '../../../../helpers/statusHelper';

/**
 * Erstellt einen vollständigen Satz aller 7 Standardmetriken für einen Fahrer
 */
export function createAllStandardMetrics(existingMetrics: any[] = []): any[] {
  // Namen der vorhandenen Metriken
  const existingMetricNames = existingMetrics.map(m => m.name);
  
  // Standardmetriken, die vorhanden sein sollten
  const standardMetrics = [
    {name: "Delivered", target: 0, unit: "", defaultValue: 1000},
    {name: "DCR", target: 98.5, unit: "%", defaultValue: 98.5},
    {name: "DNR DPMO", target: 1500, unit: "DPMO", defaultValue: 800},
    {name: "POD", target: 98, unit: "%", defaultValue: 98},
    {name: "CC", target: 95, unit: "%", defaultValue: 95},
    {name: "CE", target: 0, unit: "", defaultValue: 0},
    {name: "DEX", target: 95, unit: "%", defaultValue: 95}
  ];
  
  // Kopie der Metriken erstellen, um das Original nicht zu verändern
  const enhancedMetrics = [...existingMetrics];
  
  // Fehlende Metriken hinzufügen
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
 * Stelle sicher, dass alle Fahrer alle 7 Standardmetriken haben
 */
export function ensureAllMetrics(drivers: any[]): any[] {
  return drivers.map(driver => {
    return {
      ...driver,
      metrics: createAllStandardMetrics(driver.metrics)
    };
  });
}
