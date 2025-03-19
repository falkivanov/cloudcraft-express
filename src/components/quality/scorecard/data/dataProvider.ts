
import { ScoreCardData } from "../types";
import { 
  getWeek6Data, 
  getWeek7Data, 
  getWeek8Data, 
  getWeek9Data, 
  getDummyScoreCardData 
} from "./weekData";

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
  // We currently have data for weeks 6-10 of 2025
  if (year === 2025 && weekNum >= 6 && weekNum <= 10) {
    return true;
  }
  
  // For future weeks or other years, we return the dummy data
  // This could be expanded to handle more cases as needed
  return false;
};

/**
 * Get the appropriate data function for a specific week
 * @param weekNum Week number
 * @param year Year
 * @returns Function to retrieve data for the specified week
 */
export const getDataFunctionForWeek = (weekNum: number, year: number): (() => ScoreCardData) => {
  if (year === 2025) {
    switch (weekNum) {
      case 6: return getWeek6Data;
      case 7: return getWeek7Data;
      case 8: return getWeek8Data;
      case 9: return getWeek9Data;
      case 10: return getDummyScoreCardData;
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
