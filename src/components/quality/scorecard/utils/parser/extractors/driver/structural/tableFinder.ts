
/**
 * Helper functions to find and analyze table structures in PDF data
 */
import { findHeaderRow } from './headerFinder';
import { groupItemsIntoRows } from './itemGrouping';
import { processDataRows } from '../../../driver/processors';

/**
 * Locate and process tables from page items
 */
export function findAndProcessTables(page: any): { drivers: any[], foundTable: boolean } {
  console.log(`Looking for tables in page with ${page.items?.length || 0} items`);
  const drivers: any[] = [];
  let foundTable = false;
  
  // Group items by rows based on y-coordinate
  const rows: any[][] = groupItemsIntoRows(page.items);
  console.log(`Grouped ${page.items?.length || 0} items into ${rows.length} rows`);
  
  // Expected headers for driver metrics
  const expectedHeaders = [
    "Transporter ID", 
    "Delivered", 
    "DCR",
    "DNR DPMO", 
    "POD", 
    "CC", 
    "CE", 
    "DEX"
  ];
  
  // Find the header row
  const headerRowData = findHeaderRow(rows, expectedHeaders);
  
  if (headerRowData) {
    const { headerRow, headerRowIndex, headerIndexes } = headerRowData;
    console.log(`Found header row at index ${headerRowIndex} with ${Object.keys(headerIndexes).length} columns`);
    
    // Process all rows after the header row
    const pageDrivers = processDataRows(rows, headerRowIndex, headerIndexes);
    drivers.push(...pageDrivers);
    
    foundTable = true;
    console.log(`Extracted ${pageDrivers.length} drivers from table`);
  }
  
  return { drivers, foundTable };
}

/**
 * Process structured tables that are already identified in the PDF
 */
export function processIdentifiedTables(tables: any[]): any[] {
  const drivers: any[] = [];
  
  for (const table of tables) {
    console.log(`Processing identified table with ${table.rows.length} rows`);
    
    // Only process tables with headers that match our expected pattern
    const tableHasDriverHeader = table.headers && table.headers.some((h: any) => 
      h.text && (h.text.includes("Transporter") || h.text.includes("ID"))
    );
    
    if (tableHasDriverHeader) {
      console.log("Found identified table with driver header");
      
      try {
        // Import needed to avoid circular dependencies
        const { processTableData } = require('../../../driver/processors');
        // Try to extract drivers from this table
        const tableDrivers = processTableData(table);
        if (tableDrivers.length > 0) {
          drivers.push(...tableDrivers);
          console.log(`Added ${tableDrivers.length} drivers from identified table`);
        }
      } catch (err) {
        console.error("Error processing identified table:", err);
      }
    }
  }
  
  return drivers;
}
