
import { MentorReport } from "./types";
import { extractWeekInfo } from "./utils/weekInfoExtractor";
import { readExcelFile } from "./fileReader";
import { findHeaderRow, createColumnMapping } from "./header";
import { 
  transformDataWithHeaders, 
  convertToDriverData, 
  filterValidDrivers 
} from "./transform";

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
      const rawData = await readExcelFile(this.file);
      console.log(`Excel enthält ${rawData.length} Zeilen`);
      
      // Header-Zeile finden und Spaltennamen extrahieren
      const headerRow = findHeaderRow(rawData);
      
      if (!headerRow && rawData.length === 0) {
        throw new Error("Keine Header-Zeile in der Excel-Datei gefunden");
      }
      
      // Erzeuge Spalten-Mapping
      const columnMapping = createColumnMapping(headerRow);
      
      // Daten mit korrekten Spaltennamen transformieren
      const transformedData = transformDataWithHeaders(rawData, headerRow, columnMapping);
      
      // Print out sample raw data for debugging
      console.log("Raw transformed data sample:", 
        transformedData.slice(0, 2).map(row => ({
          firstName: row['Driver First Name'],
          lastName: row['Driver Last Name'],
          score: row['Overall Rating'],
          accel: row['Acceleration'],
          brake: row['Braking']
        }))
      );
      
      // Konvertiere in Fahrer-Objekte
      const driverData = convertToDriverData(transformedData);
      
      // Filtere invalide Fahrer
      const validDrivers = filterValidDrivers(driverData);
      
      console.log(`Gefilterte Fahrerdaten: ${validDrivers.length} gültige Fahrer aus ${driverData.length} Gesamteinträgen`);
      
      // Erstelle den finalen Report
      const result: MentorReport = {
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        fileName: this.file.name,
        reportDate: weekInfo.reportDate.toISOString(),
        drivers: validDrivers
      };
      
      console.log(`Mentor-Daten verarbeitet: ${result.drivers.length} Fahrer für KW${weekInfo.weekNumber}/${weekInfo.year}`);
      return result;
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Mentor-Daten:", error);
      throw error;
    }
  }
}
