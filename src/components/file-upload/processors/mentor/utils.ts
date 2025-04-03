
import { MentorDriverData, MentorReport, WeekInfo } from "./types";

/**
 * Extrakt Datum und Wocheninformationen aus dem Dateinamen
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
  
  // Überspringe Headerzeilen (in der Regel die ersten 1-2 Zeilen)
  const validRows = rawData.filter(row => {
    // Filtere Zeilen ohne Namen oder echte Daten aus
    const hasName = row['Driver First Name'] && 
                   typeof row['Driver First Name'] === 'string' && 
                   row['Driver First Name'].trim() !== '';
    
    // Prüfe zusätzlich, ob es sich um eine Datenzeile handelt
    const isDataRow = hasName && 
                     (row['Station'] || row['Total Trips'] || 
                      row['Total Hours'] || row['Driver Last Name']);
    
    return isDataRow;
  });
  
  console.info(`Verarbeite ${validRows.length} gültige Zeilen aus ${rawData.length} Gesamtzeilen`);
  
  // Extrahiere die benötigten Daten aus den validen Zeilen
  const drivers: MentorDriverData[] = validRows.map(row => {
    return {
      firstName: row['Driver First Name'] || '',
      lastName: row['Driver Last Name'] || '',
      station: row['Station'] || '',
      totalTrips: row['Total Trips'] || 0,
      totalHours: row['Total Hours'] || 0,
      overallRating: row['Overall Rating'] || '',
      acceleration: row['Acceleration'] || '',
      braking: row['Braking'] || '',
      cornering: row['Cornering'] || '',
      speeding: row['Speeding'] || '',
      seatbelt: row['Seatbelt'] || '',
      following: row['Following Distance'] || '',
      distraction: row['Phone Distraction'] || ''
    };
  });
  
  return {
    weekNumber: weekInfo.weekNumber,
    year: weekInfo.year,
    fileName: '',
    reportDate: weekInfo.reportDate.toISOString(),
    drivers
  };
}
