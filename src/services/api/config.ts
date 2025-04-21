
/**
 * API-Konfiguration
 * 
 * Diese Datei definiert die Konfiguration für die API-Integration.
 * Umgebungsvariablen werden hier zentralisiert und mit Standardwerten versehen.
 */

// Basis-URL für API-Anfragen
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Timeout für API-Anfragen in Millisekunden
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

// API Version
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// API-Endpunkte gruppiert nach Domäne
export const API_ENDPOINTS = {
  // PDF-Verarbeitung
  pdf: {
    uploadFile: `/api/${API_VERSION}/pdf/upload`,
    extractText: `/api/${API_VERSION}/pdf/extract-text`,
    extractStructure: `/api/${API_VERSION}/pdf/extract-structure`,
  },
  
  // Scorecard-spezifische Endpunkte
  scorecard: {
    extract: `/api/${API_VERSION}/scorecard/extract`,
    extractDrivers: `/api/${API_VERSION}/scorecard/extract-drivers`,
    extractCompanyKPIs: `/api/${API_VERSION}/scorecard/extract-company`,
    extractMetadata: `/api/${API_VERSION}/scorecard/extract-metadata`,
  },
  
  // Dateiverwaltung
  files: {
    upload: `/api/${API_VERSION}/files/upload`,
    delete: `/api/${API_VERSION}/files/delete`,
    download: `/api/${API_VERSION}/files/download`,
  },
  
  // Asynchrone Verarbeitungsstatus
  processing: {
    status: `/api/${API_VERSION}/processing/status`,
    cancel: `/api/${API_VERSION}/processing/cancel`,
  },

  // Systemstatus
  system: {
    health: `/api/${API_VERSION}/health`,
    version: `/api/${API_VERSION}/version`,
  }
};
