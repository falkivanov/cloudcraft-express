
import { ScoreCardData } from "../../types";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";

/**
 * Parse a week identifier string into week number and year
 * @param weekId Week identifier in the format "week-XX-YYYY"
 * @returns Object containing week number and year, or null if invalid format
 */
export const parseWeekIdentifier = (weekId: string): { weekNum: number; year: number } | null => {
  const weekMatch = weekId.match(/week-(\d+)-(\d+)/);
  if (!weekMatch) return null;
  
  return {
    weekNum: parseInt(weekMatch[1], 10),
    year: parseInt(weekMatch[2], 10)
  };
};

/**
 * Checks if data is available for a specific week
 * @param weekNum Week number
 * @param year Year
 * @returns Boolean indicating if data is available
 */
export const isDataAvailableForWeek = (weekNum: number, year: number): boolean => {
  // First check if we have week-specific data
  const weekKey = `scorecard_data_week_${weekNum}_${year}`;
  if (loadFromStorage(weekKey)) {
    return true;
  }
  
  // Then check if we have extracted data from PDF - consistent approach
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      if (extractedData.week === weekNum && extractedData.year === year) {
        return true;
      }
    }
    
    // Fallback to legacy approach if needed
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      const parsedData = JSON.parse(legacyData);
      if (parsedData && parsedData.week === weekNum && parsedData.year === year) {
        return true;
      }
    }
  } catch (e) {
    console.error("Error checking extracted data:", e);
  }
  
  // Then check our sample data
  if (year === 2025 && weekNum >= 6 && weekNum <= 11) {
    return true;
  }
  
  return false;
};
