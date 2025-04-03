
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
      (row['D'] && typeof row['D'] === 'string' && row['D'].includes('Station'))
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
    columnMapping['Total Hours'] = 'G';        // Total Hours
    columnMapping['Acceleration'] = 'I';       // Acceleration Rating
    columnMapping['Braking'] = 'K';            // Braking Rating
    columnMapping['Cornering'] = 'M';          // Cornering Rating
    columnMapping['Speeding'] = 'O';           // Speeding
    columnMapping['Seatbelt'] = 'Q';           // Seatbelt
    columnMapping['Following Distance'] = 'S'; // Following Distance
    columnMapping['Phone Distraction'] = 'U';  // Distraction
    columnMapping['Overall Rating'] = 'W';     // Overall Score or Rating
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
      // Station-Zuordnung
      else if (lowerValue.includes('station')) {
        columnMapping['Station'] = col;
      }
      // Fahrten-Zuordnung
      else if (lowerValue.includes('total') && lowerValue.includes('trip')) {
        columnMapping['Total Trips'] = col;
      }
      // Stunden-Zuordnung
      else if (lowerValue.includes('total') && lowerValue.includes('hour')) {
        columnMapping['Total Hours'] = col;
      }
      // Metriken-Zuordnung
      else if (lowerValue.includes('acceleration')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Acceleration'] = col;
        } else {
          columnMapping['Acceleration'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('braking')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Braking'] = col;
        } else {
          columnMapping['Braking'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('cornering')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Cornering'] = col;
        } else {
          columnMapping['Cornering'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('speeding')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Speeding'] = col;
        } else {
          columnMapping['Speeding'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('seatbelt')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Seatbelt'] = col;
        } else {
          columnMapping['Seatbelt'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('following')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Following Distance'] = col;
        } else {
          columnMapping['Following Distance'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('distraction') || lowerValue.includes('phone')) {
        if (lowerValue.includes('rating')) {
          columnMapping['Phone Distraction'] = col;
        } else {
          columnMapping['Phone Distraction'] = String.fromCharCode(col.charCodeAt(0) + 1);
        }
      }
      else if (lowerValue.includes('overall') || lowerValue.includes('fico') || lowerValue.includes('score')) {
        columnMapping['Overall Rating'] = col;
      }
    });
  }
  
  // Fallback-Werte für nicht gefundene Spalten
  if (!columnMapping['Driver First Name']) columnMapping['Driver First Name'] = 'A';
  if (!columnMapping['Driver Last Name']) columnMapping['Driver Last Name'] = 'B';
  if (!columnMapping['Station']) columnMapping['Station'] = 'D';
  if (!columnMapping['Total Trips']) columnMapping['Total Trips'] = 'E';
  if (!columnMapping['Total Hours']) columnMapping['Total Hours'] = 'G';
  if (!columnMapping['Acceleration']) columnMapping['Acceleration'] = 'I';
  if (!columnMapping['Braking']) columnMapping['Braking'] = 'K';
  if (!columnMapping['Cornering']) columnMapping['Cornering'] = 'M';
  if (!columnMapping['Speeding']) columnMapping['Speeding'] = 'O';
  if (!columnMapping['Seatbelt']) columnMapping['Seatbelt'] = 'Q';
  if (!columnMapping['Following Distance']) columnMapping['Following Distance'] = 'S';
  if (!columnMapping['Phone Distraction']) columnMapping['Phone Distraction'] = 'U';
  if (!columnMapping['Overall Rating']) columnMapping['Overall Rating'] = 'W';
  
  console.log("Spaltenzuordnung:", columnMapping);
  return columnMapping;
}
