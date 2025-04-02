
import { 
  extractDriverKPIsFromText,
  generateSampleDrivers,
  ensureAllMetrics
} from './driver';
import { determineMetricStatus } from './driver/utils/metricStatus';
import { DriverKPI } from '../../../types';

/**
 * Extrahiere Fahrer-KPIs aus dem Textinhalt
 * @param text Textinhalt, aus dem Fahrer-KPIs extrahiert werden sollen
 * @returns Array von DriverKPIs
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  console.log("Extrahiere Fahrer-KPIs aus dem Textinhalt");
  
  // Extraktion mit unserem vereinfachten Ansatz versuchen
  const drivers = extractDriverKPIsFromText(text);
  
  // Sicherstellen, dass alle Fahrer vollständige Metriksätze haben
  const enhancedDrivers = ensureAllMetrics(drivers);
  
  console.log(`Gebe ${enhancedDrivers.length} Fahrer-KPIs zurück`);
  return enhancedDrivers;
};

export {
  extractDriverKPIsFromText,
  generateSampleDrivers,
  determineMetricStatus,
  ensureAllMetrics
};
