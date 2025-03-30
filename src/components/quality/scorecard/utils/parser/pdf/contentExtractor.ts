
import * as pdfjs from 'pdfjs-dist';
import { transformCoordinates } from './coordinateTransformer';

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
      const content = await page.getTextContent({normalizeWhitespace: true});
      
      // Improved text extraction with line breaks preservation
      let lastY = -1;
      let textItems = [];
      
      for (const item of content.items) {
        if ('str' in item) {
          const textItem = item as any; // Use any to avoid typescript error
          // Add line breaks when Y position changes significantly
          if (lastY !== -1 && Math.abs(textItem.transform[5] - lastY) > 5) {
            textItems.push('\n');
          }
          textItems.push(textItem.str);
          lastY = textItem.transform[5];
        }
      }
      
      const text = textItems.join(' ').replace(/\s{2,}/g, ' ');
      pageTexts[i] = text;
      allText.push(text);
    }
    
    // Get first page for company info
    const companyText = pageTexts[1] || '';
    
    // Get second page for driver info
    const driverText = pageTexts[2] || '';
    
    // Combine text from all pages for context-aware extraction
    const fullText = allText.join('\n\n');
    
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
      const textContent = await page.getTextContent({normalizeWhitespace: true});
      
      // Get items with positions and process them
      const items = extractAndProcessItems(textContent, viewport);
      
      // Group items into logical rows for better structure reconstruction
      const rows = groupItemsIntoRows(items);
      
      // Store page data with both items and rows
      result[i] = {
        items: items,
        rows: rows,
        text: items.map((item: any) => item.str).join(' '),
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

/**
 * Extract and process PDF text items with their positions
 */
function extractAndProcessItems(textContent: any, viewport: any) {
  // Extract items with their positions for structural analysis
  const items = textContent.items
    .filter((item: any) => 'str' in item && item.str.trim() !== '')
    .map((item: any) => {
      // Transform coordinates from PDF space to viewport space
      const transformedCoords = transformCoordinates(viewport, item.transform);
      
      return {
        str: item.str.trim(),
        x: transformedCoords[0], // x-coordinate
        y: transformedCoords[1], // y-coordinate
        width: item.width,
        height: item.height,
        fontName: item.fontName
      };
    });
  
  // Enhanced sorting for more accurate structure reconstruction
  // Sort items by vertical position first, then by horizontal position
  return items.sort((a: any, b: any) => {
    // Group items into rows based on y-coordinate proximity
    const yDiff = Math.abs(a.y - b.y);
    if (yDiff < 5) { // Items within 5 pixels vertically are considered in the same row
      return a.x - b.x; // Sort by x-coordinate within the same row
    }
    return b.y - a.y; // Sort by y-coordinate (top to bottom)
  });
}

/**
 * Group PDF text items into logical rows
 */
function groupItemsIntoRows(sortedItems: any[]) {
  const rows: any[][] = [];
  let currentRow: any[] = [];
  let lastY = -1;
  
  // Group items into rows
  for (const item of sortedItems) {
    if (lastY === -1 || Math.abs(item.y - lastY) < 5) {
      // Same row
      currentRow.push(item);
    } else {
      // New row
      if (currentRow.length > 0) {
        rows.push([...currentRow].sort((a, b) => a.x - b.x));
        currentRow = [item];
      } else {
        currentRow = [item];
      }
    }
    lastY = item.y;
  }
  
  // Add the last row if it exists
  if (currentRow.length > 0) {
    rows.push([...currentRow].sort((a, b) => a.x - b.x));
  }
  
  return rows;
}
