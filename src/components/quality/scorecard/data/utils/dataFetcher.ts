
import { ScoreCardData } from "../../types";
import { 
  getWeek11Data,
  getDummyScoreCardData 
} from "../weekData";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";
import { getDefaultTargetForKPI } from "../../utils/helpers/statusHelper";

/**
 * Apply custom targets to scorecard data
 * @param data Original scorecard data
 * @param weekNum Week number
 * @param year Year
 * @returns Updated data with custom targets
 */
const applyCustomTargets = (data: ScoreCardData, weekNum: number, year: number): ScoreCardData => {
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
    console.error("Error applying custom targets in dataFetcher:", error);
    return data; // Return original data if there's an error
  }
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
    return () => applyCustomTargets(weekData, weekNum, year);
  }
  
  // Then check for extracted data - consistent approach
  try {
    const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (extractedData) {
      if (extractedData.week === weekNum && extractedData.year === year) {
        return () => applyCustomTargets(extractedData, weekNum, year);
      }
    }
    
    // Fallback to legacy approach
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      const parsedData = JSON.parse(legacyData);
      if (parsedData && parsedData.week === weekNum && parsedData.year === year) {
        return () => applyCustomTargets(parsedData, weekNum, year);
      }
    }
  } catch (e) {
    console.error("Error retrieving extracted data:", e);
  }
  
  // If no extracted data, use sample data
  if (year === 2025) {
    // We only have week 11 data now
    if (weekNum === 11) {
      return () => applyCustomTargets(getWeek11Data(), weekNum, year);
    }
  }
  
  // Default to dummy data for any other year/week
  return () => applyCustomTargets(getDummyScoreCardData(), weekNum, year);
};

