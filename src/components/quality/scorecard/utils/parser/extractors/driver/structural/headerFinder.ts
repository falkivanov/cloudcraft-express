/**
 * Functions for finding and processing the header row in tabular data
 */
import { isNumeric } from './valueExtractor';

/**
 * Find the header row that contains the expected column headers
 */
export function findHeaderRow(rows: any[][], expectedHeaders: string[]): { headerRow: any[], headerRowIndex: number, headerIndexes: Record<string, number> } | null {
  // First try to find exact matches for the Transporter ID header
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowItems = row.map(item => item.str?.trim() || "");
    const rowText = rowItems.join(' ');
    
    console.log(`Checking row ${i} for header: ${rowText}`);
    
    // Look specifically for "Transporter ID" as the first column header
    const transporterIdIndex = rowItems.findIndex(item => 
      (item || "").toLowerCase() === "transporter id" || 
      (item || "").toLowerCase() === "transporter" || 
      (item || "").toLowerCase() === "id"
    );
    
    if (transporterIdIndex !== -1) {
      console.log(`Found header row with Transporter ID at index ${transporterIdIndex}`);
      
      // Map column positions to header names
      const headerIndexes: Record<string, number> = {};
      headerIndexes["Transporter ID"] = transporterIdIndex;
      
      // Look for any header column names dynamically and preserve their order
      const orderedHeaderNames: string[] = [];
      
      for (let j = 0; j < row.length; j++) {
        const headerText = (row[j].str || "").trim();
        const headerTextLower = headerText.toLowerCase();
        
        // Skip empty cells
        if (!headerText) continue;
        
        // Explicitly check for each possible header
        if (headerTextLower === "delivered") {
          headerIndexes["Delivered"] = j;
          orderedHeaderNames.push("Delivered");
        } 
        else if (headerTextLower === "dcr") {
          headerIndexes["DCR"] = j;
          orderedHeaderNames.push("DCR");
        }
        else if (headerTextLower === "dnr dpmo" || headerTextLower.includes("dnr")) {
          headerIndexes["DNR DPMO"] = j;
          orderedHeaderNames.push("DNR DPMO");
        }
        else if (headerTextLower === "lor dpmo" || headerTextLower.includes("lor")) {
          headerIndexes["LoR DPMO"] = j;
          orderedHeaderNames.push("LoR DPMO");
        }
        else if (headerTextLower === "pod") {
          headerIndexes["POD"] = j;
          orderedHeaderNames.push("POD");
        }
        else if (headerTextLower === "cc") {
          headerIndexes["CC"] = j;
          orderedHeaderNames.push("CC");
        }
        else if (headerTextLower === "ce") {
          headerIndexes["CE"] = j;
          orderedHeaderNames.push("CE");
        }
        else if (headerTextLower === "dex") {
          headerIndexes["DEX"] = j;
          orderedHeaderNames.push("DEX");
        }
        else if (headerTextLower === "cdf") {
          headerIndexes["CDF"] = j;
          orderedHeaderNames.push("CDF");
        }
        // If it's not a special case but not already the Transporter ID
        else if (j !== transporterIdIndex) {
          headerIndexes[headerText] = j;
          orderedHeaderNames.push(headerText);
        }
      }
      
      // Make sure we found at least Transporter ID
      if (headerIndexes["Transporter ID"] !== undefined) {
        console.log("Found header row with these columns in order:", orderedHeaderNames);
        return { headerRow: row, headerRowIndex: i, headerIndexes };
      }
    }
  }
  
  // If no clear header row found, try a more flexible approach with common column names
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowItems = row.map(item => item.str?.trim() || "");
    const rowText = rowItems.join(' ');
    
    console.log(`Checking row ${i} for flexible header: ${rowText}`);
    
    // Look for a row with several column headers that might be a table header
    if (row.length >= 4 && (
        rowItems.some(item => item.toLowerCase().includes("transporter")) || 
        rowItems.some(item => item.toLowerCase() === "id") || 
        rowItems.some(item => item.toLowerCase() === "driver") || 
        rowItems.some(item => item.toLowerCase() === "dcr") || 
        rowItems.some(item => item.toLowerCase().includes("dpmo")) ||
        rowItems.some(item => item.toLowerCase().includes("lor")) ||
        rowItems.some(item => item.toLowerCase().includes("cdf"))
    )) {
      
      console.log("Found potential header row:", rowItems.join(", "));
      
      // Estimate column positions based on common headers
      const headerIndexes: Record<string, number> = {};
      const orderedHeaderNames: string[] = [];
      
      // First column is typically Transporter ID
      const firstColIndex = rowItems.findIndex(item => 
        item.toLowerCase() === "transporter id" || 
        item.toLowerCase() === "id" || 
        item.toLowerCase() === "transporter"
      );
      
      if (firstColIndex !== -1) {
        headerIndexes["Transporter ID"] = firstColIndex;
      } else {
        headerIndexes["Transporter ID"] = 0; // Default to first column
      }
      
      // Map specific column names based on their exact texts
      for (let j = 0; j < rowItems.length; j++) {
        const text = rowItems[j].toLowerCase();
        
        if (text === "delivered") {
          headerIndexes["Delivered"] = j;
          orderedHeaderNames.push("Delivered");
        }
        else if (text === "dcr") {
          headerIndexes["DCR"] = j;
          orderedHeaderNames.push("DCR");
        }
        else if (text === "dnr dpmo" || text.includes("dnr")) {
          headerIndexes["DNR DPMO"] = j;
          orderedHeaderNames.push("DNR DPMO");
        }
        else if (text === "lor dpmo" || text.includes("lor")) {
          headerIndexes["LoR DPMO"] = j;
          orderedHeaderNames.push("LoR DPMO");
        }
        else if (text === "pod") {
          headerIndexes["POD"] = j;
          orderedHeaderNames.push("POD");
        }
        else if (text === "cc") {
          headerIndexes["CC"] = j;
          orderedHeaderNames.push("CC");
        }
        else if (text === "ce") {
          headerIndexes["CE"] = j;
          orderedHeaderNames.push("CE");
        }
        else if (text === "dex") {
          headerIndexes["DEX"] = j;
          orderedHeaderNames.push("DEX");
        }
        else if (text === "cdf") {
          headerIndexes["CDF"] = j;
          orderedHeaderNames.push("CDF");
        }
        // Keep any other column names that aren't Transporter ID
        else if (text !== "transporter id" && text !== "id" && text !== "transporter" && rowItems[j]) {
          headerIndexes[rowItems[j]] = j;
          orderedHeaderNames.push(rowItems[j]);
        }
      }
      
      // If we identified at least 3 columns total, consider this a valid header row
      if (Object.keys(headerIndexes).length >= 3) {
        console.log("Found flexible header with these columns in order:", orderedHeaderNames);
        return { headerRow: row, headerRowIndex: i, headerIndexes };
      }
    }
  }
  
  // If still no header found, look for a row with "ID" in the first column and numbers in other columns
  for (let i = 0; i < rows.length - 1; i++) {
    const row = rows[i];
    const nextRow = rows[i + 1];
    
    // Check if this looks like a header row
    const firstCellText = (row[0]?.str || "").trim().toLowerCase();
    if (firstCellText.includes("id") || firstCellText.includes("transporter")) {
      console.log(`Checking potential implicit header row ${i}: ${row.map(cell => cell.str || "").join(", ")}`);
      
      // Check if next row starts with a value matching driver ID pattern
      // and has numeric values in other cells
      const potentialDriverId = (nextRow[0]?.str || "").trim();
      const hasNumericValues = nextRow.slice(1).some(cell => 
         isNumeric((cell.str || "").trim())
      );
      
      if (potentialDriverId.startsWith('A') && hasNumericValues) {
        console.log("Found implicit header row with ID column");
        
        // Infer header columns from positions
        const headerIndexes: Record<string, number> = {
          "Transporter ID": 0
        };
        const orderedHeaderNames: string[] = [];
        
        // Map columns based on their position and content
        for (let j = 0; j < row.length; j++) {
          const cellText = (row[j]?.str || "").trim().toLowerCase();
          
          if (cellText === "delivered" || j === 1) {
            headerIndexes["Delivered"] = j;
            orderedHeaderNames.push("Delivered");
          }
          else if (cellText === "dcr" || j === 2) {
            headerIndexes["DCR"] = j;
            orderedHeaderNames.push("DCR");
          }
          else if (cellText.includes("dnr") || cellText.includes("dpmo") || j === 3) {
            headerIndexes["DNR DPMO"] = j;
            orderedHeaderNames.push("DNR DPMO");
          }
          else if (cellText.includes("lor") || j === 4) {
            headerIndexes["LoR DPMO"] = j;
            orderedHeaderNames.push("LoR DPMO");
          }
          else if (cellText === "pod" || j === 5) {
            headerIndexes["POD"] = j;
            orderedHeaderNames.push("POD");
          }
          else if (cellText === "cc" || j === 6) {
            headerIndexes["CC"] = j;
            orderedHeaderNames.push("CC");
          }
          else if (cellText === "ce" || j === 7) {
            headerIndexes["CE"] = j;
            orderedHeaderNames.push("CE");
          }
          else if (cellText === "cdf" || j === 8) {
            headerIndexes["CDF"] = j;
            orderedHeaderNames.push("CDF");
          }
          else if (cellText === "dex" || j === 9) {
            headerIndexes["DEX"] = j;
            orderedHeaderNames.push("DEX");
          }
          else if (cellText && !cellText.includes("transporter") && cellText !== "id") {
            headerIndexes[row[j].str.trim()] = j;
            orderedHeaderNames.push(row[j].str.trim());
          }
        }
        
        console.log("Inferred header indexes in order:", orderedHeaderNames);
        return { headerRow: row, headerRowIndex: i, headerIndexes };
      }
    }
  }
  
  // Final fallback: Look for a row with expected number of columns where first column might contain "transporter" or "id"
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // We need at least 5 columns to be a potential header row
    if (row.length < 5) continue;
    
    const firstCell = (row[0]?.str || "").trim().toLowerCase();
    
    if (firstCell.includes("id") || 
        firstCell.includes("transporter") || 
        firstCell.includes("fahrer")) {
      
      console.log(`Found potential header row by column count: ${row.map(cell => cell.str || "").join(", ")}`);
      
      // Infer the header structure
      const headerIndexes: Record<string, number> = {
        "Transporter ID": 0,
        "Delivered": 1,
        "DCR": 2,
        "DNR DPMO": 3
      };
      
      // Add additional columns based on expected layout
      if (row.length > 4) headerIndexes["LoR DPMO"] = 4;
      if (row.length > 5) headerIndexes["POD"] = 5;
      if (row.length > 6) headerIndexes["CC"] = 6;
      if (row.length > 7) headerIndexes["CE"] = 7;
      if (row.length > 8) headerIndexes["CDF"] = 8;
      if (row.length > 9) headerIndexes["DEX"] = 9;
      
      // Get the ordered header names
      const orderedHeaderNames = Object.keys(headerIndexes)
        .filter(key => key !== "Transporter ID")
        .sort((a, b) => headerIndexes[a] - headerIndexes[b]);
      
      console.log("Created default header mapping:", orderedHeaderNames);
      return { headerRow: row, headerRowIndex: i, headerIndexes };
    }
  }
  
  console.log("No header row found matching expected patterns");
  return null;
}

/**
 * Detect if a row is likely to be a driver data row (contains driver ID and numeric values)
 */
export function isDriverDataRow(row: any[]): boolean {
  if (row.length < 3) return false;
  
  // Check if first column looks like a driver ID (starts with 'A' followed by alphanumeric chars)
  const firstColumn = (row[0]?.str || "").trim();
  if (!firstColumn.startsWith('A')) return false;
  
  // Check if at least some other cells contain numeric values
  const hasNumericValues = row.slice(1).some(cell => {
    const cellText = (cell?.str || "").trim();
    return isNumeric(cellText);
  });
  
  return hasNumericValues;
}
