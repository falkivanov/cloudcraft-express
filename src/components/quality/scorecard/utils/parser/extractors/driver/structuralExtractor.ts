
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
    
    console.log(`Analyzing page ${pageNum} for driver data`);
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let lastY = -1;
    
    // Sort items by y-coordinate (top to bottom)
    const sortedItems = [...page.items].sort((a, b) => b.y - a.y);
    
    // Group into rows
    for (const item of sortedItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) < 5) {
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
    if (currentRow.length > 0) {
      rows.push([...currentRow].sort((a, b) => a.x - b.x));
    }
    
    // Headers we expect based on the image
    const expectedHeaders = ["Transporter ID", "Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
    let headerRow: any[] = [];
    let headerIndexes: Record<string, number> = {};
    
    // Look for header row
    for (const row of rows) {
      const rowText = row.map(item => item.str.trim()).join(' ');
      
      // Check if this row contains a significant number of expected headers
      const headerMatches = expectedHeaders.filter(header => 
        rowText.includes(header) || 
        (header === "Transporter ID" && rowText.includes("Transporter")) ||
        (header === "Contact Compliance" && rowText.includes("CC"))
      );
      
      // If we found enough headers, mark this as the header row
      if (headerMatches.length >= 3) {
        console.log("Found header row with columns: " + rowText);
        headerRow = row;
        
        // Map column positions to header names
        for (let i = 0; i < row.length; i++) {
          const headerText = row[i].str.trim();
          
          if (headerText === "Transporter ID" || headerText.includes("Transporter")) {
            headerIndexes["Transporter ID"] = i;
          } else if (headerText === "Delivered") {
            headerIndexes["Delivered"] = i;
          } else if (headerText === "DNR DPMO" || headerText === "DPMO") {
            headerIndexes["DNR DPMO"] = i;
          } else if (headerText === "POD") {
            headerIndexes["POD"] = i;
          } else if (headerText === "CC") {
            headerIndexes["Contact Compliance"] = i;
          } else if (headerText === "CE") {
            headerIndexes["Customer Escalation"] = i;
          } else if (headerText === "DEX") {
            headerIndexes["DEX"] = i;
          } else if (headerText === "DCR") {
            headerIndexes["DCR"] = i;
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
          
          // Skip if row is too short
          if (row.length < 4) continue;
          
          // Get driver ID (Transporter ID)
          const driverIdIndex = headerIndexes["Transporter ID"];
          if (driverIdIndex !== undefined && driverIdIndex < row.length) {
            const driverId = row[driverIdIndex].str.trim();
            
            // Skip if driver ID is empty or doesn't match the expected pattern
            if (!driverId || driverId.length < 3) continue;
            
            console.log(`Found driver ID: ${driverId}`);
            
            // Collect metrics for this driver
            const metrics = [];
            
            // Add Delivered metric if available
            if (headerIndexes["Delivered"] !== undefined && headerIndexes["Delivered"] < row.length) {
              const deliveredStr = row[headerIndexes["Delivered"]].str.trim();
              const deliveredValue = parseFloat(deliveredStr.replace('%', ''));
              
              if (!isNaN(deliveredValue)) {
                metrics.push({
                  name: "Delivered",
                  value: deliveredValue,
                  target: 100,
                  unit: "%",
                  status: determineStatus("Delivered", deliveredValue)
                });
              }
            }
            
            // Add DNR DPMO metric if available
            if (headerIndexes["DNR DPMO"] !== undefined && headerIndexes["DNR DPMO"] < row.length) {
              const dpmoStr = row[headerIndexes["DNR DPMO"]].str.trim();
              const dpmoValue = parseInt(dpmoStr);
              
              if (!isNaN(dpmoValue)) {
                metrics.push({
                  name: "DNR DPMO",
                  value: dpmoValue,
                  target: 3000,
                  unit: "DPMO",
                  status: determineStatus("DNR DPMO", dpmoValue)
                });
              }
            }
            
            // Add POD metric if available
            if (headerIndexes["POD"] !== undefined && headerIndexes["POD"] < row.length) {
              const podStr = row[headerIndexes["POD"]].str.trim();
              const podValue = parseFloat(podStr.replace('%', ''));
              
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
            
            // Add Contact Compliance metric if available
            if (headerIndexes["Contact Compliance"] !== undefined && headerIndexes["Contact Compliance"] < row.length) {
              const ccStr = row[headerIndexes["Contact Compliance"]].str.trim();
              const ccValue = parseFloat(ccStr.replace('%', ''));
              
              if (!isNaN(ccValue)) {
                metrics.push({
                  name: "Contact Compliance",
                  value: ccValue,
                  target: 95,
                  unit: "%",
                  status: determineStatus("Contact Compliance", ccValue)
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
            }
          }
        }
      }
    } else if (isDspWeeklySummaryFound) {
      // If we found the DSP WEEKLY SUMMARY heading but couldn't process the headers,
      // try to extract the data in a different way
      
      // Look for rows with alphanumeric driver IDs (like A10PTF5T1G664)
      for (const row of rows) {
        const rowItems = row.map(item => item.str.trim());
        const rowText = rowItems.join(' ');
        
        // Check if this row has an alphanumeric ID that looks like a driver ID
        const driverIdMatch = rowItems[0]?.match(/^[A-Z][A-Z0-9]{8,}$/);
        if (driverIdMatch && rowItems.length >= 5) {
          const driverId = rowItems[0];
          console.log(`Found driver with ID pattern: ${driverId}`);
          
          // Try to extract numeric values in the correct order
          const numericValues = rowItems.slice(1).map(str => {
            // Convert percentages to numbers
            if (str.includes('%')) {
              return parseFloat(str.replace('%', ''));
            }
            // Convert plain numbers
            const num = parseFloat(str);
            return isNaN(num) ? null : num;
          }).filter(val => val !== null);
          
          if (numericValues.length >= 3) {
            const metrics = [];
            
            // Add metrics based on position (following the DSP Weekly Summary format)
            if (numericValues.length > 0) {
              metrics.push({
                name: "Delivered",
                value: numericValues[1], // Delivered is typically in position 2
                target: 100,
                unit: "%",
                status: determineStatus("Delivered", numericValues[1])
              });
            }
            
            if (numericValues.length > 2) {
              metrics.push({
                name: "DNR DPMO",
                value: numericValues[2], // DNR DPMO is typically in position 3
                target: 3000,
                unit: "DPMO",
                status: determineStatus("DNR DPMO", numericValues[2])
              });
            }
            
            if (numericValues.length > 3) {
              metrics.push({
                name: "POD",
                value: numericValues[3], // POD is typically in position 4
                target: 98,
                unit: "%",
                status: determineStatus("POD", numericValues[3])
              });
            }
            
            if (numericValues.length > 4) {
              metrics.push({
                name: "Contact Compliance",
                value: numericValues[4], // CC is typically in position 5
                target: 95,
                unit: "%",
                status: determineStatus("Contact Compliance", numericValues[4])
              });
            }
            
            // Add driver to list if we found metrics
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
    }
  }
  
  // If we didn't find any drivers with the structural approach, fall back to regex-based extraction
  if (drivers.length === 0) {
    console.log("No drivers found with structural analysis, trying text-based extraction");
    
    // Try to extract based on text patterns from all pages
    const combinedText = relevantPages.map(pageNum => 
      pageData[pageNum]?.text || ""
    ).join("\n\n");
    
    return extractDriverKPIsFromText(combinedText);
  }
  
  console.log(`Successfully extracted ${drivers.length} drivers`);
  return drivers;
};
