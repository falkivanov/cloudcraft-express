
import { 
  generateSampleDrivers,
  ensureAllMetrics
} from '../parser/extractors/driver';
import { determineMetricStatus } from '../parser/extractors/driver/utils/metricStatus';
import { DriverKPI } from '../../types';
import { KPIStatus } from '../helpers/statusHelper';
import { api } from '@/services/api';

// API-Konfiguration - würde später durch echte Umgebungsvariablen ersetzt werden
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  endpoints: {
    extractDrivers: '/api/v1/scorecard/extract-drivers'
  }
};

/**
 * Extrahiere Fahrer-KPIs aus dem Textinhalt
 * Optimiert für die zukünftige API-Integration
 * 
 * @param text Textinhalt, aus dem Fahrer-KPIs extrahiert werden sollen
 * @param pageData Optional strukturierte Seitendaten für erweiterte Extraktion
 * @returns Array von DriverKPIs
 */
export const extractDriverKPIs = async (text: string, pageData?: any): Promise<DriverKPI[]> => {
  console.log("Extrahiere Fahrer-KPIs aus dem Textinhalt");
  
  try {
    // Check if API is available
    const isApiAvailable = await api.checkHealth().catch(() => false);
    
    if (isApiAvailable) {
      try {
        console.log("API is available, attempting API extraction");
        // Use API extraction (future implementation)
        return await extractDriverKPIsViaAPI(text, pageData);
      } catch (apiError) {
        console.log("API extraction failed, fallback to local extraction", apiError);
      }
    }
    
    // Use local extraction
    const drivers = extractDriverKPIsFromText(text, pageData);
    
    // Sicherstellen, dass alle Fahrer vollständige Metriksätze haben
    const enhancedDrivers = ensureAllMetrics(drivers);
    
    console.log(`Returning ${enhancedDrivers.length} driver KPIs`);
    return enhancedDrivers;
  } catch (error) {
    console.error("Error extracting driver KPIs:", error);
    return [];
  }
};

/**
 * Vorbereitung für zukünftigen API-Aufruf zur Extraktion von Fahrer-KPIs
 * Aktuell: Verwendet weiterhin die lokale Implementierung
 * Zukünftig: Würde einen API-Endpunkt aufrufen
 */
export const extractDriverKPIsViaAPI = async (text: string, pageData?: any): Promise<DriverKPI[]> => {
  // Hinweis: Dies ist eine Vorbereitungsfunktion für die zukünftige API-Integration
  console.log("Prepared for API call to extract driver KPIs");
  
  try {
    // Future implementation would call the API endpoint
    // For now, throw error to trigger fallback
    throw new Error("API not yet implemented");
  } catch (error) {
    console.error("API call error:", error);
    // Fallback to local processing
    console.log("Falling back to local processing");
    return extractDriverKPIsFromText(text, pageData);
  }
};

/**
 * Legacy API-kompatibler Wrapper für die neue extractDriverKPIs-Funktion
 * Bereitet vor für die Umstellung auf API-Aufrufe
 */
export const extractDriverKPIsFromText = (text: string, pageData?: any): DriverKPI[] => {
  try {
    // Import here to avoid circular dependency
    const { extractDriverKPIs: extractFromDriver } = require('../parser/extractors/driver');
    
    // Uses the consolidated extraction function from ./driver/index.ts
    return extractFromDriver(text, pageData);
  } catch (error) {
    console.error("Error in local text extraction:", error);
    return generateSampleDrivers();
  }
};

export {
  generateSampleDrivers,
  determineMetricStatus,
  ensureAllMetrics
};
