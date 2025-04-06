
import { DriverKPI } from "../../../../types";
import { groupItemsIntoRows } from './itemGrouping';
import { findHeaderRow } from './headerFinder';
import { processDataRows, processDriverRow } from '../../../driver/structural/rowProcessors';

/**
 * Extract driver KPIs from structured PDF data
 */
export function extractDriverKPIsFromStructure(pageData: Record<number, any>): DriverKPI[] {
  const drivers: DriverKPI[] = [];

  // Process each page
  Object.values(pageData).forEach(page => {
    if (!page.items) return;
    
    // Group items into rows
    const rows = groupItemsIntoRows(page.items);
    
    // Find header row for tabular data
    const expectedHeaders = ["Transporter ID", "Delivered", "DCR", "DNR DPMO"];
    const headerInfo = findHeaderRow(rows, expectedHeaders);
    
    if (headerInfo) {
      // Process rows as tabular data
      const tableDrivers = processDataRows(rows, headerInfo.headerRowIndex, headerInfo.headerIndexes);
      drivers.push(...tableDrivers);
    } else {
      // Try processing each row individually
      rows.forEach(row => {
        const driver = processDriverRow(row);
        if (driver) drivers.push(driver);
      });
    }
  });

  return drivers;
}
