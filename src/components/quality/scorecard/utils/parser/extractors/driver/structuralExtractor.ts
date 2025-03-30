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
  
  // Look for driver patterns in relevant pages
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    
    // Skip if page doesn't exist
    if (!page) continue;
    
    console.log(`Analyzing page ${pageNum} for driver data with ${page.items?.length || 0} items`);
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let lastY = -1;
    
    // Sort items by y-coordinate (top to bottom)
    if (!page.items || page.items.length === 0) {
      console.warn(`No items found on page ${pageNum}`);
      continue;
    }
    
    const sortedItems = [...page.items].sort((a, b) => b.y - a.y);
    
    // Group into rows with more flexible tolerance to handle table rows
    for (const item of sortedItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) < 10) {
        // Same row - increased tolerance from 5 to 10
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
    if (currentRow.length > 0) {
      rows.push([...currentRow].sort((a, b) => a.x - b.x));
    }
    
    console.log(`Grouped ${sortedItems.length} items into ${rows.length} rows on page ${pageNum}`);
    
    // Headers we expect based on the provided image
    const expectedHeaders = [
      "Transporter ID", 
      "Delivered", 
      "DCR",  // Keep original name from PDF
      "DNR DPMO", 
      "POD", 
      "CC", 
      "CE", 
      "DEX"
    ];
    
    let headerRow: any[] = [];
    let headerIndexes: Record<string, number> = {};
    
    // Look for header row - make sure we check for exact matches
    for (const row of rows) {
      // Extract text from row items and concatenate
      const rowItems = row.map(item => item.str.trim());
      const rowText = rowItems.join(' ');
      
      // Check if this row contains a significant number of expected headers
      const headerMatches = expectedHeaders.filter(header => {
        const headerLower = header.toLowerCase();
        return rowItems.some(item => 
          item.toLowerCase() === headerLower || 
          item.toLowerCase().includes(headerLower)
        );
      });
      
      // If we found enough headers, mark this as the header row
      if (headerMatches.length >= 3) {
        console.log("Found header row with columns: " + rowText);
        headerRow = row;
        
        // Map column positions to header names
        for (let i = 0; i < row.length; i++) {
          const headerText = row[i].str.trim().toLowerCase();
          
          if (headerText === "transporter id" || headerText.includes("transporter")) {
            headerIndexes["Transporter ID"] = i;
          } else if (headerText === "delivered") {
            headerIndexes["Delivered"] = i;
          } else if (headerText === "dcr") {
            headerIndexes["DCR"] = i;
          } else if (headerText === "dnr dpmo" || headerText === "dpmo") {
            headerIndexes["DNR DPMO"] = i;
          } else if (headerText === "pod") {
            headerIndexes["POD"] = i;
          } else if (headerText === "cc") {
            headerIndexes["CC"] = i;
          } else if (headerText === "ce") {
            headerIndexes["CE"] = i;
          } else if (headerText === "dex") {
            headerIndexes["DEX"] = i;
          }
        }
        
        console.log("Header indexes:", headerIndexes);
        break;
      }
    }
    
    // If we found header row, process data rows
    if (Object.keys(headerIndexes).length > 0) {
      console.log("Processing data rows using header information");
      
      // Skip header row and process data rows
      let headerRowIndex = rows.indexOf(headerRow);
      if (headerRowIndex >= 0) {
        // Process rows after the header
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          
          // Skip if row is too short (less than 4 items is not a valid driver row)
          if (row.length < 4) continue;
          
          // Get driver ID (Transporter ID)
          const driverIdIndex = headerIndexes["Transporter ID"];
          if (driverIdIndex !== undefined && driverIdIndex < row.length) {
            const driverId = row[driverIdIndex].str.trim();
            
            // Skip if driver ID is empty or doesn't match the expected pattern
            // In the image, the IDs appear to be alphanumeric with length around 10-12 chars
            if (!driverId || driverId.length < 8) continue;
            
            console.log(`Found driver ID in structural analysis: ${driverId}`);
            
            // Collect metrics for this driver
            const metrics = [];
            
            // Process all metrics based on the header indexes
            
            // Delivered (keep original name)
            if (headerIndexes["Delivered"] !== undefined && headerIndexes["Delivered"] < row.length) {
              const deliveredStr = row[headerIndexes["Delivered"]].str.trim();
              const deliveredValue = extractNumeric(deliveredStr);
              
              if (!isNaN(deliveredValue)) {
                metrics.push({
                  name: "Delivered",
                  value: deliveredValue,
                  target: 0,
                  unit: "",
                  status: determineStatus("Delivered", deliveredValue)
                });
              }
            }
            
            // DCR (keep original name)
            if (headerIndexes["DCR"] !== undefined && headerIndexes["DCR"] < row.length) {
              const dcrStr = row[headerIndexes["DCR"]].str.trim();
              const dcrValue = extractNumeric(dcrStr);
              
              if (!isNaN(dcrValue)) {
                metrics.push({
                  name: "DCR",
                  value: dcrValue,
                  target: 98.5,
                  unit: "%",
                  status: determineStatus("DCR", dcrValue)
                });
              }
            }
            
            // Add DNR DPMO metric if available
            if (headerIndexes["DNR DPMO"] !== undefined && headerIndexes["DNR DPMO"] < row.length) {
              const dpmoStr = row[headerIndexes["DNR DPMO"]].str.trim();
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
            
            // Add POD metric if available
            if (headerIndexes["POD"] !== undefined && headerIndexes["POD"] < row.length) {
              const podStr = row[headerIndexes["POD"]].str.trim();
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
            
            // Add CC metric if available
            if (headerIndexes["CC"] !== undefined && headerIndexes["CC"] < row.length) {
              const ccStr = row[headerIndexes["CC"]].str.trim();
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
            
            // Add CE metric if available
            if (headerIndexes["CE"] !== undefined && headerIndexes["CE"] < row.length) {
              const ceStr = row[headerIndexes["CE"]].str.trim();
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
            
            // Add DEX metric if available
            if (headerIndexes["DEX"] !== undefined && headerIndexes["DEX"] < row.length) {
              const dexStr = row[headerIndexes["DEX"]].str.trim();
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
            
            // Only add driver if we found some metrics
            if (metrics.length > 0) {
              drivers.push({
                name: driverId,
                status: "active",
                metrics
              });
              console.log(`Added driver ${driverId} with ${metrics.length} metrics`);
            }
          }
        }
      }
    } else if (isDspWeeklySummaryFound) {
      // If we found the DSP WEEKLY SUMMARY heading but couldn't process the headers,
      // try to extract the data in a different way by looking for rows with the expected pattern
      console.log("Trying alternative extraction due to DSP Weekly Summary heading but no header row");
      
      // Look for rows with alphanumeric driver IDs (like A10PTF5T1G664)
      for (const row of rows) {
        const rowItems = row.map(item => item.str.trim());
        const rowText = rowItems.join(' ');
        
        // Check if this row has an alphanumeric ID that looks like a driver ID
        // DSP IDs typically have format like 'A3GC57M6CUHDOR'
        const driverIdMatch = rowItems[0]?.match(/^[A-Z][A-Z0-9]{8,}$/);
        if (driverIdMatch && rowItems.length >= 5) {
          const driverId = rowItems[0];
          console.log(`Found driver with ID pattern: ${driverId}, row has ${rowItems.length} items`);
          
          // Try to extract numeric values in the correct order
          const numericValues = rowItems.slice(1).map(str => {
            // Convert percentages to numbers
            const num = extractNumeric(str);
            return isNaN(num) ? null : num;
          }).filter(val => val !== null);
          
          console.log(`Found ${numericValues.length} numeric values for driver ${driverId}: ${numericValues.join(', ')}`);
          
          if (numericValues.length >= 3) {
            const metrics = [];
            
            // Map positions to metrics based on the expected order in the DSP Weekly Summary
            // Expected order: Delivered, DCR, DNR DPMO, POD, CC, CE, DEX
            
            // Delivered (1st value)
            if (numericValues.length > 0) {
              metrics.push({
                name: "Delivered",
                value: numericValues[0],
                target: 0,
                unit: "",
                status: determineStatus("Delivered", numericValues[0])
              });
            }
            
            // DCR percentage (2nd value)
            if (numericValues.length > 1) {
              metrics.push({
                name: "DCR",
                value: numericValues[1],
                target: 98.5,
                unit: "%",
                status: determineStatus("DCR", numericValues[1])
              });
            }
            
            // DNR DPMO (3rd value)
            if (numericValues.length > 2) {
              metrics.push({
                name: "DNR DPMO",
                value: numericValues[2],
                target: 1500,
                unit: "DPMO",
                status: determineStatus("DNR DPMO", numericValues[2])
              });
            }
            
            // POD percentage (4th value)
            if (numericValues.length > 3) {
              metrics.push({
                name: "POD",
                value: numericValues[3],
                target: 98,
                unit: "%",
                status: determineStatus("POD", numericValues[3])
              });
            }
            
            // CC percentage (5th value)
            if (numericValues.length > 4) {
              metrics.push({
                name: "CC",
                value: numericValues[4],
                target: 95,
                unit: "%",
                status: determineStatus("Contact Compliance", numericValues[4])
              });
            }
            
            // CE (6th value)
            if (numericValues.length > 5) {
              const ceValue = numericValues[5];
              metrics.push({
                name: "CE",
                value: ceValue,
                target: 0,
                unit: "",
                status: ceValue === 0 ? "fantastic" as const : "poor" as const
              });
            }
            
            // DEX percentage (7th value)
            if (numericValues.length > 6) {
              metrics.push({
                name: "DEX",
                value: numericValues[6],
                target: 95,
                unit: "%",
                status: determineStatus("DEX", numericValues[6])
              });
            }
            
            // Add driver to list if we found metrics
            if (metrics.length > 0) {
              drivers.push({
                name: driverId,
                status: "active",
                metrics
              });
              console.log(`Added driver ${driverId} with ${metrics.length} metrics via alternative method`);
            }
          }
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
  
  // Log text for debugging
  console.log(`Combined text length for extraction: ${combinedText.length} chars`);
  if (combinedText.length < 500) {
    console.log(`Combined text for extraction: ${combinedText}`);
  }
  
  return extractDriverKPIsFromText(combinedText);
};

/**
 * Helper function to extract numeric values from strings, handling percentages and commas
 */
const extractNumeric = (str: string): number => {
  if (!str) return NaN;
  
  // Remove % symbol and replace commas with dots for decimal notation
  const cleanStr = str.replace('%', '').replace(',', '.');
  return parseFloat(cleanStr);
};
