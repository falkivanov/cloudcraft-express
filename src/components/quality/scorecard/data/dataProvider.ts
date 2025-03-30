
import { ScoreCardData } from "../types";
import { 
  getWeek6Data, 
  getWeek7Data, 
  getWeek8Data, 
  getWeek9Data, 
  getWeek10Data,
  getWeek11Data,
  getDummyScoreCardData 
} from "./weekData";
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from "@/utils/storageUtils";

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
  // First check if we have extracted data from PDF
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      if (extractedData.week === weekNum && extractedData.year === year) {
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

/**
 * Get the appropriate data function for a specific week
 * @param weekNum Week number
 * @param year Year
 * @returns Function to retrieve data for the specified week
 */
export const getDataFunctionForWeek = (weekNum: number, year: number): (() => ScoreCardData) => {
  // First check for extracted data
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      if (extractedData.week === weekNum && extractedData.year === year) {
        return () => extractedData;
      }
    }
  } catch (e) {
    console.error("Error retrieving extracted data:", e);
  }
  
  // If no extracted data, use sample data
  if (year === 2025) {
    switch (weekNum) {
      case 6: return getWeek6Data;
      case 7: return getWeek7Data;
      case 8: return getWeek8Data;
      case 9: return getWeek9Data;
      case 10: return getWeek10Data;
      case 11: return getWeek11Data;
      default: return getDummyScoreCardData;
    }
  }
  
  // Default to dummy data for any other year
  return getDummyScoreCardData;
};

/**
 * Helper function to get the data based on selected week
 * @param scorecardData Existing scorecard data (if available)
 * @param selectedWeek Selected week identifier in the format "week-XX-YYYY"
 * @returns ScoreCardData for the requested week
 */
export const getScorecardData = (scorecardData: ScoreCardData | null, selectedWeek?: string): ScoreCardData => {
  // If we already have scorecard data, return it
  if (scorecardData) {
    return scorecardData;
  }
  
  // Check for extracted data from PDF
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      console.log("Using extracted PDF data for scorecard", extractedData);
      
      // If no specific week is selected, use this data
      if (!selectedWeek) {
        return extractedData;
      }
      
      // If a week is selected, check if it matches our extracted data
      const parsedWeek = parseWeekIdentifier(selectedWeek);
      if (parsedWeek && parsedWeek.weekNum === extractedData.week && parsedWeek.year === extractedData.year) {
        return extractedData;
      }
    }
  } catch (e) {
    console.error("Error retrieving extracted data:", e);
  }
  
  // If we have a selected week, try to get data for it
  if (selectedWeek) {
    const parsedWeek = parseWeekIdentifier(selectedWeek);
    
    if (parsedWeek) {
      const { weekNum, year } = parsedWeek;
      const getDataFunction = getDataFunctionForWeek(weekNum, year);
      return getDataFunction();
    }
  }
  
  // Default to dummy data if no week is selected or if the format is invalid
  return getDummyScoreCardData();
};

/**
 * Get the previous week's data for comparison
 * @param currentWeek Current week identifier in the format "week-XX-YYYY"
 * @returns ScoreCardData for the previous week, or null if none exists
 */
export const getPreviousWeekData = (currentWeek: string): ScoreCardData | null => {
  const parsedWeek = parseWeekIdentifier(currentWeek);
  if (!parsedWeek) return null;
  
  const { weekNum, year } = parsedWeek;
  
  // Calculate previous week
  let prevWeekNum = weekNum - 1;
  let prevYear = year;
  
  // Handle year boundary (week 1)
  if (prevWeekNum < 1) {
    prevWeekNum = 52; // Assuming 52 weeks in a year
    prevYear = year - 1;
  }
  
  // Check if we have data for the previous week
  if (!isDataAvailableForWeek(prevWeekNum, prevYear)) {
    return null;
  }
  
  // Construct the previous week identifier and get the data
  const prevWeekId = `week-${prevWeekNum}-${prevYear}`;
  return getScorecardData(null, prevWeekId);
};

/**
 * Gets the next week's identifier
 * @param currentWeek Current week identifier in the format "week-XX-YYYY"
 * @returns Next week identifier, or null if invalid format
 */
export const getNextWeekIdentifier = (currentWeek: string): string | null => {
  const parsedWeek = parseWeekIdentifier(currentWeek);
  if (!parsedWeek) return null;
  
  const { weekNum, year } = parsedWeek;
  
  // Calculate next week
  let nextWeekNum = weekNum + 1;
  let nextYear = year;
  
  // Handle year boundary (week 52)
  if (nextWeekNum > 52) {
    nextWeekNum = 1;
    nextYear = year + 1;
  }
  
  return `week-${nextWeekNum}-${nextYear}`;
};
