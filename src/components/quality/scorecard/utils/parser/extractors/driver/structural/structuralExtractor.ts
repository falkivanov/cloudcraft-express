
import { determineStatus } from '../../../../helpers/statusHelper';
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIsFromText } from '../textExtractor';
import { groupItemsIntoRows } from './itemGrouping';
import { findHeaderRow } from './headerFinder';
import { processDataRows, processDriverRow } from './rowProcessors';

/**
 * Extract driver KPIs from structural analysis of the PDF
 */
export function extractDriverKPIsFromStructure(pageData: Record<number, any>): DriverKPI[] {
  console.log("Extracting driver KPIs with structural analysis");
  
  // We'll focus on pages 3 and 4 which typically contain driver data
  const relevantPages = [3, 4].filter(num => pageData[num]);
  const drivers: DriverKPI[] = [];
  
  // Check if we have the DSP Weekly Summary heading as seen in the image
  let isDspWeeklySummaryFound = false;
  for (const pageNum of relevantPages) {
    const pageText = pageData[pageNum]?.text || "";
    if (pageText.includes("DSP WEEKLY SUMMARY")) {
      console.log("Found DSP WEEKLY SUMMARY heading on page " + pageNum);
      isDspWeeklySummaryFound = true;
      break;
    }
  }
  
  // First process page 3, which typically contains most drivers
  const page3 = pageData[3];
  if (page3 && page3.items && page3.items.length > 0) {
    console.log(`Processing page 3 with ${page3.items.length} items`);
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = groupItemsIntoRows(page3.items);
    console.log(`Grouped ${page3.items.length} items into ${rows.length} rows on page 3`);
    
    // Headers we expect based on the provided image
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
      const pageThreeDrivers = processDataRows(rows, headerRowIndex, headerIndexes);
      drivers.push(...pageThreeDrivers);
      
      console.log(`Extracted ${pageThreeDrivers.length} drivers from page 3`);
    }
  }
  
  // Process page 4 for any remaining drivers
  const page4 = pageData[4];
  if (page4 && page4.items && page4.items.length > 0) {
    console.log(`Processing page 4 with ${page4.items.length} items`);
    
    // Group items by rows for page 4
    const rowsPage4: any[][] = groupItemsIntoRows(page4.items);
    console.log(`Grouped ${page4.items.length} items into ${rowsPage4.length} rows on page 4`);
    
    // Look for driver rows directly in page 4 (continuation of the table)
    for (const row of rowsPage4) {
      if (row.length >= 7) {  // At least 7 items for a complete driver row
        const driverRow = processDriverRow(row);
        if (driverRow) {
          drivers.push(driverRow);
          console.log(`Added driver ${driverRow.name} from page 4`);
        }
      }
    }
  }
  
  // If we found even one driver with structural analysis, return them
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with structural analysis`);
    return drivers;
  }
  
  // If we didn't find any drivers with the structural approach, fall back to regex-based extraction
  console.log("No drivers found with structural analysis, trying text-based extraction");
  
  // Try to extract based on text patterns from all pages
  const combinedText = relevantPages.map(pageNum => 
    pageData[pageNum]?.text || ""
  ).join("\n\n");
  
  return extractDriverKPIsFromText(combinedText);
}
