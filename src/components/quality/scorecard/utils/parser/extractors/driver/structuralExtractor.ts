
import { determineStatus } from '../../../helpers/statusHelper';
import { extractDriverKPIsFromText } from './textExtractor';
import { extractNumericValues } from '../valueExtractor';
import { DriverKPI } from '../../../../types';

/**
 * Extract driver KPIs from structural analysis of the PDF
 */
export const extractDriverKPIsFromStructure = (pageData: Record<number, any>): DriverKPI[] => {
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
};

/**
 * Group PDF items into rows based on their y-coordinates
 */
function groupItemsIntoRows(items: any[]): any[][] {
  const rows: any[][] = [];
  let currentRow: any[] = [];
  let lastY = -1;
  
  // Sort items by y-coordinate (top to bottom)
  const sortedItems = [...items].sort((a, b) => b.y - a.y);
  
  // Group into rows with flexible tolerance to handle table rows
  for (const item of sortedItems) {
    if (lastY === -1 || Math.abs(item.y - lastY) < 12) {  // Increased tolerance
      // Same row
      currentRow.push(item);
    } else {
      // New row
      if (currentRow.length > 0) {
        rows.push([...currentRow].sort((a, b) => a.x - b.x)); // Sort by x within row
        currentRow = [item];
      } else {
        currentRow = [item];
      }
    }
    lastY = item.y;
  }
  
  // Add the last row if any items remain
  if (currentRow.length > 0) {
    rows.push([...currentRow].sort((a, b) => a.x - b.x));
  }
  
  return rows;
}

/**
 * Find the header row that contains the expected column headers
 */
function findHeaderRow(rows: any[][], expectedHeaders: string[]): { headerRow: any[], headerRowIndex: number, headerIndexes: Record<string, number> } | null {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowItems = row.map(item => item.str?.trim() || "");
    const rowText = rowItems.join(' ');
    
    // Check if this row contains several expected headers
    const headerMatches = expectedHeaders.filter(header => {
      const headerLower = header.toLowerCase();
      return rowItems.some(item => {
        const itemLower = (item || "").toLowerCase();
        return itemLower === headerLower || itemLower.includes(headerLower);
      });
    });
    
    // If we found enough headers, mark this as the header row
    if (headerMatches.length >= 3) {
      console.log("Found header row with columns: " + rowText);
      
      // Map column positions to header names
      const headerIndexes: Record<string, number> = {};
      for (let j = 0; j < row.length; j++) {
        const headerText = (row[j].str || "").trim().toLowerCase();
        
        if (headerText.includes("transporter") || headerText === "id") {
          headerIndexes["Transporter ID"] = j;
        } else if (headerText === "delivered") {
          headerIndexes["Delivered"] = j;
        } else if (headerText === "dcr") {
          headerIndexes["DCR"] = j;
        } else if (headerText.includes("dpmo") || headerText === "dnr") {
          headerIndexes["DNR DPMO"] = j;
        } else if (headerText === "pod") {
          headerIndexes["POD"] = j;
        } else if (headerText === "cc") {
          headerIndexes["CC"] = j;
        } else if (headerText === "ce") {
          headerIndexes["CE"] = j;
        } else if (headerText === "dex") {
          headerIndexes["DEX"] = j;
        }
      }
      
      console.log("Header indexes:", headerIndexes);
      return { headerRow: row, headerRowIndex: i, headerIndexes };
    }
  }
  
  return null;
}

/**
 * Process all data rows after the header row
 */
function processDataRows(rows: any[][], headerRowIndex: number, headerIndexes: Record<string, number>): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  
  // Process all rows after the header (headerRowIndex + 1)
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip if row is too short
    if (row.length < 4) continue;
    
    // Get driver ID from the first column (Transporter ID)
    const driverIdIndex = headerIndexes["Transporter ID"];
    
    if (driverIdIndex !== undefined && driverIdIndex < row.length) {
      const driverId = (row[driverIdIndex]?.str || "").trim();
      
      // Skip if driver ID is empty or doesn't look like a valid ID
      // Driver IDs are typically alphanumeric with 10+ characters
      if (!driverId || driverId.length < 8) continue;
      
      console.log(`Processing driver: ${driverId}`);
      
      // Collect metrics for this driver
      const metrics = [];
      
      // Delivered
      if (headerIndexes["Delivered"] !== undefined && headerIndexes["Delivered"] < row.length) {
        const deliveredStr = (row[headerIndexes["Delivered"]]?.str || "").trim();
        const deliveredValue = extractNumeric(deliveredStr);
        
        if (!isNaN(deliveredValue)) {
          metrics.push({
            name: "Delivered",  // Keep original name from PDF
            value: deliveredValue,
            target: 0,
            unit: "",
            status: determineStatus("Delivered", deliveredValue)
          });
        }
      }
      
      // DCR
      if (headerIndexes["DCR"] !== undefined && headerIndexes["DCR"] < row.length) {
        const dcrStr = (row[headerIndexes["DCR"]]?.str || "").trim();
        const dcrValue = extractNumeric(dcrStr);
        
        if (!isNaN(dcrValue)) {
          metrics.push({
            name: "DCR",  // Keep original name from PDF
            value: dcrValue,
            target: 98.5,
            unit: "%",
            status: determineStatus("DCR", dcrValue)
          });
        }
      }
      
      // DNR DPMO
      if (headerIndexes["DNR DPMO"] !== undefined && headerIndexes["DNR DPMO"] < row.length) {
        const dpmoStr = (row[headerIndexes["DNR DPMO"]]?.str || "").trim();
        const dpmoValue = extractNumeric(dpmoStr);
        
        if (!isNaN(dpmoValue)) {
          metrics.push({
            name: "DNR DPMO",
            value: dpmoValue,
            target: 1500,
            unit: "DPMO",
            status: determineStatus("DNR DPMO", dpmoValue)
          });
        }
      }
      
      // POD
      if (headerIndexes["POD"] !== undefined && headerIndexes["POD"] < row.length) {
        const podStr = (row[headerIndexes["POD"]]?.str || "").trim();
        const podValue = extractNumeric(podStr);
        
        if (!isNaN(podValue)) {
          metrics.push({
            name: "POD",
            value: podValue,
            target: 98,
            unit: "%",
            status: determineStatus("POD", podValue)
          });
        }
      }
      
      // CC (Contact Compliance)
      if (headerIndexes["CC"] !== undefined && headerIndexes["CC"] < row.length) {
        const ccStr = (row[headerIndexes["CC"]]?.str || "").trim();
        const ccValue = extractNumeric(ccStr);
        
        if (!isNaN(ccValue)) {
          metrics.push({
            name: "CC",
            value: ccValue,
            target: 95,
            unit: "%",
            status: determineStatus("Contact Compliance", ccValue)
          });
        }
      }
      
      // CE (Customer Escalations)
      if (headerIndexes["CE"] !== undefined && headerIndexes["CE"] < row.length) {
        const ceStr = (row[headerIndexes["CE"]]?.str || "").trim();
        const ceValue = extractNumeric(ceStr);
        
        if (!isNaN(ceValue)) {
          metrics.push({
            name: "CE",
            value: ceValue,
            target: 0,
            unit: "",
            status: ceValue === 0 ? "fantastic" as const : "poor" as const
          });
        }
      }
      
      // DEX
      if (headerIndexes["DEX"] !== undefined && headerIndexes["DEX"] < row.length) {
        const dexStr = (row[headerIndexes["DEX"]]?.str || "").trim();
        const dexValue = extractNumeric(dexStr);
        
        if (!isNaN(dexValue)) {
          metrics.push({
            name: "DEX",
            value: dexValue,
            target: 95,
            unit: "%",
            status: determineStatus("DEX", dexValue)
          });
        }
      }
      
      // Only add driver if we found at least some metrics
      if (metrics.length > 0) {
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
      }
    }
  }
  
  return drivers;
}

/**
 * Process a single driver row (for page 4)
 */
function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs are typically alphanumeric with 10+ characters
  if (!driverId || driverId.length < 8) return null;
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Extract all numeric values from the row
  const numericValues: number[] = [];
  for (let i = 1; i < row.length; i++) {
    const valueStr = (row[i]?.str || "").trim();
    const numericValue = extractNumeric(valueStr);
    if (!isNaN(numericValue)) {
      numericValues.push(numericValue);
    }
  }
  
  if (numericValues.length < 3) return null;
  
  // Map the numeric values to metrics in the expected order
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  for (let i = 0; i < Math.min(numericValues.length, metricNames.length); i++) {
    const value = numericValues[i];
    metrics.push({
      name: metricNames[i],
      value: value,
      target: metricTargets[i],
      unit: metricUnits[i],
      status: determineStatus(metricNames[i], value)
    });
  }
  
  return {
    name: driverId,
    status: "active",
    metrics
  };
}

/**
 * Helper function to extract numeric values from strings, handling percentages and commas
 */
const extractNumeric = (str: string): number => {
  if (!str) return NaN;
  
  // Remove % symbol and replace commas with dots for decimal notation
  const cleanStr = str.replace('%', '').replace(',', '.');
  return parseFloat(cleanStr);
};
