
import { format, addDays } from "date-fns";
import { WeekInfo, MentorDriverData } from "./types";

/**
 * Extrahiere Wocheninformationen aus dem Dateinamen
 * Format: Driver_Report_YYYY-MM-DD.xlsx (Datum ist immer der Sonntag VOR der berichteten KW)
 */
export function extractWeekInfo(filename: string): WeekInfo {
  // Erwartetes Format: Driver_Report_YYYY-MM-DD.xlsx
  const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1; // JS-Monate sind 0-indiziert
    const day = parseInt(dateMatch[3], 10);
    
    // Das Datum aus dem Dateinamen ist der Sonntag VOR der berichteten KW
    const reportDate = new Date(year, month, day);
    
    // Prüfen, ob das Datum tatsächlich ein Sonntag ist
    if (reportDate.getDay() !== 0) {
      console.warn("Das extrahierte Datum ist kein Sonntag. Die KW-Berechnung könnte ungenau sein.");
    }
    
    // Die KW für den FOLGENDEN Montag nehmen
    // Also: Sonntag + 1 Tag = Montag der berichteten KW
    const mondayDate = addDays(reportDate, 1);
    
    // Die KW für diesen Montag ermitteln
    const weekNumber = getISOWeek(mondayDate);
    const reportYear = mondayDate.getFullYear();
    
    console.log(`Extrahierte Datumsinformationen: Datum=${format(reportDate, 'yyyy-MM-dd')}, KW${weekNumber}/${reportYear}`);
    
    return { weekNumber, year: reportYear };
  }
  
  // Fallback, wenn kein Datum im Dateinamen gefunden wurde
  console.warn("Kein Datum im Dateinamen gefunden. Verwende aktuelle Woche als Fallback.");
  const currentDate = new Date();
  return {
    weekNumber: getISOWeek(currentDate),
    year: currentDate.getFullYear()
  };
}

/**
 * ISO-Kalenderwoche (1-53) berechnen
 */
export function getISOWeek(date: Date): number {
  // Eine Kopie des Datumobjekts erstellen
  const target = new Date(date.valueOf());
  
  // ISO-Woche beginnt am Montag
  const dayNr = (date.getDay() + 6) % 7;
  
  // Target auf den Donnerstag dieser Woche setzen
  target.setDate(target.getDate() - dayNr + 3);
  
  // Timestamp von Target speichern
  const jan4 = new Date(target.getFullYear(), 0, 4);
  
  // Volle Wochen zum nächsten Donnerstag berechnen
  const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
  
  // Wochennummer zurückgeben
  return 1 + Math.floor(dayDiff / 7);
}

/**
 * Standardisiere die Risikostufen-Texte (Verarbeitet Variationen wie "Low Risk", "low risk", etc.)
 */
export function standardizeRiskLevel(risk: string | undefined): string {
  if (!risk) return "Unknown";
  
  const lowerRisk = risk.toLowerCase();
  
  if (lowerRisk.includes("high")) return "High Risk";
  if (lowerRisk.includes("medium")) return "Medium Risk";
  if (lowerRisk.includes("low")) return "Low Risk";
  
  return risk; // Original zurückgeben, wenn keine Übereinstimmung gefunden wurde
}

/**
 * Verarbeite Rohdaten des Mentor-Programms in ein strukturiertes Format
 * Extrahiert nur die relevanten Spalten: A,B,C,D,E,F,G,H,J,L,N,V
 */
export function processMentorData(rawData: any[], weekInfo: WeekInfo): {
  weekNumber: number;
  year: number;
  reportDate: string;
  fileName: string;
  drivers: MentorDriverData[];
} {
  const drivers: MentorDriverData[] = [];
  
  // Zeilen herausfiltern, die nicht die erforderlichen Daten haben
  const validRows = rawData.filter(row => 
    row["First Name"] && 
    (row["FICOP Safe Driving Station"] || row["FICOP Safe Drvn Station"])
  );
  
  console.log(`Verarbeite ${validRows.length} gültige Zeilen aus ${rawData.length} Gesamtzeilen`);
  
  for (const row of validRows) {
    // Station-Feld könnte unterschiedlich benannt sein
    const stationField = row["FICOP Safe Driving Station"] || row["FICOP Safe Drvn Station"];
    const station = typeof stationField === 'string' ? stationField : String(stationField);
    
    // Neue relevante Spalten extrahieren (J,L,N,V)
    const seatbeltRating = row["Seatbelt Rating"] || row["Seatbelt"];
    const speedingRating = row["Speeding Rating"] || row["Speeding"];
    const followingRating = row["Following Distance Rating"] || row["Following Distance"];
    const overallRating = row["FICO Rating"] || row["Overall Rating"] || row["FICO Score"];
    
    const driver: MentorDriverData = {
      firstName: row["First Name"],
      lastName: row["Last Name"] || "",
      station: station,
      totalTrips: parseInt(row["Total Driver Trips"] || "0", 10),
      totalKm: parseFloat(row["Total Driver km"] || "0"),
      totalHours: row["Total Driver Hours"] || "0",
      acceleration: standardizeRiskLevel(row["Acceleration Rating"]),
      braking: standardizeRiskLevel(row["Braking Rating"]),
      cornering: standardizeRiskLevel(row["Cornering Rating"]),
      distraction: standardizeRiskLevel(row["Distraction Rating"]),
      // Neue Felder hinzufügen
      seatbelt: standardizeRiskLevel(seatbeltRating),
      speeding: standardizeRiskLevel(speedingRating),
      following: standardizeRiskLevel(followingRating),
      overallRating: overallRating ? String(overallRating) : "Unknown"
    };
    
    drivers.push(driver);
  }
  
  return {
    weekNumber: weekInfo.weekNumber,
    year: weekInfo.year,
    reportDate: format(new Date(), "yyyy-MM-dd"),
    fileName: '',
    drivers
  };
}
