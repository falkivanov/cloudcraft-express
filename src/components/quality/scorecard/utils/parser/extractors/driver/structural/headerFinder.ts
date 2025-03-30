
/**
 * Functions for finding and processing the header row in tabular data
 */

/**
 * Find the header row that contains the expected column headers
 */
export function findHeaderRow(rows: any[][], expectedHeaders: string[]): { headerRow: any[], headerRowIndex: number, headerIndexes: Record<string, number> } | null {
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
