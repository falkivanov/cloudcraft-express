
import { ScoreCardData } from "../types";
import { 
  getWeek6Data, 
  getWeek7Data, 
  getWeek8Data, 
  getWeek9Data, 
  getDummyScoreCardData 
} from "./weekData";

/**
 * Helper function to get the data based on selected week
 * @param scorecardData Existing scorecard data (if available)
 * @param selectedWeek Selected week identifier in the format "week-XX-YYYY"
 * @returns ScoreCardData for the requested week
 */
export const getScorecardData = (scorecardData: ScoreCardData | null, selectedWeek?: string): ScoreCardData => {
  if (scorecardData) {
    return scorecardData;
  }
  
  if (selectedWeek) {
    const weekMatch = selectedWeek.match(/week-(\d+)-(\d+)/);
    if (weekMatch) {
      const weekNum = parseInt(weekMatch[1], 10);
      const year = parseInt(weekMatch[2], 10);
      
      switch (weekNum) {
        case 6:
          return getWeek6Data();
        case 7:
          return getWeek7Data();
        case 8:
          return getWeek8Data();
        case 9:
          return getWeek9Data();
        case 10:
          return getDummyScoreCardData();
        default:
          return getDummyScoreCardData();
      }
    }
  }
  
  return getDummyScoreCardData();
};

/**
 * Get the previous week's data for comparison
 * @param currentWeek Current week identifier in the format "week-XX-YYYY"
 * @returns ScoreCardData for the previous week, or null if none exists
 */
export const getPreviousWeekData = (currentWeek: string): ScoreCardData | null => {
  const weekMatch = currentWeek.match(/week-(\d+)-(\d+)/);
  if (!weekMatch) return null;
  
  const weekNum = parseInt(weekMatch[1], 10);
  const year = parseInt(weekMatch[2], 10);
  
  if (year === 2025 && weekNum <= 6) return null;
  
  const prevWeekNum = weekNum - 1;
  const prevYear = year;
  const prevWeekId = `week-${prevWeekNum}-${prevYear}`;
  
  return getScorecardData(null, prevWeekId);
};
