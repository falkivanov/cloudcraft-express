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
    const rowText = rowItems.join(' ').toLowerCase();
    
    // Look specifically for "Transporter ID" as the first column header
    const transporterIdIndex = rowItems.findIndex(item => 
      (item || "").toLowerCase() === "transporter id" || 
      (item || "").toLowerCase() === "transporter" || 
      (item || "").toLowerCase() === "id"
    );
    
    if (transporterIdIndex !== -1) {
      console.log("Found header row with Transporter ID at index " + transporterIdIndex);
      
      // Map column positions to header names
      const headerIndexes: Record<string, number> = {};
      headerIndexes["Transporter ID"] = transporterIdIndex;
      
      // Look for other header columns, including optional LoR DPMO
      for (let j = 0; j < row.length; j++) {
        const headerText = (row[j].str || "").trim().toLowerCase();
        
        if (headerText === "delivered" || headerText.includes("delivered")) {
          headerIndexes["Delivered"] = j;
        } else if (headerText === "dcr" || headerText.includes("dcr")) {
          headerIndexes["DCR"] = j;
        } else if (headerText === "dnr dpmo" || headerText.includes("dnr dpmo")) {
          headerIndexes["DNR DPMO"] = j;
        } else if (headerText === "lor dpmo" || headerText.includes("lor dpmo")) {
          headerIndexes["LoR DPMO"] = j; // Mark LoR DPMO column but don't process it
        } else if (headerText === "pod" || headerText.includes("pod")) {
          headerIndexes["POD"] = j;
        } else if (headerText === "cc" || headerText.includes("contact comp")) {
          headerIndexes["CC"] = j;
        } else if (headerText === "ce" || headerText.includes("customer esc")) {
          headerIndexes["CE"] = j;
        } else if (headerText === "dex" || headerText.includes("dex")) {
          headerIndexes["DEX"] = j;
        }
      }
      
      // Make sure we found at least Transporter ID
      if (headerIndexes["Transporter ID"] !== undefined) {
        console.log("Found header row with these columns:", headerIndexes);
        return { headerRow: row, headerRowIndex: i, headerIndexes };
      }
    }
  }
  
  // If no clear header row found, try a more flexible approach
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowItems = row.map(item => item.str?.trim() || "");
    
    // Look for a row with several short column headers that might be a table header
    if (row.length >= 4 && rowItems.some(item => 
       item.toLowerCase().includes("transporter") || 
       item.toLowerCase() === "id" || 
       item.toLowerCase() === "driver" ||
       item.toLowerCase() === "dcr" ||
       item.toLowerCase() === "delivered") &&
       row.every(item => (item.str || "").length < 15)) {
      
      console.log("Found potential header row:", rowItems.join(", "));
      
      // Estimate column positions based on common headers
      const headerIndexes: Record<string, number> = {};
      
      // First column is typically Transporter ID
      headerIndexes["Transporter ID"] = 0;
      
      // Look for common metric names in the row
      for (let j = 0; j < row.length; j++) {
        const cell = (row[j].str || "").trim().toLowerCase();
        
        if (cell === "delivered" || cell.includes("delivered")) {
          headerIndexes["Delivered"] = j;
        } else if (cell === "dcr" || cell.includes("dcr")) {
          headerIndexes["DCR"] = j;
        } else if (cell.includes("dpmo") || cell === "dnr" || cell.includes("dnr")) {
          headerIndexes["DNR DPMO"] = j;
        } else if (cell === "pod" || cell.includes("pod")) {
          headerIndexes["POD"] = j;
        } else if (cell === "cc" || cell.includes("contact")) {
          headerIndexes["CC"] = j;
        } else if (cell === "ce" || cell.includes("esc")) {
          headerIndexes["CE"] = j;
        } else if (cell === "dex" || cell.includes("dex")) {
          headerIndexes["DEX"] = j;
        }
      }
      
      // If we identified at least 3 metric columns, consider this a valid header row
      if (Object.keys(headerIndexes).length >= 3) {
        console.log("Found flexible header with these columns:", headerIndexes);
        return { headerRow: row, headerRowIndex: i, headerIndexes };
      }
    }
  }
  
  // If still no header found, look for a row with "ID" in the first column and numbers in other columns
  for (let i = 0; i < rows.length - 1; i++) {
    const row = rows[i];
    const nextRow = rows[i + 1];
    
    if (row.length > 0 && 
        (row[0].str || "").toLowerCase().includes("id") && 
        nextRow.length > 3) {
      
      // Check if next row starts with a value matching driver ID pattern
      // and has numeric values in other cells
      const potentialDriverId = (nextRow[0].str || "").trim();
      const hasNumericValues = nextRow.slice(1).some(cell => 
         isNumeric((cell.str || "").trim())
      );
      
      if (potentialDriverId.startsWith('A') && hasNumericValues) {
        console.log("Found implicit header row with ID column");
        
        // Infer header columns from positions
        const headerIndexes: Record<string, number> = {
          "Transporter ID": 0
        };
        
        // Assign standard metric columns based on position
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        for (let j = 1; j < Math.min(row.length, metricNames.length + 1); j++) {
          headerIndexes[metricNames[j-1]] = j;
        }
        
        console.log("Inferred header indexes:", headerIndexes);
        return { headerRow: row, headerRowIndex: i, headerIndexes };
      }
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
