
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
    for (let i = 1; i <= pdf.numPages; i++) {
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
    
    // Process ALL pages to ensure we don't miss any tables or data
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages}`);
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent({normalizeWhitespace: true});
        
        // Get items with positions and process them
        const items = extractAndProcessItems(textContent, viewport);
        
        // Group items into logical rows for better structure reconstruction
        const rows = groupItemsIntoRows(items);
        
        // Enhanced table detection - look for grid-like structures
        const tables = detectTables(rows);
        
        // Store page data with both items, rows and tables
        result[i] = {
          items: items,
          rows: rows,
          tables: tables,
          text: items.map((item: any) => item.str).join(' '),
          width: viewport.width,
          height: viewport.height
        };
      } catch (error) {
        console.error(`Error processing page ${i}:`, error);
        // Continue with other pages even if one fails
      }
    }
    
    console.log(`Successfully processed ${Object.keys(result).length} pages`);
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
  
  // Group items into rows with improved tolerance for slight vertical misalignments
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

/**
 * Detect table structures within rows of text
 * This helps identify driver tables for better extraction
 */
function detectTables(rows: any[][]) {
  const tables = [];
  let currentTable: any = null;
  let columnCount = 0;
  
  // Scan rows to find potential tables
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip very short rows (likely not table rows)
    if (row.length < 3) {
      if (currentTable) {
        // We were in a table but now we're not, so end the current table
        tables.push(currentTable);
        currentTable = null;
      }
      continue;
    }
    
    // Look for header-like rows that might indicate a table start
    const isHeaderRow = row.some(item => 
      /transporter|driver|id|delivered|dcr|dnr|dpmo|pod|cc|ce|dex/i.test(item.str)
    );
    
    // Look for numeric content that suggests a data row
    const hasNumericContent = row.some(item => /\d+\.\d+|\d+%/.test(item.str));
    
    // Look for driver ID patterns
    const hasDriverId = row.some(item => 
      /^[A][A-Z0-9]{5,}|^TR[-\s]?\d{3,}/i.test(item.str.trim())
    );
    
    if (isHeaderRow) {
      // This is likely a header row, start a new table
      if (currentTable) {
        // End previous table if there was one
        tables.push(currentTable);
      }
      
      currentTable = {
        startRow: i,
        endRow: i,
        rows: [row],
        columnCount: row.length
      };
      columnCount = row.length;
    } 
    else if ((hasNumericContent || hasDriverId) && currentTable) {
      // This is likely a data row for the current table
      currentTable.rows.push(row);
      currentTable.endRow = i;
      
      // Update column count based on consistency
      if (Math.abs(row.length - columnCount) <= 2) {
        // This row has a similar number of columns, so it's likely part of the table
        columnCount = Math.max(columnCount, row.length);
        currentTable.columnCount = columnCount;
      }
    }
    else if (currentTable && i - currentTable.endRow <= 2) {
      // Allow small gaps in tables (max 2 rows)
      if (row.length >= currentTable.columnCount - 2) {
        // This row has enough columns to potentially be part of the table
        currentTable.rows.push(row);
        currentTable.endRow = i;
      } else {
        // End current table - too few columns to match
        tables.push(currentTable);
        currentTable = null;
      }
    }
    else if (currentTable) {
      // We're done with the current table
      tables.push(currentTable);
      currentTable = null;
    }
  }
  
  // Don't forget to add the last table if there is one
  if (currentTable) {
    tables.push(currentTable);
  }
  
  // Process tables to extract headers and calculate column positions
  return tables.map(table => {
    // Find header row (usually the first row)
    const headerRow = table.rows[0];
    
    // Extract header labels
    const headers = headerRow.map((item: any) => ({
      text: item.str,
      x: item.x,
      width: item.width
    }));
    
    // Calculate column boundaries based on headers
    const columns = headers.map((header: any, index: number) => {
      const nextHeader = headers[index + 1];
      return {
        name: header.text,
        start: header.x,
        end: nextHeader ? nextHeader.x : header.x + header.width + 50 // Add padding for last column
      };
    });
    
    return {
      ...table,
      headers,
      columns
    };
  });
}
