
/**
 * API-Service-Haupteinstiegspunkt
 * 
 * Exportiert alle API-bezogenen Dienste und Funktionen.
 */

// Re-export der Konfiguration
export * from './config';

// Re-export der Typen
export * from './types';

// Re-export des Basis-Clients
export * from './client';

// Re-export der Domain-spezifischen Services
export * from './endpoints/pdfService';
export * from './endpoints/scorecardService';

// Liste der verfügbaren API-Funktionen für die vereinfachte Verwendung
export const api = {
  // System
  checkHealth: () => import('./client').then(m => m.checkApiHealth()),
  
  // PDF-Verarbeitung
  pdf: {
    upload: (file: File, options?: { extractText?: boolean, extractStructure?: boolean }) => 
      import('./endpoints/pdfService').then(m => m.uploadPDF(file, options)),
      
    extractText: (file: File) => 
      import('./endpoints/pdfService').then(m => m.extractTextFromPDF(file)),
      
    extractStructure: (file: File) => 
      import('./endpoints/pdfService').then(m => m.extractStructureFromPDF(file))
  },
  
  // Scorecard-spezifische Funktionen
  scorecard: {
    extract: (file: File) => 
      import('./endpoints/scorecardService').then(m => m.extractScorecardFromPDF(file)),
      
    extractDrivers: (text: string, pageData?: Record<number, any>) => 
      import('./endpoints/scorecardService').then(m => m.extractDriverKPIs(text, pageData)),
      
    extractCompany: (text: string, pageData?: Record<number, any>) => 
      import('./endpoints/scorecardService').then(m => m.extractCompanyKPIs(text, pageData)),
      
    extractMetadata: (text: string, filename: string) => 
      import('./endpoints/scorecardService').then(m => m.extractMetadata(text, filename))
  },
  
  // Verarbeitungsstatus
  processing: {
    checkStatus: (processingId: string) => 
      import('./endpoints/pdfService').then(m => m.checkProcessingStatus(processingId)),
      
    cancel: (processingId: string) => 
      import('./endpoints/pdfService').then(m => m.cancelProcessing(processingId))
  }
};
