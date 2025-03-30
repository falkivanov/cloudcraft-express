
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
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from "@/utils/storage";

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

/**
 * Get the appropriate data function for a specific week
 * @param weekNum Week number
 * @param year Year
 * @returns Function to retrieve data for the specified week
 */
export const getDataFunctionForWeek = (weekNum: number, year: number): (() => ScoreCardData) => {
  // First check for week-specific data
  const weekKey = `scorecard_data_week_${weekNum}_${year}`;
  const weekData = loadFromStorage<ScoreCardData>(weekKey);
  if (weekData) {
    return () => weekData;
  }
  
  // Then check for extracted data - consistent approach
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      if (extractedData.week === weekNum && extractedData.year === year) {
        return () => extractedData;
      }
    }
    
    // Fallback to legacy approach
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      const parsedData = JSON.parse(legacyData);
      if (parsedData && parsedData.week === weekNum && parsedData.year === year) {
        return () => parsedData;
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
  
  // If we have a selected week, try to get data for it
  if (selectedWeek) {
    const parsedWeek = parseWeekIdentifier(selectedWeek);
    
    if (parsedWeek) {
      const { weekNum, year } = parsedWeek;
      
      // First check for week-specific data
      const weekKey = `scorecard_data_week_${weekNum}_${year}`;
      const weekData = loadFromStorage<ScoreCardData>(weekKey);
      if (weekData) {
        console.log(`Using week-specific data for week ${weekNum}/${year}`, weekData);
        return weekData;
      }
      
      // Then try other data sources
      const getDataFunction = getDataFunctionForWeek(weekNum, year);
      return getDataFunction();
    }
  }
  
  // If no specific week selected, try to get current data
  
  // Check for extracted data from PDF - consistent approach first
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      console.log("Using extracted PDF data for scorecard from structured storage", extractedData);
      return extractedData;
    }
    
    // Fallback to legacy approach
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      const parsedData = JSON.parse(legacyData);
      console.log("Using extracted PDF data for scorecard from legacy storage", parsedData);
      return parsedData;
    }
  } catch (e) {
    console.error("Error retrieving extracted data:", e);
  }
  
  // Default to dummy data if nothing found
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

/**
 * Gets all available weeks with scorecard data from localStorage
 * @returns Array of available weeks with their data
 */
export const getAllAvailableWeeks = (): {id: string; label: string; weekNum: number; year: number}[] => {
  const weeks: {id: string; label: string; weekNum: number; year: number}[] = [];
  
  // Iterate through all localStorage keys to find week-specific data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('scorecard_data_week_')) {
      try {
        // Parse the week and year from the key
        const match = key.match(/scorecard_data_week_(\d+)_(\d+)/);
        if (match) {
          const weekNum = parseInt(match[1], 10);
          const year = parseInt(match[2], 10);
          
          if (!isNaN(weekNum) && !isNaN(year)) {
            weeks.push({
              id: `week-${weekNum}-${year}`,
              label: `KW ${weekNum}/${year}`,
              weekNum,
              year
            });
          }
        }
      } catch (e) {
        console.error(`Error parsing week data for key ${key}:`, e);
      }
    }
  }
  
  // Add sample weeks from 2025
  for (let weekNum = 6; weekNum <= 11; weekNum++) {
    if (isDataAvailableForWeek(weekNum, 2025) && 
        !weeks.some(w => w.weekNum === weekNum && w.year === 2025)) {
      weeks.push({
        id: `week-${weekNum}-2025`,
        label: `KW ${weekNum}/2025 (Beispiel)`,
        weekNum,
        year: 2025
      });
    }
  }
  
  // Sort by year and week (newest first)
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNum - a.weekNum;
  });
};
