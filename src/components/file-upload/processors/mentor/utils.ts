
import { MentorDriverData, MentorReport, WeekInfo } from "./types";
import { cleanNumericValue } from "@/components/quality/scorecard/utils/parser/extractors/driver/dsp-weekly/numericExtractor";

/**
 * Extrahiert Datum und Wocheninformationen aus dem Dateinamen
 */
export function extractWeekInfo(fileName: string): WeekInfo {
  // Suchen nach Datum im Format YYYY-MM-DD im Dateinamen
  const dateRegex = /(20\d{2})[_\-]?(\d{2})[_\-]?(\d{2})/;
  const dateMatch = fileName.match(dateRegex);
  
  if (dateMatch) {
    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // JavaScript Monate sind 0-basiert
    const day = parseInt(dateMatch[3]);
    
    // Datum aus dem Dateinamen erstellen
    const fileDate = new Date(year, month, day);
    console.info(`Extrahierte Datumsinformationen: Datum=${year}-${month+1}-${day}`);

    // Das Datum im Dateinamen ist der Sonntag VOR der Berichtswoche
    // Die KW des Berichts ist also die KW NACH dem Datum im Dateinamen
    const reportDate = new Date(fileDate);
    reportDate.setDate(reportDate.getDate() + 1); // Ein Tag später = Montag der Berichtswoche
    
    // Kalenderwoche berechnen - für die Berichtswoche (eine Woche später)
    const weekNumber = getWeekNumber(reportDate);
    const reportYear = reportDate.getFullYear();
    
    console.info(`Datum=${year}-${month+1}-${day}, KW${weekNumber}/${reportYear}`);
    
    return {
      date: fileDate,
      reportDate: reportDate,
      weekNumber,
      year: reportYear
    };
  }
  
  // Alternative Extraktion: "KW" im Dateinamen suchen
  const kwRegex = /KW\s*(\d{1,2})[-_\s]?(20\d{2})?/i;
  const kwMatch = fileName.match(kwRegex);
  
  if (kwMatch) {
    const weekNumber = parseInt(kwMatch[1]);
    const year = kwMatch[2] ? parseInt(kwMatch[2]) : new Date().getFullYear();
    
    console.info(`Direkte KW-Extraktion: KW${weekNumber}/${year}`);
    
    // Aktuelles Datum als Reportdate verwenden
    const now = new Date();
    
    return {
      date: now,
      reportDate: now,
      weekNumber,
      year
    };
  }
  
  // Fallback: aktuelle Woche verwenden
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  console.warn("Kein Datum im Dateinamen gefunden, verwende aktuelle Woche");
  
  return {
    date: now,
    reportDate: now,
    weekNumber,
    year: now.getFullYear()
  };
}

/**
 * Berechnet die ISO-Kalenderwoche für ein Datum
 */
function getWeekNumber(date: Date): number {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

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
