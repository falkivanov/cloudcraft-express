
/**
 * Finds the header row in the raw Excel data
 * @param rawData The raw data from Excel
 */
export function findHeaderRow(rawData: any[]): any | null {
  // Search for typical header columns in the first 10 rows
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    
    // Enhanced header detection based on different column formats
    if (
      // Format 1: Columns contain typical header names
      (row['A'] && typeof row['A'] === 'string' && (
        row['A'].includes('First Name') || 
        row['A'].includes('Driver') ||
        row['A'].includes('#')
      )) ||
      // Format 2: Column B contains typical values
      (row['B'] && typeof row['B'] === 'string' && row['B'].includes('Last Name')) ||
      // Format 3: Multiple columns with typical header names
      (row['D'] && typeof row['D'] === 'string' && row['D'].includes('Station')) ||
      // Format 4: Multiple columns for risk values
      (row['I'] && typeof row['I'] === 'string' && (
        row['I'].includes('Beschl') || 
        row['I'].includes('Accel')
      )) ||
      // Format 5: German-specific labels
      (row['K'] && typeof row['K'] === 'string' && row['K'].includes('Fahrten')) ||
      (row['L'] && typeof row['L'] === 'string' && row['L'].includes('Km')) ||
      (row['M'] && typeof row['M'] === 'string' && row['M'].includes('Stunden')) ||
      (row['N'] && typeof row['N'] === 'string' && row['N'].includes('Beschl')) ||
      (row['O'] && typeof row['O'] === 'string' && row['O'].includes('Bremsen')) ||
      (row['P'] && typeof row['P'] === 'string' && row['P'].includes('Kurven')) ||
      (row['V'] && typeof row['V'] === 'string' && row['V'].includes('Tempo'))
    ) {
      console.log(`Header row found in row ${i+1}`, row);
      return row;
    }
  }
  
  // If no clear header row was found, assume standard column designations
  console.warn("No clear header row found, using default column designations");
  return null;
}
