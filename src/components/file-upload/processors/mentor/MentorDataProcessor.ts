
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
    // Suche nach typischen Header-Spalten
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      
      // Prüfe, ob diese Zeile typische Header enthält
      if (
        (row['A'] && row['A'].toString().includes('Driver First Name')) ||
        (row['A'] && row['A'].toString().includes('First Name')) ||
        (row['B'] && row['B'].toString().includes('Last Name')) ||
        (row['C'] && row['C'].toString().includes('Station'))
      ) {
        console.log(`Header-Zeile gefunden in Zeile ${i+1}`);
        return row;
      }
    }
    
    // Wenn keine klare Header-Zeile gefunden wurde, nehmen wir standardmäßige Spaltenbezeichnungen an
    console.warn("Keine klare Header-Zeile gefunden, verwende Standard-Spaltenbezeichnungen");
    return {
      'A': 'Driver First Name',
      'B': 'Driver Last Name',
      'C': 'Station',
      'D': 'Total Trips',
      'E': 'Total Hours',
      'F': 'Acceleration',
      'G': 'Braking',
      'H': 'Cornering',
      'J': 'Speeding',
      'L': 'Seatbelt',
      'N': 'Following Distance',
      'V': 'Overall Rating'
    };
  }
  
  /**
   * Transformiere die Rohdaten mit den erkannten Headern
   */
  private transformDataWithHeaders(rawData: any[], headerRow: any): any[] {
    // Erstelle Zuordnung von Excel-Spalten zu Spaltennamen
    const columnMapping: Record<string, string> = {};
    
    // Finde die entsprechenden Spalten für die benötigten Daten
    Object.entries(headerRow).forEach(([col, value]) => {
      if (typeof value === 'string') {
        if (value.includes('First Name')) columnMapping['Driver First Name'] = col;
        else if (value.includes('Last Name')) columnMapping['Driver Last Name'] = col;
        else if (value.includes('Station')) columnMapping['Station'] = col;
        else if (value.includes('Total Trips')) columnMapping['Total Trips'] = col;
        else if (value.includes('Total Hours')) columnMapping['Total Hours'] = col;
        else if (value.includes('Acceleration')) columnMapping['Acceleration'] = col;
        else if (value.includes('Braking')) columnMapping['Braking'] = col;
        else if (value.includes('Cornering')) columnMapping['Cornering'] = col;
        else if (value.includes('Speeding')) columnMapping['Speeding'] = col;
        else if (value.includes('Seatbelt')) columnMapping['Seatbelt'] = col;
        else if (value.includes('Following Distance')) columnMapping['Following Distance'] = col;
        else if (value.includes('Overall')) columnMapping['Overall Rating'] = col;
        else if (value.includes('Phone') || value.includes('Distraction')) columnMapping['Phone Distraction'] = col;
      }
    });
    
    // Standardspalten verwenden, wenn keine Zuordnung gefunden wurde
    if (!columnMapping['Driver First Name']) columnMapping['Driver First Name'] = 'A';
    if (!columnMapping['Driver Last Name']) columnMapping['Driver Last Name'] = 'B';
    if (!columnMapping['Station']) columnMapping['Station'] = 'C';
    if (!columnMapping['Total Trips']) columnMapping['Total Trips'] = 'D';
    if (!columnMapping['Total Hours']) columnMapping['Total Hours'] = 'E';
    if (!columnMapping['Acceleration']) columnMapping['Acceleration'] = 'F';
    if (!columnMapping['Braking']) columnMapping['Braking'] = 'G';
    if (!columnMapping['Cornering']) columnMapping['Cornering'] = 'H';
    if (!columnMapping['Speeding']) columnMapping['Speeding'] = 'J';
    if (!columnMapping['Seatbelt']) columnMapping['Seatbelt'] = 'L';
    if (!columnMapping['Following Distance']) columnMapping['Following Distance'] = 'N';
    if (!columnMapping['Phone Distraction']) columnMapping['Phone Distraction'] = 'R';
    if (!columnMapping['Overall Rating']) columnMapping['Overall Rating'] = 'V';
    
    console.log("Spaltenzuordnung:", columnMapping);
    
    // Header-Zeile und leere Zeilen überspringen
    const dataRows = rawData.filter((row, index) => {
      // Überspringe die Header-Zeile selbst
      if (row === headerRow) return false;
      
      // Überspringe leere Zeilen oder Zeilen ohne Fahrernamen
      const firstNameCol = columnMapping['Driver First Name'];
      return row[firstNameCol] && typeof row[firstNameCol] === 'string' && row[firstNameCol].trim() !== '';
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
