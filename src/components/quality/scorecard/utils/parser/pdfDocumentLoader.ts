
/**
 * Re-export PDF loading functionality from the new module structure
 * For backward compatibility
 */
export { 
  loadPDFDocument, 
  extractTextFromPDF, 
  extractPDFContentWithPositions 
} from './pdf';
