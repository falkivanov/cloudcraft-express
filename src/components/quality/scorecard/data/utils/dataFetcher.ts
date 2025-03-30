
import { ScoreCardData } from "../../types";
import { 
  getWeek6Data, 
  getWeek7Data, 
  getWeek8Data, 
  getWeek9Data, 
  getWeek10Data,
  getWeek11Data,
  getDummyScoreCardData 
} from "../weekData";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";

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
