
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
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // In JSON konvertieren
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      console.log(`Excel enthält ${rawData.length} Zeilen`);
      
      // Daten verarbeiten
      const processedData = processMentorData(rawData, weekInfo);
      processedData.fileName = this.file.name;
      
      console.log(`Mentor-Daten verarbeitet: ${processedData.drivers.length} Fahrer für KW${weekInfo.weekNumber}/${weekInfo.year}`);
      return processedData;
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Mentor-Daten:", error);
      throw error;
    }
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
