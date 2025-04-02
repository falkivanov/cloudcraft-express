
import { 
  extractDriverKPIs,
  generateSampleDrivers,
  ensureAllMetrics
} from './driver';
import { determineMetricStatus } from './driver/utils/metricStatus';
import { DriverKPI } from '../../../types';
import { KPIStatus } from '../../helpers/statusHelper';

/**
 * Extrahiere Fahrer-KPIs aus dem Textinhalt
 * @param text Textinhalt, aus dem Fahrer-KPIs extrahiert werden sollen
 * @param pageData Optional strukturierte Seitendaten für erweiterte Extraktion
 * @returns Array von DriverKPIs
 */
export const extractDriverKPIs = (text: string, pageData?: any): DriverKPI[] => {
  console.log("Extrahiere Fahrer-KPIs aus dem Textinhalt");
  
  // Extraktion mit optimiertem Ansatz versuchen
  const drivers = extractDriverKPIsFromText(text, pageData);
  
  // Sicherstellen, dass alle Fahrer vollständige Metriksätze haben
  const enhancedDrivers = ensureAllMetrics(drivers);
  
  console.log(`Gebe ${enhancedDrivers.length} Fahrer-KPIs zurück`);
  return enhancedDrivers;
};

/**
 * Legacy API-kompatibler Wrapper für die neue extractDriverKPIs-Funktion
 */
export const extractDriverKPIsFromText = (text: string, pageData?: any): DriverKPI[] => {
  // Verwendet die konsolidierte Extraktionsfunktion aus ./driver/index.ts
  return extractDriverKPIs(text, pageData);
};

export {
  generateSampleDrivers,
  determineMetricStatus,
  ensureAllMetrics
};
