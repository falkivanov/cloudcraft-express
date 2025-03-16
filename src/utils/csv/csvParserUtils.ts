
/**
 * Utility functions for parsing CSV files
 */

/**
 * Parses a CSV string into rows and columns while respecting quoted values
 * @param csvContent The CSV content as a string
 * @returns An array of arrays where each inner array represents a row of data
 */
export const parseCSVContent = (csvContent: string): string[][] => {
  if (!csvContent.trim()) {
    return [];
  }
  
  // Split into rows
  const rows = csvContent.split('\n');
  const parsedRows: string[][] = [];
  
  // Parse each row
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i].trim()) continue; // Skip empty rows
    
    // Split by comma but respect quoted values
    let rowData: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < rows[i].length; j++) {
      const char = rows[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        rowData.push(currentValue.replace(/"/g, '').trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    if (currentValue) {
      rowData.push(currentValue.replace(/"/g, '').trim());
    }
    
    parsedRows.push(rowData);
  }
  
  return parsedRows;
};

/**
 * Extracts headers from CSV content
 * @param csvContent The CSV content as a string
 * @returns An array of header strings
 */
export const extractCSVHeaders = (csvContent: string): string[] => {
  const rows = parseCSVContent(csvContent);
  if (rows.length === 0) {
    return [];
  }
  
  // First row is headers
  return rows[0].map(header => header.trim());
};

/**
 * Gets the index of a column based on partial header name match
 * @param headers The array of header strings
 * @param headerName The partial or full name of the header to find
 * @returns The index of the matching header or -1 if not found
 */
export const getColumnIndex = (headers: string[], headerName: string): number => {
  return headers.findIndex(h => h.includes(headerName));
};

/**
 * Validates if all required fields are present in the CSV headers
 * @param headers The array of header strings
 * @param requiredFields Array of required field names
 * @returns Boolean indicating if all required fields are present
 */
export const validateCSVHeaders = (headers: string[], requiredFields: string[]): boolean => {
  return requiredFields.every(field => 
    headers.some(header => header.includes(field))
  );
};
