
import * as pdfjs from 'pdfjs-dist';
import { PDFParseError } from '../PDFParseError';

// Set worker source path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Load a PDF document from array buffer
 * @param pdfData ArrayBuffer containing the PDF data
 * @returns Promise with the loaded PDF document
 */
export const loadPDFDocument = async (pdfData: ArrayBuffer) => {
  console.info("Loading PDF document");
  
  try {
    // Check if data is a valid buffer
    if (!pdfData || pdfData.byteLength === 0) {
      throw new PDFParseError('Leere oder ungültige PDF-Daten', 'INVALID_DATA');
    }
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    
    // Handle document loading errors
    const pdf = await loadingTask.promise.catch(error => {
      console.error('PDF.js loading error:', error);
      if (error.name === 'PasswordException') {
        throw new PDFParseError('Das PDF ist passwortgeschützt. Bitte laden Sie eine ungeschützte Version hoch.', 'PASSWORD_PROTECTED');
      } else if (error.name === 'InvalidPDFException') {
        throw new PDFParseError('Die Datei ist keine gültige PDF-Datei.', 'INVALID_PDF');
      } else {
        throw new PDFParseError('Fehler beim Laden der PDF: ' + error.message, 'LOAD_ERROR');
      }
    });
    
    if (!pdf) {
      throw new PDFParseError('PDF konnte nicht geladen werden.', 'LOAD_ERROR');
    }
    
    console.info(`PDF loaded with ${pdf.numPages} pages`);
    return pdf;
  } catch (error) {
    console.error('Error loading PDF document:', error);
    throw error;
  }
};
