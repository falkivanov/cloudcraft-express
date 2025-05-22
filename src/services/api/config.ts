
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
  
  // Mitarbeiter-Endpunkte
  employees: {
    getAll: `/api/${API_VERSION}/employees`,
    getById: (id: string) => `/api/${API_VERSION}/employees/${id}`,
    create: `/api/${API_VERSION}/employees`,
    createBatch: `/api/${API_VERSION}/employees/batch`,
    update: (id: string) => `/api/${API_VERSION}/employees/${id}`,
    delete: (id: string) => `/api/${API_VERSION}/employees/${id}`,
    deleteAll: `/api/${API_VERSION}/employees`,
  },
  
  // Schichtplanung-Endpunkte
  shifts: {
    getAll: `/api/${API_VERSION}/shifts`,
    getByDate: (date: string) => `/api/${API_VERSION}/shifts/date/${date}`,
    getByEmployee: (employeeId: string) => `/api/${API_VERSION}/shifts/employee/${employeeId}`,
    create: `/api/${API_VERSION}/shifts`,
    createBatch: `/api/${API_VERSION}/shifts/batch`,
    update: (id: string) => `/api/${API_VERSION}/shifts/${id}`,
    delete: (id: string) => `/api/${API_VERSION}/shifts/${id}`,
    deleteByDate: (date: string) => `/api/${API_VERSION}/shifts/date/${date}`,
    generatePlan: `/api/${API_VERSION}/shifts/generate-plan`,
  },
  
  // Fahrzeugverwaltung
  vehicles: {
    getAll: `/api/${API_VERSION}/vehicles`,
    getById: (id: string) => `/api/${API_VERSION}/vehicles/${id}`,
    create: `/api/${API_VERSION}/vehicles`,
    createBatch: `/api/${API_VERSION}/vehicles/batch`,
    update: (id: string) => `/api/${API_VERSION}/vehicles/${id}`,
    delete: (id: string) => `/api/${API_VERSION}/vehicles/${id}`,
    // Reparaturen
    repairs: {
      getAll: `/api/${API_VERSION}/vehicles/repairs/all`,
      add: (vehicleId: string) => `/api/${API_VERSION}/vehicles/${vehicleId}/repairs`,
      update: (repairId: string) => `/api/${API_VERSION}/vehicles/repairs/${repairId}`,
      delete: (repairId: string) => `/api/${API_VERSION}/vehicles/repairs/${repairId}`,
    },
    // Termine
    appointments: {
      getAll: `/api/${API_VERSION}/vehicles/appointments/all`,
      add: (vehicleId: string) => `/api/${API_VERSION}/vehicles/${vehicleId}/appointments`,
      update: (appointmentId: string) => `/api/${API_VERSION}/vehicles/appointments/${appointmentId}`,
      delete: (appointmentId: string) => `/api/${API_VERSION}/vehicles/appointments/${appointmentId}`,
    },
    // Fahrzeugzuweisungen
    assignments: {
      getAll: `/api/${API_VERSION}/vehicles/assignments`,
      create: `/api/${API_VERSION}/vehicles/assignments`,
      delete: (assignmentId: string) => `/api/${API_VERSION}/vehicles/assignments/${assignmentId}`,
    }
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
