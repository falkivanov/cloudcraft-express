
import { ScoreCardData } from "../../types";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";
import { parseWeekIdentifier, isDataAvailableForWeek } from "./weekIdentifier";
import { getDataFunctionForWeek } from "./dataFetcher";
import { getDummyScoreCardData } from "../../data/weeks";
import { getDefaultTargetForKPI } from "../../utils/helpers/statusHelper";

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
        
        // Apply custom targets if available
        const updatedData = applyCustomTargets(weekData, weekNum, year);
        return updatedData;
      }
      
      // Then try other data sources
      const getDataFunction = getDataFunctionForWeek(weekNum, year);
      const data = getDataFunction();
      
      // Apply custom targets if available
      const updatedData = applyCustomTargets(data, weekNum, year);
      return updatedData;
    }
  }
  
  // If no specific week selected, try to get current data
  
  // Check for extracted data from PDF - consistent approach first
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      console.log("Using extracted PDF data for scorecard from structured storage", extractedData);
      
      // Apply custom targets if available
      const updatedData = applyCustomTargets(extractedData, extractedData.week, extractedData.year);
      return updatedData;
    }
    
    // Fallback to legacy approach
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      const parsedData = JSON.parse(legacyData);
      console.log("Using extracted PDF data for scorecard from legacy storage", parsedData);
      
      // Apply custom targets if available
      const updatedData = applyCustomTargets(parsedData, parsedData.week, parsedData.year);
      return updatedData;
    }
  } catch (e) {
    console.error("Error retrieving extracted data:", e);
  }
  
  // Default to dummy data if nothing found
  const dummyData = getDummyScoreCardData();
  
  // Apply custom targets to dummy data
  return applyCustomTargets(dummyData, dummyData.week, dummyData.year);
};

/**
 * Apply custom target values to scorecard data
 * @param data Original scorecard data
 * @param weekNum Week number
 * @param year Year
 * @returns Updated scorecard data with custom targets
 */
export const applyCustomTargets = (data: ScoreCardData, weekNum: number, year: number): ScoreCardData => {
  try {
    // Apply custom targets to company KPIs
    const updatedCompanyKPIs = data.companyKPIs.map(kpi => {
      const customTarget = getDefaultTargetForKPI(kpi.name, weekNum, year);
      return { ...kpi, target: customTarget };
    });
    
    return {
      ...data,
      companyKPIs: updatedCompanyKPIs
    };
  } catch (error) {
    console.error("Error applying custom targets:", error);
    return data; // Return original data if there's an error
  }
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
