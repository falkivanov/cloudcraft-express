
import { parseWeekIdentifier } from "./weekIdentifier";
import { isDataAvailableForWeek } from "./weekIdentifier";

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
 * Gets the previous week's identifier
 * @param currentWeek Current week identifier in the format "week-XX-YYYY"
 * @returns Previous week identifier, or null if invalid format
 */
export const getPreviousWeekIdentifier = (currentWeek: string): string | null => {
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
  
  return `week-${prevWeekNum}-${prevYear}`;
};

/**
 * Checks if the next week has available data
 * @param currentWeek Current week identifier in the format "week-XX-YYYY"
 * @returns Boolean indicating if next week has data
 */
export const hasNextWeekData = (currentWeek: string): boolean => {
  const nextWeekId = getNextWeekIdentifier(currentWeek);
  if (!nextWeekId) return false;
  
  const parsedWeek = parseWeekIdentifier(nextWeekId);
  if (!parsedWeek) return false;
  
  return isDataAvailableForWeek(parsedWeek.weekNum, parsedWeek.year);
};
