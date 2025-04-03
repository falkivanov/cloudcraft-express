
/**
 * Column mapping utilities for Mentor Excel files
 */

/**
 * Maps standard English column names
 * @param headerRow The detected header row
 * @param columnMapping The existing column mapping to fill
 */
function mapEnglishHeaders(headerRow: any, columnMapping: Record<string, string>): void {
  if (!headerRow) return;
  
  Object.entries(headerRow).forEach(([col, value]) => {
    if (typeof value !== 'string') return;
    
    const lowerValue = value.toLowerCase();
    
    // Driver name mapping
    if (lowerValue.includes('first') || (lowerValue.includes('driver') && !lowerValue.includes('last'))) {
      columnMapping['Driver First Name'] = col;
    } 
    else if (lowerValue.includes('last name')) {
      columnMapping['Driver Last Name'] = col;
    }
    // FICO Score mapping
    else if (lowerValue.includes('fico') || lowerValue.includes('score') || lowerValue.includes('gesamt')) {
      columnMapping['Overall Rating'] = col;
    }
    // Station mapping
    else if (lowerValue.includes('station')) {
      columnMapping['Station'] = col;
    }
    // Trips mapping
    else if ((lowerValue.includes('total') && lowerValue.includes('trip')) ||
              lowerValue === 'trips') {
      columnMapping['Total Trips'] = col;
    }
    // KM mapping - Improved detection
    else if ((lowerValue.includes('total') && (lowerValue.includes('km') || lowerValue.includes('driver km'))) || 
              lowerValue.includes('kilometers') ||
              lowerValue.includes('distance') ||
              lowerValue === 'km') {
      columnMapping['Total Driver km'] = col;
    }
    // Hours mapping
    else if ((lowerValue.includes('total') && lowerValue.includes('hour')) ||
             lowerValue === 'hours') {
      columnMapping['Total Hours'] = col;
    }
    // Metrics mapping - We want the direct value, not the rating
    else if (lowerValue === 'acceleration') {
      columnMapping['Acceleration'] = col;
    }
    else if (lowerValue === 'braking') {
      columnMapping['Braking'] = col;
    }
    else if (lowerValue === 'cornering') {
      columnMapping['Cornering'] = col;
    }
    else if (lowerValue === 'speeding') {
      columnMapping['Speeding'] = col;
    }
    else if (lowerValue.includes('seatbelt')) {
      columnMapping['Seatbelt'] = col;
    }
    else if (lowerValue.includes('following')) {
      columnMapping['Following Distance'] = col;
    }
    else if (lowerValue.includes('distraction') || lowerValue.includes('phone')) {
      columnMapping['Phone Distraction'] = col;
    }
  });
}

/**
 * Maps German-specific column headers
 * @param headerRow The detected header row
 * @param columnMapping The existing column mapping to fill
 */
function mapGermanHeaders(headerRow: any, columnMapping: Record<string, string>): void {
  if (!headerRow) return;
  
  Object.entries(headerRow).forEach(([col, value]) => {
    if (typeof value !== 'string') return;
    
    const lowerValue = value.toLowerCase();
    
    // German-specific column mappings with exact matches
    if (lowerValue === 'beschl.' || lowerValue === 'beschl') {
      columnMapping['Acceleration'] = col;
    } 
    else if (lowerValue === 'bremsen') {
      columnMapping['Braking'] = col;
    }
    else if (lowerValue === 'kurven') {
      columnMapping['Cornering'] = col;
    }
    else if (lowerValue === 'tempo') {
      columnMapping['Speeding'] = col;
    }
    else if (lowerValue === 'fahrten') {
      columnMapping['Total Trips'] = col;
    }
    else if (lowerValue === 'km') {
      columnMapping['Total Driver km'] = col;
    }
    else if (lowerValue === 'stunden') {
      columnMapping['Total Hours'] = col;
    }
  });
}

/**
 * Sets fallback column mappings for any missing columns
 * @param columnMapping The column mapping to fill with fallbacks
 */
function setFallbackMappings(columnMapping: Record<string, string>): void {
  // Fallback values for columns not found - adapted to the actual structure of the file
  if (!columnMapping['Driver First Name']) columnMapping['Driver First Name'] = 'A';
  if (!columnMapping['Driver Last Name']) columnMapping['Driver Last Name'] = 'B';
  if (!columnMapping['Overall Rating']) columnMapping['Overall Rating'] = 'C';
  if (!columnMapping['Station']) columnMapping['Station'] = 'D';
  
  // German Excel format specific fallbacks
  if (!columnMapping['Total Trips']) columnMapping['Total Trips'] = 'K';
  if (!columnMapping['Total Driver km']) columnMapping['Total Driver km'] = 'L';
  if (!columnMapping['Total Hours']) columnMapping['Total Hours'] = 'M';
  
  // Risk columns fallbacks based on image provided - Specifically for German Excel format
  if (!columnMapping['Acceleration']) columnMapping['Acceleration'] = 'N';  // Beschl
  if (!columnMapping['Braking']) columnMapping['Braking'] = 'O';  // Bremsen
  if (!columnMapping['Cornering']) columnMapping['Cornering'] = 'P';  // Kurven
  if (!columnMapping['Speeding']) columnMapping['Speeding'] = 'V';  // Tempo
}

/**
 * Creates a mapping between column letters and their semantic meaning
 * @param headerRow The detected header row
 */
export function createColumnMapping(headerRow: any | null): Record<string, string> {
  const columnMapping: Record<string, string> = {};
  
  // Map English headers first
  mapEnglishHeaders(headerRow, columnMapping);
  
  // Map German headers next (these will override any English mappings if found)
  mapGermanHeaders(headerRow, columnMapping);
  
  // Set fallback values for any unmapped columns
  setFallbackMappings(columnMapping);
  
  console.log("Column mapping:", columnMapping);
  return columnMapping;
}
