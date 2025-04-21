
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
      
      // Look for any header column names dynamically and preserve their order
      const orderedHeaderNames: string[] = [];
      
      for (let j = 0; j < row.length; j++) {
        const headerText = (row[j].str || "").trim().toLowerCase();
        
        // Generischer Ansatz: Für jede Zelle prüfen, ob sie einem Header entspricht
        if (headerText) {
          // Wenn exakte Übereinstimmung, verwenden wir den originalen String
          const originalText = row[j].str.trim();
          // Spezialfall: ID ist bereits als Transporter ID erfasst
          if (headerText !== "id" && headerText !== "transporter id" && headerText !== "transporter") {
            headerIndexes[originalText] = j;
            orderedHeaderNames.push(originalText);
            console.log(`Found header column '${originalText}' at index ${j}`);
          }
        }
      }
      
      // Make sure we found at least Transporter ID
      if (headerIndexes["Transporter ID"] !== undefined) {
        console.log("Found header row with these columns in order:", orderedHeaderNames);
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
       item.toLowerCase() === "driver")) {
      
      console.log("Found potential header row:", rowItems.join(", "));
      
      // Estimate column positions based on common headers
      const headerIndexes: Record<string, number> = {};
      const orderedHeaderNames: string[] = [];
      
      // First column is typically Transporter ID
      headerIndexes["Transporter ID"] = 0;
      
      // Look for any column names dynamically and preserve their order
      for (let j = 0; j < row.length; j++) {
        const cell = (row[j].str || "").trim();
        if (cell && cell.toLowerCase() !== "transporter id" && 
            cell.toLowerCase() !== "id" && cell.toLowerCase() !== "transporter") {
          headerIndexes[cell] = j;
          orderedHeaderNames.push(cell);
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
        const orderedHeaderNames: string[] = [];
        
        // Extract column headers from the row itself, if any
        for (let j = 1; j < row.length; j++) {
          const headerText = row[j].str?.trim();
          if (headerText) {
            headerIndexes[headerText] = j;
            orderedHeaderNames.push(headerText);
          }
        }
        
        // If no explicit headers found, generate numeric placeholders
        if (Object.keys(headerIndexes).length <= 1) {
          // Try to infer column names from the next row values
          for (let j = 1; j < nextRow.length; j++) {
            const value = nextRow[j].str?.trim();
            // Use default column names if needed
            const columnName = `Column ${j}`;
            headerIndexes[columnName] = j;
            orderedHeaderNames.push(columnName);
          }
        }
        
        console.log("Inferred header indexes in order:", orderedHeaderNames);
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
