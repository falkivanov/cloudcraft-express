
import * as pdfjs from 'pdfjs-dist';
import { ScoreCardData } from '../types';
import { extractScorecardData } from './extractors/dataExtractor';

// Set worker source path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Custom error class for PDF parsing errors
 */
export class PDFParseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PDFParseError';
  }
}

/**
 * Parse a scorecard PDF and extract data
 * @param pdfData ArrayBuffer containing the PDF data
 * @param filename Original filename (used for KW extraction)
 * @returns Promise with the parsed ScoreCardData
 */
export const parseScorecardPDF = async (
  pdfData: ArrayBuffer,
  filename: string
): Promise<ScoreCardData | null> => {
  try {
    console.info("Starting PDF parsing for: ", filename);
    
    // Extract week number from filename if possible
    const weekMatch = filename.match(/KW[_\s]*(\d+)/i);
    const weekNum = weekMatch && weekMatch[1] ? parseInt(weekMatch[1], 10) : new Date().getWeek();
    
    console.info("Extracted week number:", weekNum);
    
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
    
    console.info(`PDF loaded with ${pdf.numPages} pages, focusing on pages 2 and 3 only`);
    
    // Check if PDF has enough pages
    if (pdf.numPages < 2) {
      throw new PDFParseError('Die PDF-Datei enthält nicht genügend Seiten. Mindestens 2 Seiten werden benötigt.', 'INSUFFICIENT_PAGES');
    }
    
    // Extract text only from pages 2 and 3
    const textContent: string[] = [];
    
    // Get page 2 (company KPIs)
    try {
      const companyKPIsPage = await pdf.getPage(2);
      const companyContent = await companyKPIsPage.getTextContent();
      const companyText = companyContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Check if page has enough content
      if (companyText.length < 50) {
        throw new PDFParseError('Seite 2 (Firmen-KPIs) enthält nicht genügend Text. Das Format könnte falsch sein.', 'INSUFFICIENT_CONTENT');
      }
      
      textContent.push(companyText);
      console.info("Extracted company KPIs from page 2");
    } catch (error) {
      console.error('Error extracting company KPIs:', error);
      throw new PDFParseError('Fehler beim Extrahieren der Firmen-KPIs von Seite 2.', 'PAGE_EXTRACTION_ERROR');
    }
    
    // Get page 3 (driver KPIs)
    try {
      if (pdf.numPages >= 3) {
        const driverKPIsPage = await pdf.getPage(3);
        const driverContent = await driverKPIsPage.getTextContent();
        const driverText = driverContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        // Check if page has enough content
        if (driverText.length < 50) {
          console.warn('Page 3 (Driver KPIs) has insufficient content. Will use sample data for drivers.');
        }
        
        textContent.push(driverText);
        console.info("Extracted driver KPIs from page 3");
      } else {
        console.warn("PDF doesn't have a page 3 for driver KPIs");
        textContent.push(''); // Add empty string as placeholder
      }
    } catch (error) {
      console.error('Error extracting driver KPIs:', error);
      // Don't throw here, we can still proceed with company KPIs
      textContent.push(''); // Add empty string as placeholder
    }
    
    const companyKPIsText = textContent[0] || '';
    const driverKPIsText = textContent[1] || '';
    
    console.info("PDF content extracted from specific pages, starting to parse data");
    
    // Parse key metrics from the text
    try {
      const parsedData = extractScorecardData(companyKPIsText, driverKPIsText, weekNum);
      
      // Validate that we extracted meaningful data
      if (!parsedData.companyKPIs || parsedData.companyKPIs.length === 0) {
        throw new PDFParseError('Keine Firmen-KPIs konnten aus dem PDF extrahiert werden. Das Format könnte nicht unterstützt werden.', 'NO_KPIS_FOUND');
      }
      
      // Store the extracted data in localStorage for beta testing
      localStorage.setItem("extractedScorecardData", JSON.stringify(parsedData));
      console.info("Successfully parsed and stored PDF data for week", weekNum);
      
      return parsedData;
    } catch (error) {
      console.error('Error parsing scorecard data:', error);
      if (error instanceof PDFParseError) {
        throw error; // Re-throw our custom errors
      } else {
        throw new PDFParseError('Fehler beim Analysieren der Scorecard-Daten: ' + (error as Error).message, 'DATA_EXTRACTION_ERROR');
      }
    }
    
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // If it's already our custom error, just re-throw it
    if (error instanceof PDFParseError) {
      throw error;
    }
    // Otherwise wrap it in our custom error
    throw new PDFParseError('Fehler beim Verarbeiten der PDF: ' + (error as Error).message, 'GENERAL_ERROR');
  }
};

// Add method to get week number from Date
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function(): number {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
