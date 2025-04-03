
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
    
    // Driver name mapping - Critical for anonymized ID preservation
    // Always map A and B columns directly regardless of header text
    if (col === 'A') {
      columnMapping['Driver First Name'] = 'A';
    } 
    else if (col === 'B') {
      columnMapping['Driver Last Name'] = 'B';
    }
    // Also try to map by header text as fallback
    else if (lowerValue.includes('first') || (lowerValue.includes('driver') && !lowerValue.includes('last'))) {
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
  // CRITICAL: Always ensure A and B are mapped to first and last name
  // to preserve the anonymized IDs
  columnMapping['Driver First Name'] = 'A';
  columnMapping['Driver Last Name'] = 'B';
  
  // Ensure other fallbacks are also set
  if (!columnMapping['Overall Rating']) columnMapping['Overall Rating'] = 'C';
  if (!columnMapping['Station']) columnMapping['Station'] = 'D';
  
  // Explicit numeric column mappings
  if (!columnMapping['Total Trips']) columnMapping['Total Trips'] = 'E'; // Column E for Trips
  if (!columnMapping['Total Driver km']) columnMapping['Total Driver km'] = 'F'; // Column F for KM
  if (!columnMapping['Total Hours']) columnMapping['Total Hours'] = 'G'; // Column G for Hours
  
  // DIRECT TARGETING OF RISK COLUMNS - using the specific columns requested by user
  // Map these columns directly regardless of header detection
  columnMapping['Acceleration'] = 'H';  // Column H - ALWAYS use column H for Acceleration
  columnMapping['Braking'] = 'J';       // Column J - ALWAYS use column J for Braking
  columnMapping['Cornering'] = 'L';     // Column L - ALWAYS use column L for Cornering
  columnMapping['Speeding'] = 'N';      // Column N - ALWAYS use column N for Speeding
  columnMapping['Seatbelt'] = 'V';      // Column V - ALWAYS use column V for Seatbelt
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
  
  console.log("Final column mapping:", columnMapping);
  return columnMapping;
}
