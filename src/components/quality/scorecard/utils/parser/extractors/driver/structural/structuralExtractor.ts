
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
  
  // We'll focus on pages 2 and 3 which typically contain driver data
  // Changed to include page 2 since some PDFs might start the table there
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
  
  // Process all relevant pages that might contain driver data
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    if (!page || !page.items || page.items.length === 0) continue;
    
    console.log(`Processing page ${pageNum} with ${page.items.length} items`);
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = groupItemsIntoRows(page.items);
    console.log(`Grouped ${page.items.length} items into ${rows.length} rows on page ${pageNum}`);
    
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
        // Enhanced pattern to match more driver ID formats
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
            if (/^A[A-Z0-9]{3,}/.test(text)) {
              console.log(`Found potential driver ID: ${text} on page ${pageNum}`);
              
              // Now try to find numerical values in the same row
              const rowItems = row.filter(r => r !== item);
              const numericalItems = rowItems.filter(r => /\d+(?:\.\d+)?/.test(r.str));
              
              if (numericalItems.length >= 3) {
                // This looks like a driver row with metrics
                const metrics = [];
                const metricNames = ['Delivered', 'DCR', 'DNR DPMO', 'POD', 'CC', 'CE', 'DEX'];
                
                // Extract up to 7 metrics (or as many as we have values for)
                for (let i = 0; i < Math.min(numericalItems.length, metricNames.length); i++) {
                  const value = extractNumeric(numericalItems[i].str);
                  metrics.push({
                    name: metricNames[i],
                    value,
                    target: getTargetForMetric(metricNames[i]),
                    unit: getUnitForMetric(metricNames[i]),
                    status: determineMetricStatus(metricNames[i], value)
                  });
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
      return "neutral";
  }
}
