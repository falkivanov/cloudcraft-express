
/**
 * Transforms the raw data using the detected column mapping
 * @param rawData The raw data from Excel
 * @param headerRow The detected header row
 * @param columnMapping The column mapping from headers to columns
 */
export function transformDataWithHeaders(rawData: any[], headerRow: any, columnMapping: Record<string, string>): any[] {
  // Skip header row and filter empty rows
  const startRow = headerRow ? rawData.indexOf(headerRow) + 1 : 1;
  const dataRows = rawData.slice(startRow).filter(row => {
    // Check if row contains essential data
    const firstNameCol = columnMapping['Driver First Name'];
    const lastNameCol = columnMapping['Driver Last Name'];
    const stationCol = columnMapping['Station'];
    
    return (
      // Check if there's a name or station value
      (row[firstNameCol] || row[lastNameCol] || row[stationCol]) &&
      // Make sure it's not an empty header row
      !(typeof row[firstNameCol] === 'string' && row[firstNameCol].toLowerCase().includes('first'))
    );
  });
  
  // Transform the data with correct column names
  return dataRows.map(row => {
    const transformed: Record<string, any> = {};
    
    // For each needed field, get the value from the right column
    Object.entries(columnMapping).forEach(([field, col]) => {
      transformed[field] = row[col];
    });
    
    return transformed;
  });
}
