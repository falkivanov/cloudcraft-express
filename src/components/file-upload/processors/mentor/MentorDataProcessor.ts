
import * as XLSX from "xlsx";
import { MentorReport, WeekInfo } from "./types";
import { processMentorData, extractWeekInfo } from "./utils";

/**
 * Klasse zur Verarbeitung von Mentor Excel-Dateidaten
 */
export class MentorDataProcessor {
  private file: File;
  
  constructor(file: File) {
    this.file = file;
  }
  
  /**
   * Verarbeite den Dateiinhalt und extrahiere Daten
   */
  public async processFileData(): Promise<MentorReport> {
    try {
      // Extrahiere Wochennummer und Jahr aus dem Dateinamen
      const weekInfo = extractWeekInfo(this.file.name);
      console.log(`Verarbeite Mentor-Datei für KW${weekInfo.weekNumber}/${weekInfo.year}`);
      
      // Excel-Datei lesen und parsen
      const content = await this.readFileAsArrayBuffer();
      const workbook = XLSX.read(content, { type: "array" });
      
      // Verwende das erste Arbeitsblatt
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // In JSON konvertieren mit Header-Option
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 'A',
        range: 0 
      });
      
      console.log(`Excel enthält ${rawData.length} Zeilen`);
      
      // Header-Zeile finden und Spaltennamen extrahieren
      const headerRow = this.findHeaderRow(rawData);
      
      if (!headerRow) {
        throw new Error("Keine Header-Zeile in der Excel-Datei gefunden");
      }
      
      // Daten mit korrekten Spaltennamen transformieren
      const processedData = this.transformDataWithHeaders(rawData, headerRow);
      
      // Verarbeite die transformierten Daten
      const result = processMentorData(processedData, weekInfo);
      result.fileName = this.file.name;
      
      console.log(`Mentor-Daten verarbeitet: ${result.drivers.length} Fahrer für KW${weekInfo.weekNumber}/${weekInfo.year}`);
      return result;
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Mentor-Daten:", error);
      throw error;
    }
  }
  
  /**
   * Finde die Header-Zeile in den Rohdaten
   */
  private findHeaderRow(rawData: any[]): any | null {
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
   * Transformiere die Rohdaten mit den erkannten Headern
   */
  private transformDataWithHeaders(rawData: any[], headerRow: any): any[] {
    // Erstelle Zuordnung von Excel-Spalten zu Spaltennamen
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
   * Dateiinhalt als ArrayBuffer lesen
   */
  private readFileAsArrayBuffer(): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei"));
      };
      
      reader.readAsArrayBuffer(this.file);
    });
  }
}
