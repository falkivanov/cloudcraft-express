
import { format } from "date-fns";
import { WeekInfo, MentorDriverData } from "./types";

/**
 * Extract week information from filename
 */
export function extractWeekInfo(filename: string): WeekInfo {
  // Expected format: Driver_Report_YYYY-MM-DD.xlsx
  const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1; // JS months are 0-indexed
    const day = parseInt(dateMatch[3], 10);
    
    const reportDate = new Date(year, month, day);
    
    // Get ISO week number - the week that contains this date
    const weekNumber = getISOWeek(reportDate);
    
    return { weekNumber, year };
  }
  
  // Fallback if no date found in filename
  const currentDate = new Date();
  return {
    weekNumber: getISOWeek(currentDate),
    year: currentDate.getFullYear()
  };
}

/**
 * Get ISO week number (1-53)
 */
export function getISOWeek(date: Date): number {
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
 * Standardize risk level text (handles variations like "Low Risk", "low risk", etc.)
 */
export function standardizeRiskLevel(risk: string | undefined): string {
  if (!risk) return "Unknown";
  
  const lowerRisk = risk.toLowerCase();
  
  if (lowerRisk.includes("high")) return "High Risk";
  if (lowerRisk.includes("medium")) return "Medium Risk";
  if (lowerRisk.includes("low")) return "Low Risk";
  
  return risk; // Return original if no match
}

/**
 * Process raw mentor data into a structured format
 */
export function processMentorData(rawData: any[], weekInfo: WeekInfo): {
  weekNumber: number;
  year: number;
  reportDate: string;
  fileName: string;
  drivers: MentorDriverData[];
} {
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
      acceleration: standardizeRiskLevel(row["Acceleration Rating"]),
      braking: standardizeRiskLevel(row["Braking Rating"]),
      cornering: standardizeRiskLevel(row["Cornering Rating"]),
      distraction: standardizeRiskLevel(row["Distraction Rating"])
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
