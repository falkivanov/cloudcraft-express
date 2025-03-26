
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";

interface MentorDriverData {
  firstName: string;
  lastName: string;
  station: string;
  totalTrips: number;
  totalKm: number;
  totalHours: string;
  acceleration: string;
  braking: string;
  cornering: string;
  distraction: string;
}

interface MentorReport {
  weekNumber: number;
  year: number;
  reportDate: string;
  fileName: string;
  drivers: MentorDriverData[];
}

/**
 * Specialized processor for Mentor Excel files
 */
export class MentorProcessor extends BaseFileProcessor {
  /**
   * Process a Mentor Excel file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      // Extract week number from filename (format: Driver_Report_YYYY-MM-DD)
      const weekInfo = this.extractWeekInfo(this.file.name);
      
      await this.readFileAsArrayBuffer()
        .then((content) => {
          const workbook = XLSX.read(content, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const rawData = XLSX.utils.sheet_to_json(worksheet);
          
          // Process the data
          const processedData = this.processMentorData(rawData, weekInfo);
          processedData.fileName = this.file.name;
          
          // Store in localStorage
          localStorage.setItem("mentorData", JSON.stringify(processedData));
          
          if (showToasts) {
            toast.success(`Mentor Datei erfolgreich verarbeitet: ${this.file.name}`, {
              description: `KW${processedData.weekNumber}/${processedData.year} Daten mit ${processedData.drivers.length} Fahrern`
            });
          }
          
          if (this.onFileUpload) {
            this.onFileUpload(this.file, "excel", "mentor");
          }
        });
      
      return true;
    } catch (error) {
      console.error("Error processing Mentor data:", error);
      toast.error("Fehler bei der Verarbeitung der Mentor-Datei", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
  
  /**
   * Extract week information from filename
   */
  private extractWeekInfo(filename: string): { weekNumber: number, year: number } {
    // Expected format: Driver_Report_YYYY-MM-DD.xlsx
    const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
    
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // JS months are 0-indexed
      const day = parseInt(dateMatch[3], 10);
      
      const reportDate = new Date(year, month, day);
      
      // Get ISO week number - the week that contains this date
      const weekNumber = this.getISOWeek(reportDate);
      
      return { weekNumber, year };
    }
    
    // Fallback if no date found in filename
    const currentDate = new Date();
    return {
      weekNumber: this.getISOWeek(currentDate),
      year: currentDate.getFullYear()
    };
  }
  
  /**
   * Get ISO week number (1-53)
   */
  private getISOWeek(date: Date): number {
    // Create a copy of the date object
    const target = new Date(date.valueOf());
    
    // ISO week starts on Monday
    const dayNr = (date.getDay() + 6) % 7;
    
    // Set target to the thursday of this week
    target.setDate(target.getDate() - dayNr + 3);
    
    // Store the timestamp of target
    const jan4 = new Date(target.getFullYear(), 0, 4);
    
    // Calculate full weeks to nearest Thursday
    const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
    
    // Return the week number
    return 1 + Math.floor(dayDiff / 7);
  }
  
  /**
   * Process raw mentor data into a structured format
   */
  private processMentorData(rawData: any[], weekInfo: { weekNumber: number, year: number }): MentorReport {
    const drivers: MentorDriverData[] = [];
    
    // Filter out rows that don't have required data
    const validRows = rawData.filter(row => 
      row["First Name"] && 
      (row["FICOP Safe Driving Station"] || row["FICOP Safe Drvn Station"])
    );
    
    for (const row of validRows) {
      const stationField = row["FICOP Safe Driving Station"] || row["FICOP Safe Drvn Station"];
      const station = typeof stationField === 'string' ? stationField : String(stationField);
      
      const driver: MentorDriverData = {
        firstName: row["First Name"],
        lastName: row["Last Name"] || "",
        station: station,
        totalTrips: parseInt(row["Total Driver Trips"] || "0", 10),
        totalKm: parseFloat(row["Total Driver km"] || "0"),
        totalHours: row["Total Driver Hours"] || "0",
        acceleration: this.standardizeRiskLevel(row["Acceleration Rating"]),
        braking: this.standardizeRiskLevel(row["Braking Rating"]),
        cornering: this.standardizeRiskLevel(row["Cornering Rating"]),
        distraction: this.standardizeRiskLevel(row["Distraction Rating"])
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
  
  /**
   * Standardize risk level text (handles variations like "Low Risk", "low risk", etc.)
   */
  private standardizeRiskLevel(risk: string | undefined): string {
    if (!risk) return "Unknown";
    
    const lowerRisk = risk.toLowerCase();
    
    if (lowerRisk.includes("high")) return "High Risk";
    if (lowerRisk.includes("medium")) return "Medium Risk";
    if (lowerRisk.includes("low")) return "Low Risk";
    
    return risk; // Return original if no match
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
