
import { determineStatus } from '../../../../helpers/statusHelper';
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIsFromText } from '../textExtractor';
import { groupItemsIntoRows } from './itemGrouping';
import { findHeaderRow } from './headerFinder';
import { processDataRows, processDriverRow } from './rowProcessors';
import { extractNumeric } from './valueExtractor';

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
          const tableDrivers = processTableData(table);
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
                      target: getTargetForMetric(metricNames[i]),
                      unit: getUnitForMetric(metricNames[i]),
                      status: "none" as const
                    });
                  } else {
                    const value = extractNumeric(valueStr);
                    metrics.push({
                      name: metricNames[i],
                      value,
                      target: getTargetForMetric(metricNames[i]),
                      unit: getUnitForMetric(metricNames[i]),
                      status: determineMetricStatus(metricNames[i], value) as any
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

// Process a table structure extracted from the PDF
function processTableData(table: any): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  let headerRow = null;
  let headerIndexes: Record<string, number> = {};
  
  // Find the header row first
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    
    // Look for Transporter ID or similar header
    const hasHeaderCell = row.some((cell: any) => 
      cell.str && (cell.str.includes("Transporter") || 
                    cell.str.includes("ID") || 
                    cell.str.includes("DCR") ||
                    cell.str.includes("DPMO"))
    );
    
    if (hasHeaderCell) {
      headerRow = row;
      
      // Map header cells to their indices
      headerRow.forEach((cell: any, index: number) => {
        const text = cell.str.trim();
        
        if (text.includes("Transporter") || text.includes("ID")) {
          headerIndexes["Transporter ID"] = index;
        } else if (text.includes("Delivered")) {
          headerIndexes["Delivered"] = index;
        } else if (text === "DCR") {
          headerIndexes["DCR"] = index;
        } else if (text.includes("DNR") || text.includes("DPMO")) {
          headerIndexes["DNR DPMO"] = index;
        } else if (text === "POD") {
          headerIndexes["POD"] = index;
        } else if (text === "CC") {
          headerIndexes["CC"] = index;
        } else if (text === "CE") {
          headerIndexes["CE"] = index;
        } else if (text === "DEX") {
          headerIndexes["DEX"] = index;
        }
      });
      
      break;
    }
  }
  
  if (headerRow) {
    // Process all rows after the header row
    const headerIndex = table.rows.indexOf(headerRow);
    
    for (let i = headerIndex + 1; i < table.rows.length; i++) {
      const row = table.rows[i];
      
      // Skip if row is too short
      if (row.length < 3) continue;
      
      // Extract driver ID
      const driverIdIndex = headerIndexes["Transporter ID"] !== undefined ?
        headerIndexes["Transporter ID"] : 0;
      
      if (driverIdIndex < row.length) {
        const driverId = row[driverIdIndex].str.trim();
        
        // Skip if not a valid driver ID
        if (!driverId || !driverId.startsWith('A') || driverId.length < 6) continue;
        
        // Process the driver row
        const metrics = [];
        const metricColumns = [
          { name: "Delivered", index: headerIndexes["Delivered"], target: 0, unit: "" },
          { name: "DCR", index: headerIndexes["DCR"], target: 98.5, unit: "%" },
          { name: "DNR DPMO", index: headerIndexes["DNR DPMO"], target: 1500, unit: "DPMO" },
          { name: "POD", index: headerIndexes["POD"], target: 98, unit: "%" },
          { name: "CC", index: headerIndexes["CC"], target: 95, unit: "%" },
          { name: "CE", index: headerIndexes["CE"], target: 0, unit: "" },
          { name: "DEX", index: headerIndexes["DEX"], target: 95, unit: "%" }
        ];
        
        // Process each metric
        for (const metricDef of metricColumns) {
          if (metricDef.index !== undefined && metricDef.index < row.length) {
            const valueStr = row[metricDef.index].str.trim();
            
            if (valueStr === "-") {
              metrics.push({
                name: metricDef.name,
                value: 0,
                target: metricDef.target,
                unit: metricDef.unit,
                status: "none" as const
              });
            } else {
              const value = extractNumeric(valueStr);
              if (!isNaN(value)) {
                metrics.push({
                  name: metricDef.name,
                  value,
                  target: metricDef.target,
                  unit: metricDef.unit,
                  status: determineStatus(metricDef.name, value)
                });
              }
            }
          }
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: driverId,
            status: "active",
            metrics
          });
        }
      }
    }
  }
  
  return drivers;
}

// Helper functions to get target and unit for metrics
function getTargetForMetric(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 0;
    case "DCR": return 98.5;
    case "DNR DPMO": return 1500;
    case "POD": return 98;
    case "CC": return 95;
    case "CE": return 0;
    case "DEX": return 95;
    default: return 0;
  }
}

function getUnitForMetric(metricName: string): string {
  switch (metricName) {
    case "DCR": return "%";
    case "DNR DPMO": return "DPMO";
    case "POD": return "%";
    case "CC": return "%";
    case "CE": return "";
    case "DEX": return "%";
    default: return "";
  }
}

function determineMetricStatus(metricName: string, value: number): string {
  // Determine status based on metric name and value
  switch (metricName) {
    case "DCR":
      if (value >= 99) return "fantastic";
      if (value >= 98.5) return "great";
      if (value >= 95) return "fair";
      return "poor";
    case "DNR DPMO":
      if (value <= 1000) return "fantastic";
      if (value <= 1500) return "great";
      if (value <= 2500) return "fair";
      return "poor";
    case "POD":
      if (value >= 99.5) return "fantastic";
      if (value >= 98) return "great";
      if (value >= 95) return "fair";
      return "poor";
    case "CC":
      if (value >= 99) return "fantastic";
      if (value >= 95) return "great";
      if (value >= 90) return "fair";
      return "poor";
    case "DEX":
      if (value >= 98) return "fantastic";
      if (value >= 95) return "great";
      if (value >= 90) return "fair";
      return "poor";
    default:
      return "fair";
  }
}
