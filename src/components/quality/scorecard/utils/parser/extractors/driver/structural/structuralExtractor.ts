
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractDriverKPIsFromText } from '../textExtractor';
import { groupItemsIntoRows } from './itemGrouping';
import { findHeaderRow } from './headerFinder';
import { 
  processDataRows, 
  processDriverRow,
  processTableData as importedProcessTableData,
  getTargetForMetric as importedGetTargetForMetric,
  getUnitForMetric as importedGetUnitForMetric,
  createMetricFromValue
} from '../../../driver/processors';
import { extractNumeric, isNumeric } from './valueExtractor';

/**
 * Extract driver KPIs from structural analysis of the PDF
 */
export function extractDriverKPIsFromStructure(pageData: Record<number, any>): DriverKPI[] {
  console.log("Extracting driver KPIs with structural analysis");
  
  // We'll focus on pages 2, 3, and 4 which typically contain driver data
  const relevantPages = [2, 3, 4].filter(num => pageData[num]);
  const drivers: DriverKPI[] = [];
  
  // Log available pages for debugging
  console.log(`Available pages for extraction: ${Object.keys(pageData).join(', ')}`);
  
  // Check if we have the DSP Weekly Summary heading
  let isDspWeeklySummaryFound = false;
  for (const pageNum of relevantPages) {
    const pageText = pageData[pageNum]?.text || "";
    if (pageText.includes("DSP WEEKLY SUMMARY")) {
      console.log("Found DSP WEEKLY SUMMARY heading on page " + pageNum);
      isDspWeeklySummaryFound = true;
      break;
    }
  }
  
  // For improved extraction, look through all tables in all relevant pages
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    if (!page || !page.items || page.items.length === 0) continue;
    
    console.log(`Processing page ${pageNum} with ${page.items.length} items and ${page.tables?.length || 0} tables`);
    
    // If we have detected tables, process them first
    if (page.tables && page.tables.length > 0) {
      for (const table of page.tables) {
        console.log(`Processing table with ${table.rows.length} rows`);
        
        // Only process tables with headers that match our expected pattern
        const tableHasDriverHeader = table.headers && table.headers.some(h => 
          h.text && (h.text.includes("Transporter") || h.text.includes("ID"))
        );
        
        if (tableHasDriverHeader) {
          console.log("Found table with driver header");
          
          // Try to extract drivers from this table
          const tableDrivers = importedProcessTableData(table);
          if (tableDrivers.length > 0) {
            drivers.push(...tableDrivers);
            console.log(`Added ${tableDrivers.length} drivers from table`);
          }
        }
      }
    }
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = groupItemsIntoRows(page.items);
    console.log(`Grouped ${page.items.length} items into ${rows.length} rows on page ${pageNum}`);
    
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
      console.log(`Found header row at index ${headerRowIndex} with ${Object.keys(headerIndexes).length} columns on page ${pageNum}`);
      
      // Process all rows after the header row
      const pageDrivers = processDataRows(rows, headerRowIndex, headerIndexes);
      drivers.push(...pageDrivers);
      
      console.log(`Extracted ${pageDrivers.length} drivers from page ${pageNum}`);
    } else {
      // If header row not found, try alternative approach for this page
      console.log(`Header row not found on page ${pageNum}, trying alternative approach`);
      
      // Try to identify driver rows directly based on pattern
      let inDriverSection = false;
      let driversFoundAlternative = 0;
      
      for (const row of rows) {
        // Skip rows with less than 5 items (likely not a driver row)
        if (row.length < 5) continue;
        
        // Sort row by x-coordinate to ensure correct column order
        const sortedRow = [...row].sort((a, b) => a.x - b.x);
        
        // Check if this is a potential driver row
        const firstColumn = sortedRow[0]?.str || "";
        
        // If we find the "Transporter ID" header, mark that we're in the driver section
        if (firstColumn.includes("Transporter") || 
            firstColumn.includes("ID") || 
            firstColumn.toLowerCase().includes("id")) {
          inDriverSection = true;
          continue;
        }
        
        // If we're in the driver section and find an 'A' prefixed code that looks like a driver ID
        if (inDriverSection && /^A[A-Z0-9]{5,}/.test(firstColumn.trim())) {
          const driverRow = processDriverRow(sortedRow);
          if (driverRow) {
            drivers.push(driverRow);
            driversFoundAlternative++;
            console.log(`Added driver ${driverRow.name} from page ${pageNum} using alternative approach`);
          }
        }
      }
      
      if (driversFoundAlternative > 0) {
        console.log(`Found ${driversFoundAlternative} drivers on page ${pageNum} using alternative approach`);
      } else {
        console.log(`No drivers found on page ${pageNum} using alternative approaches`);
        
        // Try a more aggressive approach if nothing was found
        console.log(`Trying aggressive driver ID detection on page ${pageNum}`);
        
        // Look for anything that might be a driver ID (starting with A followed by alphanumeric)
        let aggressiveDriversFound = 0;
        for (const row of rows) {
          // Skip very short rows
          if (row.length < 3) continue;
          
          for (const item of row) {
            const text = item.str.trim();
            // Look for driver IDs starting with 'A'
            if (/^A[A-Z0-9]{5,}/.test(text)) {
              console.log(`Found potential driver ID: ${text} on page ${pageNum}`);
              
              // Now try to find numerical values in the same row
              const rowItems = row.filter(r => r !== item);
              // Sort by x-coordinate to ensure proper order
              const sortedItems = [...rowItems].sort((a, b) => a.x - b.x);
              
              // Extract all numeric values from this row
              const numericalItems = sortedItems.filter(r => /\d+(?:\.\d+)?|\-/.test(r.str));
              
              if (numericalItems.length >= 3) {
                // This looks like a driver row with metrics
                const metrics = [];
                const metricNames = ['Delivered', 'DCR', 'DNR DPMO', 'POD', 'CC', 'CE', 'DEX'];
                
                // Extract up to 7 metrics (or as many as we have values for)
                for (let i = 0; i < Math.min(numericalItems.length, metricNames.length); i++) {
                  const valueStr = numericalItems[i].str.trim();
                  
                  if (valueStr === "-") {
                    metrics.push({
                      name: metricNames[i],
                      value: 0,
                      target: importedGetTargetForMetric(metricNames[i]),
                      unit: importedGetUnitForMetric(metricNames[i]),
                      status: "none" as const
                    });
                  } else {
                    const value = extractNumeric(valueStr);
                    metrics.push({
                      name: metricNames[i],
                      value,
                      target: importedGetTargetForMetric(metricNames[i]),
                      unit: importedGetUnitForMetric(metricNames[i]),
                      status: determineStatus(metricNames[i], value) as any
                    });
                  }
                }
                
                if (metrics.length > 0) {
                  drivers.push({
                    name: text,
                    status: "active",
                    metrics
                  });
                  aggressiveDriversFound++;
                }
              }
            }
          }
        }
        
        if (aggressiveDriversFound > 0) {
          console.log(`Found ${aggressiveDriversFound} drivers on page ${pageNum} using aggressive detection`);
        }
      }
    }
  }
  
  // If we found even one driver with structural analysis, return them
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with structural analysis`);
    
    // Deduplicate drivers based on name
    const uniqueDrivers = [];
    const seenDrivers = new Set();
    
    for (const driver of drivers) {
      if (!seenDrivers.has(driver.name)) {
        seenDrivers.add(driver.name);
        uniqueDrivers.push(driver);
      }
    }
    
    console.log(`After deduplication: ${uniqueDrivers.length} unique drivers`);
    return uniqueDrivers;
  }
  
  // If we didn't find any drivers with the structural approach, fall back to regex-based extraction
  console.log("No drivers found with structural analysis, trying text-based extraction");
  
  // Try to extract based on text patterns from all pages
  const combinedText = relevantPages.map(pageNum => 
    pageData[pageNum]?.text || ""
  ).join("\n\n");
  
  return extractDriverKPIsFromText(combinedText);
}

// Remove duplicate function definition and use the imported version

