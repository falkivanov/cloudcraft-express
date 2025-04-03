
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
      )) ||
      // Format 5: Deutsch-spezifische Bezeichnungen
      (row['K'] && typeof row['K'] === 'string' && row['K'].includes('Fahrten')) ||
      (row['L'] && typeof row['L'] === 'string' && row['L'].includes('Km')) ||
      (row['M'] && typeof row['M'] === 'string' && row['M'].includes('Stunden')) ||
      (row['N'] && typeof row['N'] === 'string' && row['N'].includes('Beschl')) ||
      (row['O'] && typeof row['O'] === 'string' && row['O'].includes('Bremsen')) ||
      (row['P'] && typeof row['P'] === 'string' && row['P'].includes('Kurven')) ||
      (row['V'] && typeof row['V'] === 'string' && row['V'].includes('Tempo'))
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
    columnMapping['Total Trips'] = 'K';        // Fahrten
    columnMapping['Total Driver km'] = 'L';    // Km
    columnMapping['Total Hours'] = 'M';        // Stunden
    columnMapping['Overall Rating'] = 'C';     // Overall Score or Rating
    columnMapping['Acceleration'] = 'N';       // Beschl.
    columnMapping['Braking'] = 'O';            // Bremsen
    columnMapping['Cornering'] = 'P';          // Kurven
    columnMapping['Speeding'] = 'V';           // Tempo
    columnMapping['Seatbelt'] = 'Q';           // Seatbelt
    columnMapping['Following Distance'] = 'S'; // Following Distance
    columnMapping['Phone Distraction'] = 'R';  // Distraction
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
      // Metriken-Zuordnung: WICHTIG - bei der Standard-Mentor-Datei enthält jede Metrik sowohl ein "Rating" als auch einen direkten Wert
      // Wir wollen den direkten Wert, nicht das Rating (Rating ist eine Zahl, Wert ist "Low Risk", "Medium Risk", etc.)
      else if (lowerValue === 'acceleration' || lowerValue === 'beschl.' || lowerValue === 'beschl') {
        columnMapping['Acceleration'] = col;
      }
      else if (lowerValue === 'braking' || lowerValue === 'bremsen') {
        columnMapping['Braking'] = col;
      }
      else if (lowerValue === 'cornering' || lowerValue === 'kurven') {
        columnMapping['Cornering'] = col;
      }
      else if (lowerValue === 'speeding' || lowerValue === 'tempo') {
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
  
  // Explicitly map German headers if they exist in the header row
  if (headerRow) {
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
  
  // Fallback-Werte für nicht gefundene Spalten - angepasst an die tatsächliche Struktur der Datei
  if (!columnMapping['Driver First Name']) columnMapping['Driver First Name'] = 'A';
  if (!columnMapping['Driver Last Name']) columnMapping['Driver Last Name'] = 'B';
  if (!columnMapping['Overall Rating']) columnMapping['Overall Rating'] = 'C';
  if (!columnMapping['Station']) columnMapping['Station'] = 'D';
  
  // German Excel format specific fallbacks
  if (!columnMapping['Total Trips']) columnMapping['Total Trips'] = 'K';
  if (!columnMapping['Total Driver km']) columnMapping['Total Driver km'] = 'L';
  if (!columnMapping['Total Hours']) columnMapping['Total Hours'] = 'M';
  
  // Updated risk columns based on image provided - Specifically for German Excel format
  if (!columnMapping['Acceleration']) columnMapping['Acceleration'] = 'N';  // Beschl
  if (!columnMapping['Braking']) columnMapping['Braking'] = 'O';  // Bremsen
  if (!columnMapping['Cornering']) columnMapping['Cornering'] = 'P';  // Kurven
  if (!columnMapping['Speeding']) columnMapping['Speeding'] = 'V';  // Tempo
  
  console.log("Spaltenzuordnung:", columnMapping);
  return columnMapping;
}
