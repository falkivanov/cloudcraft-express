
import * as pdfjs from 'pdfjs-dist';
import { ScoreCardData } from '../types';
import { extractScorecardData } from './extractors/dataExtractor';

// Set worker source path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
    // Extract week number from filename if possible
    const weekMatch = filename.match(/KW[_\s]*(\d+)/i);
    const weekNum = weekMatch && weekMatch[1] ? parseInt(weekMatch[1], 10) : new Date().getWeek();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded with ${pdf.numPages} pages, focusing on pages 2 and 3 only`);
    
    // Extract text only from pages 2 and 3
    const textContent: string[] = [];
    
    // Get page 2 (company KPIs)
    if (pdf.numPages >= 2) {
      const companyKPIsPage = await pdf.getPage(2);
      const companyContent = await companyKPIsPage.getTextContent();
      const companyText = companyContent.items
        .map((item: any) => item.str)
        .join(' ');
      textContent.push(companyText);
      console.log("Extracted company KPIs from page 2");
    } else {
      console.warn("PDF doesn't have a page 2 for company KPIs");
    }
    
    // Get page 3 (driver KPIs)
    if (pdf.numPages >= 3) {
      const driverKPIsPage = await pdf.getPage(3);
      const driverContent = await driverKPIsPage.getTextContent();
      const driverText = driverContent.items
        .map((item: any) => item.str)
        .join(' ');
      textContent.push(driverText);
      console.log("Extracted driver KPIs from page 3");
    } else {
      console.warn("PDF doesn't have a page 3 for driver KPIs");
    }
    
    const companyKPIsText = textContent[0] || '';
    const driverKPIsText = textContent[1] || '';
    
    console.log("PDF content extracted from specific pages, starting to parse data");
    
    // Parse key metrics from the text
    const parsedData = extractScorecardData(companyKPIsText, driverKPIsText, weekNum);
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return null;
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
