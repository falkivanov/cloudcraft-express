
import * as XLSX from "xlsx";
import { MentorReport, WeekInfo } from "./types";
import { processMentorData, extractWeekInfo } from "./utils";

/**
 * Class for processing Mentor Excel file data
 */
export class MentorDataProcessor {
  private file: File;
  
  constructor(file: File) {
    this.file = file;
  }
  
  /**
   * Process the file content and extract data
   */
  public async processFileData(): Promise<MentorReport> {
    try {
      // Extract week number from filename
      const weekInfo = extractWeekInfo(this.file.name);
      console.log("Extracted week info:", weekInfo);
      
      // Read and parse the Excel file
      const content = await this.readFileAsArrayBuffer();
      const workbook = XLSX.read(content, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      console.log("Found sheet:", sheetName);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Raw data sample:", rawData.slice(0, 2));
      
      // Process the data
      const processedData = processMentorData(rawData, weekInfo);
      processedData.fileName = this.file.name;
      
      console.log("Processed data:", processedData);
      console.log("Driver count:", processedData.drivers.length);
      
      return processedData;
    } catch (error) {
      console.error("Error processing Mentor data:", error);
      throw error;
    }
  }
  
  /**
   * Read the file content as ArrayBuffer
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
