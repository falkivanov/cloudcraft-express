
import { cleanNumericValue } from "@/components/quality/scorecard/utils/parser/extractors/driver/dsp-weekly/numericExtractor";
import { MentorDriverData } from "./types";

/**
 * Transforms the raw data using the detected column mapping
 * @param rawData The raw data from Excel
 * @param headerRow The detected header row
 * @param columnMapping The column mapping from headers to columns
 */
export function transformDataWithHeaders(rawData: any[], headerRow: any, columnMapping: Record<string, string>): any[] {
  // Header-Zeile überspringen und leere Zeilen filtern
  const startRow = headerRow ? rawData.indexOf(headerRow) + 1 : 1;
  const dataRows = rawData.slice(startRow).filter(row => {
    // Überprüfe, ob die Zeile wesentliche Daten enthält
    const firstNameCol = columnMapping['Driver First Name'];
    const lastNameCol = columnMapping['Driver Last Name'];
    const stationCol = columnMapping['Station'];
    
    return (
      // Prüfe, ob Name oder Stationswert vorhanden ist
      (row[firstNameCol] || row[lastNameCol] || row[stationCol]) &&
      // Stelle sicher, dass es keine leere Header-Zeile ist
      !(typeof row[firstNameCol] === 'string' && row[firstNameCol].toLowerCase().includes('first'))
    );
  });
  
  // Transformiere die Daten mit den richtigen Spaltennamen
  return dataRows.map(row => {
    const transformed: Record<string, any> = {};
    
    // Für jedes benötigte Feld, hole den Wert aus der richtigen Spalte
    Object.entries(columnMapping).forEach(([field, col]) => {
      transformed[field] = row[col];
    });
    
    return transformed;
  });
}

/**
 * Converts raw transformed data to structured driver data
 * @param transformedData The transformed data with proper column names
 */
export function convertToDriverData(transformedData: any[]): MentorDriverData[] {
  return transformedData.map(row => {
    // Extrahiere Name auf intelligente Weise
    let firstName = row['Driver First Name'] || '';
    let lastName = row['Driver Last Name'] || '';
    
    // Falls der Name in einer Spalte eine Zahl enthält (Fahrer-ID), versuche den Namen aus nachfolgenden Spalten zu extrahieren
    if (/^\d+$/.test(firstName.toString())) {
      // Wenn erster Name eine Zahl ist, dann ist es wahrscheinlich eine ID
      // Versuche den Namen aus anderem Feld zu extrahieren
      firstName = row['B'] || row['C'] || '';
    }
    
    // Stationsformat bereinigen
    let station = row['Station'] || '';
    if (!station && row['D']) {
      station = row['D'];
    }
    
    // String-Typumwandlung sicherstellen
    firstName = String(firstName).trim();
    lastName = String(lastName).trim();
    station = String(station).trim();
    
    // Standardisiere "UNASSIGNED" Werte
    if (station.toUpperCase().includes('UNASSIGNED')) {
      station = 'UNASSIGNED';
    }
    
    // Nummerische Werte bereinigen und konvertieren
    const totalTrips = cleanNumericValue(String(row['Total Trips'] || 0));
    
    // Behandle Total Hours als String oder Nummer
    let totalHours = row['Total Hours'] || 0;
    if (typeof totalHours === 'string') {
      totalHours = cleanNumericValue(totalHours);
    }
    
    return {
      firstName,
      lastName,
      station,
      totalTrips,
      totalHours,
      totalKm: 0, // Diese Information ist in der Excel nicht vorhanden
      overallRating: String(row['Overall Rating'] || ''),
      acceleration: String(row['Acceleration'] || ''),
      braking: String(row['Braking'] || ''),
      cornering: String(row['Cornering'] || ''),
      speeding: String(row['Speeding'] || ''),
      seatbelt: String(row['Seatbelt'] || ''),
      following: String(row['Following Distance'] || ''),
      distraction: String(row['Phone Distraction'] || '')
    };
  });
}

/**
 * Filters out invalid driver records
 * @param drivers The array of driver data
 */
export function filterValidDrivers(drivers: MentorDriverData[]): MentorDriverData[] {
  // Fahrer mit leeren Namen oder offensichtlichen Headern herausfiltern
  return drivers.filter(driver => {
    const isValid = 
      driver.firstName && 
      driver.lastName && 
      !driver.firstName.toLowerCase().includes('first') &&
      !driver.lastName.toLowerCase().includes('last');
    
    return isValid;
  });
}
