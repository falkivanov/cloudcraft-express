
import { DriverKPI } from "../../../types";

export const getDriverKPIs = (): DriverKPI[] => {
  // Check for extracted driver data from both storage formats
  try {
    const extractedData = localStorage.getItem("extractedScorecardData");
    
    if (extractedData) {
      const parsedData = JSON.parse(extractedData);
      if (parsedData && Array.isArray(parsedData.driverKPIs) && parsedData.driverKPIs.length > 0) {
        // Always use the extracted driver data, even if it might be sample data
        // This ensures we don't lose data after extraction
        console.log(`Using ${parsedData.driverKPIs.length} extracted driver KPIs from legacy storage`);
        return parsedData.driverKPIs;
      }
    }
    
    // If not found in legacy storage, check structured storage
    const structuredData = localStorage.getItem("extractedScorecardData");
    if (structuredData) {
      const parsedStructured = JSON.parse(structuredData);
      if (parsedStructured && Array.isArray(parsedStructured.driverKPIs) && parsedStructured.driverKPIs.length > 0) {
        console.log(`Using ${parsedStructured.driverKPIs.length} extracted driver KPIs from structured storage`);
        return parsedStructured.driverKPIs;
      }
    }
  } catch (error) {
    console.error("Error retrieving driver KPIs from storage:", error);
  }
  
  // Fallback to empty data if nothing extracted
  return [];
};
