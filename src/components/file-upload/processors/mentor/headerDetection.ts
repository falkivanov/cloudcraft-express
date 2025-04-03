
/**
 * Utilities for detecting and mapping headers in Excel files
 */

/**
 * Finds the header row in the raw data
 * @param rawData The raw data from Excel
 */
export function findHeaderRow(rawData: any[]): any | null {
  // Suche nach typischen Header-Spalten in den ersten 10 Zeilen
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    
    // Erweiterte Header-Erkennung basierend auf verschiedenen Spaltenformaten
    if (
      // Format 1: Spalten enthalten typische Header-Namen
      (row['A'] && typeof row['A'] === 'string' && (
        row['A'].includes('First Name') || 
        row['A'].includes('Driver') ||
        row['A'].includes('#')
      )) ||
      // Format 2: Spalten B und D enthalten typische Werte
      (row['B'] && typeof row['B'] === 'string' && row['B'].includes('Last Name')) ||
      // Format 3: Mehrere Spalten mit typischen Header-Namen
      (row['D'] && typeof row['D'] === 'string' && row['D'].includes('Station')) ||
      // Format 4: Mehrere Spalten für Risikowerte
      (row['I'] && typeof row['I'] === 'string' && (
        row['I'].includes('Beschl') || 
        row['I'].includes('Accel')
      ))
    ) {
      console.log(`Header-Zeile gefunden in Zeile ${i+1}`, row);
      return row;
    }
  }
  
  // Wenn keine klare Header-Zeile gefunden wurde, nehmen wir standardmäßige Spaltenbezeichnungen an
  console.warn("Keine klare Header-Zeile gefunden, verwende Standard-Spaltenbezeichnungen");
  return null;
}

/**
 * Creates a mapping between column letters and their semantic meaning
 * @param headerRow The detected header row
 */
export function createColumnMapping(headerRow: any | null): Record<string, string> {
  const columnMapping: Record<string, string> = {};
  
  // Standardmäßige Zuordnung, falls keine Header gefunden wurden
  if (!headerRow) {
    // Basierend auf dem Screenshot der Excel-Datei
    columnMapping['Driver First Name'] = 'A';  // Erste Spalte enthält Fahrernummern oder Namen
    columnMapping['Driver Last Name'] = 'B';   // Last Name
    columnMapping['Station'] = 'D';            // Station
    columnMapping['Total Trips'] = 'E';        // Total Trips
    columnMapping['Total Driver km'] = 'F';    // Total Driver km
    columnMapping['Total Hours'] = 'G';        // Total Hours
    columnMapping['Acceleration'] = 'I';       // Acceleration Rating
    columnMapping['Braking'] = 'K';            // Braking Rating
    columnMapping['Cornering'] = 'M';          // Cornering Rating
    columnMapping['Speeding'] = 'O';           // Speeding
    columnMapping['Seatbelt'] = 'Q';           // Seatbelt
    columnMapping['Following Distance'] = 'S'; // Following Distance
    columnMapping['Phone Distraction'] = 'U';  // Distraction
    columnMapping['Overall Rating'] = 'C';     // Overall Score or Rating
  } else {
    // Für jeden Header nach passenden Spalten suchen
    Object.entries(headerRow).forEach(([col, value]) => {
      if (typeof value !== 'string') return;
      
      const lowerValue = value.toLowerCase();
      
      // Fahrername-Zuordnung
      if (lowerValue.includes('first') || (lowerValue.includes('driver') && !lowerValue.includes('last'))) {
        columnMapping['Driver First Name'] = col;
      } 
      else if (lowerValue.includes('last name')) {
        columnMapping['Driver Last Name'] = col;
      }
      // FICO Score-Zuordnung
      else if (lowerValue.includes('fico') || lowerValue.includes('score') || lowerValue.includes('gesamt')) {
        columnMapping['Overall Rating'] = col;
      }
      // Station-Zuordnung
      else if (lowerValue.includes('station')) {
        columnMapping['Station'] = col;
      }
      // Fahrten-Zuordnung
      else if ((lowerValue.includes('total') && lowerValue.includes('trip')) ||
                lowerValue === 'trips' || lowerValue.includes('fahrten')) {
        columnMapping['Total Trips'] = col;
      }
      // KM-Zuordnung - Verbesserte Erkennung
      else if ((lowerValue.includes('total') && (lowerValue.includes('km') || lowerValue.includes('driver km'))) || 
                lowerValue.includes('kilometers') ||
                lowerValue.includes('distance') ||
                lowerValue === 'km') {
        columnMapping['Total Driver km'] = col;
      }
      // Stunden-Zuordnung
      else if ((lowerValue.includes('total') && lowerValue.includes('hour')) ||
               lowerValue === 'hours' || lowerValue.includes('stunden')) {
        columnMapping['Total Hours'] = col;
      }
      // Metriken-Zuordnung mit deutschen und englischen Begriffen
      else if (lowerValue.includes('acceleration') || lowerValue.includes('beschl')) {
        columnMapping['Acceleration'] = col;
      }
      else if (lowerValue.includes('braking') || lowerValue.includes('bremsen')) {
        columnMapping['Braking'] = col;
      }
      else if (lowerValue.includes('cornering') || lowerValue.includes('kurven')) {
        columnMapping['Cornering'] = col;
      }
      else if (lowerValue.includes('speeding') || lowerValue.includes('tempo')) {
        columnMapping['Speeding'] = col;
      }
      else if (lowerValue.includes('seatbelt') || lowerValue.includes('gurt')) {
        columnMapping['Seatbelt'] = col;
      }
      else if (lowerValue.includes('following') || lowerValue.includes('abstand')) {
        columnMapping['Following Distance'] = col;
      }
      else if (lowerValue.includes('distraction') || lowerValue.includes('phone') || lowerValue.includes('ablenk')) {
        columnMapping['Phone Distraction'] = col;
      }
    });
  }
  
  // Scan all column headers for special German terms
  if (headerRow) {
    Object.entries(headerRow).forEach(([col, value]) => {
      if (typeof value !== 'string') return;
      
      const lowerValue = value.toLowerCase();
      
      // German-specific column mappings
      if (lowerValue === 'beschl.' || lowerValue === 'beschl') {
        columnMapping['Acceleration'] = col;
      } 
      else if (lowerValue === 'bremsen' || lowerValue === 'bremse') {
        columnMapping['Braking'] = col;
      }
      else if (lowerValue === 'kurven' || lowerValue === 'kurve') {
        columnMapping['Cornering'] = col;
      }
      else if (lowerValue === 'ablenk.' || lowerValue === 'ablenk') {
        columnMapping['Phone Distraction'] = col;
      }
    });
  }
  
  // Fallback-Werte für nicht gefundene Spalten
  if (!columnMapping['Driver First Name']) columnMapping['Driver First Name'] = 'A';
  if (!columnMapping['Driver Last Name']) columnMapping['Driver Last Name'] = 'B';
  if (!columnMapping['Overall Rating']) columnMapping['Overall Rating'] = 'C';
  if (!columnMapping['Station']) columnMapping['Station'] = 'D';
  if (!columnMapping['Total Trips']) columnMapping['Total Trips'] = 'E';
  if (!columnMapping['Total Driver km']) columnMapping['Total Driver km'] = 'F';
  if (!columnMapping['Total Hours']) columnMapping['Total Hours'] = 'G';
  
  // Map Risk columns based on image shown (using appropriate positions)
  if (!columnMapping['Acceleration']) columnMapping['Acceleration'] = 'I';
  if (!columnMapping['Braking']) columnMapping['Braking'] = 'J';
  if (!columnMapping['Cornering']) columnMapping['Cornering'] = 'K';
  if (!columnMapping['Phone Distraction']) columnMapping['Phone Distraction'] = 'L';
  
  console.log("Spaltenzuordnung:", columnMapping);
  return columnMapping;
}
