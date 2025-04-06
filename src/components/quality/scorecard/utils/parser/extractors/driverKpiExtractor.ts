
import { 
  extractDriverKPIs as extractDriverKPIsFromDriver,
} from './driver';
import { determineMetricStatus } from './driver/utils/metricStatus';
import { DriverKPI } from '../../../types';
import { KPIStatus } from '../../helpers/statusHelper';
import { generateSampleDrivers } from './driver/sampleData';
import { ensureAllMetrics } from './driver/utils/metricUtils';

/**
 * Extrahiere Fahrer-KPIs aus dem Textinhalt
 * @param text Textinhalt, aus dem Fahrer-KPIs extrahiert werden sollen
 * @returns Array von DriverKPIs
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  console.log("Extrahiere Fahrer-KPIs aus dem Textinhalt");
  
  // Extraktion mit optimiertem Ansatz versuchen
  const drivers = extractDriverKPIsFromText(text);
  
  // Sicherstellen, dass alle Fahrer vollständige Metriksätze haben
  const enhancedDrivers = ensureAllMetrics(drivers);
  
  console.log(`Gebe ${enhancedDrivers.length} Fahrer-KPIs zurück`);
  return enhancedDrivers;
};

/**
 * Legacy API-kompatibler Wrapper für die neue extractDriverKPIs-Funktion
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  // Verwendet die konsolidierte Extraktionsfunktion aus ./driver/index.ts
  return extractDriverKPIsFromDriver(text);
};

export {
  generateSampleDrivers,
  determineMetricStatus,
  ensureAllMetrics
};
