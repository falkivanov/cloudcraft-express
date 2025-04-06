
import * as pdfjs from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';

// PDF.js workerSrc
const pdfWorkerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

/**
 * Lade ein PDF-Dokument aus einem ArrayBuffer
 * @param pdfData ArrayBuffer mit den PDF-Daten
 * @returns Promise mit dem geladenen PDF-Dokument
 */
export const loadPDFDocument = async (pdfData: ArrayBuffer): Promise<any> => {
  try {
    console.info("Lade PDF-Dokument");
    
    // Setze den PDF.js worker
    const pdfjsWorker = pdfWorkerSrc;
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    
    // Lade das PDF-Dokument
    const loadingTask = getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    console.info(`PDF geladen, enthält ${pdf.numPages} Seiten`);
    return pdf;
  } catch (error) {
    console.error('Fehler beim Laden des PDF-Dokuments:', error);
    throw new Error('Fehler beim Laden des PDF-Dokuments');
  }
};
