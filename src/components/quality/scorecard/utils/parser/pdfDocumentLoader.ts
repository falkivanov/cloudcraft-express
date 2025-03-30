
import * as pdfjs from 'pdfjs-dist';
import { PDFParseError } from './PDFParseError';

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

/**
 * Extract text content from PDF pages with enhanced extraction
 * @param pdf The loaded PDF document
 * @returns Object with text content from pages
 */
export const extractTextFromPDF = async (pdf: any) => {
  try {
    const allText: string[] = [];
    const pageTexts: Record<number, string> = {};
    
    // Extract text from all pages for better context
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(' ');
      pageTexts[i] = text;
      allText.push(text);
    }
    
    // Get first page for company info
    const companyText = pageTexts[1] || '';
    
    // Get second page for driver info
    const driverText = pageTexts[2] || '';
    
    // Combine text from all pages for context-aware extraction
    const fullText = allText.join(' ');
    
    console.info("Successfully extracted text from PDF");
    return { companyText, driverText, fullText, pageTexts };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

/**
 * Extract text content and render items from PDF for advanced analysis
 * @param pdf The loaded PDF document
 * @returns Promise with extracted text and positional data
 */
export const extractPDFContentWithPositions = async (pdf: any) => {
  try {
    const result: Record<number, any> = {};
    
    // Process all pages (or up to 5 to avoid performance issues with large documents)
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();
      
      // Get items with their positions for structural analysis
      const items = textContent.items.map((item: any) => {
        // Transform coordinates from PDF space to viewport space
        const tx = pdfjs.Util.transform(
          viewport.transform,
          item.transform
        );
        
        return {
          str: item.str,
          x: tx[4], // x-coordinate
          y: tx[5], // y-coordinate
          width: item.width,
          height: item.height,
          fontName: item.fontName
        };
      });
      
      // Sort items by vertical position first, then by horizontal position
      const sortedItems = items.sort((a: any, b: any) => {
        // Group items into rows based on y-coordinate proximity
        const yDiff = Math.abs(a.y - b.y);
        if (yDiff < 5) { // Items within 5 pixels vertically are considered in the same row
          return a.x - b.x; // Sort by x-coordinate within the same row
        }
        return b.y - a.y; // Sort by y-coordinate (top to bottom)
      });
      
      // Store page data
      result[i] = {
        items: sortedItems,
        text: sortedItems.map((item: any) => item.str).join(' '),
        width: viewport.width,
        height: viewport.height
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting PDF content with positions:', error);
    throw error;
  }
};
