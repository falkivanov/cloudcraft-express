
import { MentorDriverData, MentorReport, WeekInfo } from "../types";
import { cleanNumericValue } from "@/components/quality/scorecard/utils/parser/extractors/driver/dsp-weekly/numericExtractor";

/**
 * Verarbeitet die Rohdaten aus der Excel-Datei
 */
export function processMentorData(rawData: any[], weekInfo: WeekInfo): MentorReport {
  console.info(`Verarbeite ${rawData.length} Zeilen aus der Excel-Datei`);
  
  // Extrahiere die benötigten Daten aus den Zeilen
  const drivers: MentorDriverData[] = rawData.map(row => {
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
  
  // Fahrer mit leeren Namen oder offensichtlichen Headern herausfiltern
  const validDrivers = drivers.filter(driver => {
    const isValid = 
      driver.firstName && 
      driver.lastName && 
      !driver.firstName.toLowerCase().includes('first') &&
      !driver.lastName.toLowerCase().includes('last');
    
    return isValid;
  });
  
  console.log(`Gefilterte Fahrerdaten: ${validDrivers.length} gültige Fahrer aus ${drivers.length} Gesamteinträgen`);
  
  return {
    weekNumber: weekInfo.weekNumber,
    year: weekInfo.year,
    fileName: '',
    reportDate: weekInfo.reportDate.toISOString(),
    drivers: validDrivers
  };
}
