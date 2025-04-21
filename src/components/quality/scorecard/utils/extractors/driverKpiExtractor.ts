
import { 
  generateSampleDrivers,
  ensureAllMetrics
} from '../parser/extractors/driver';
import { determineMetricStatus } from '../parser/extractors/driver/utils/metricStatus';
import { DriverKPI } from '../../types';
import { KPIStatus } from '../helpers/statusHelper';

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
    // In Zukunft: Hier würde der API-Aufruf stattfinden
    // Aktuell: Weiterhin lokale Extraktion verwenden
    const drivers = extractDriverKPIsFromText(text, pageData);
    
    // Sicherstellen, dass alle Fahrer vollständige Metriksätze haben
    const enhancedDrivers = ensureAllMetrics(drivers);
    
    console.log(`Gebe ${enhancedDrivers.length} Fahrer-KPIs zurück`);
    return enhancedDrivers;
  } catch (error) {
    console.error("Fehler bei der Extraktion der Fahrer-KPIs:", error);
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
  console.log("Vorbereitet für API-Aufruf zur Extraktion von Fahrer-KPIs");
  
  try {
    // In Zukunft würde hier ein Fetch-Aufruf an die API erfolgen
    // const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.extractDrivers}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text, pageData })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message || 'API-Fehler');
    // return data.drivers;
    
    // Aktuell: Verwende weiterhin die lokale Implementierung
    return extractDriverKPIsFromText(text, pageData);
  } catch (error) {
    console.error("API-Aufruffehler:", error);
    // Fallback zur lokalen Verarbeitung
    console.log("Fallback zur lokalen Verarbeitung");
    return extractDriverKPIsFromText(text, pageData);
  }
};

/**
 * Legacy API-kompatibler Wrapper für die neue extractDriverKPIs-Funktion
 * Bereitet vor für die Umstellung auf API-Aufrufe
 */
export const extractDriverKPIsFromText = (text: string, pageData?: any): DriverKPI[] => {
  try {
    // Import hier, um zirkuläre Abhängigkeit zu vermeiden
    const { extractDriverKPIs: extractFromDriver } = require('../parser/extractors/driver');
    
    // Verwendet die konsolidierte Extraktionsfunktion aus ./driver/index.ts
    return extractFromDriver(text, pageData);
  } catch (error) {
    console.error("Fehler bei der lokalen Textextraktion:", error);
    return generateSampleDrivers();
  }
};

export {
  generateSampleDrivers,
  determineMetricStatus,
  ensureAllMetrics
};
