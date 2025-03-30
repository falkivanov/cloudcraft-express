
import { DriverKPI, ScoreCardData } from "../../../types";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storageUtils";

export const getDriverKPIs = (): DriverKPI[] => {
  // Use a consistent approach to check for data
  try {
    // First check using the structured storage approach
    const structuredData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (structuredData && Array.isArray(structuredData.driverKPIs) && structuredData.driverKPIs.length > 0) {
      console.log(`Using ${structuredData.driverKPIs.length} extracted driver KPIs from structured storage`);
      return structuredData.driverKPIs;
    }
    
    // Fallback to legacy direct localStorage approach
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      try {
        const parsedData = JSON.parse(legacyData) as ScoreCardData;
        if (parsedData && Array.isArray(parsedData.driverKPIs) && parsedData.driverKPIs.length > 0) {
          console.log(`Using ${parsedData.driverKPIs.length} extracted driver KPIs from legacy storage`);
          return parsedData.driverKPIs;
        }
      } catch (parseError) {
        console.error("Error parsing legacy scorecard data:", parseError);
      }
    }
  } catch (error) {
    console.error("Error retrieving driver KPIs from storage:", error);
  }
  
  // Fallback to empty data if nothing extracted
  return [];
};
