
import { DriverKPI } from "../../../types";

export const getDriverKPIs = (): DriverKPI[] => {
  // Statt leeres Array zurückzugeben, prüfen wir auf gespeicherte extrahierte Daten
  try {
    const extractedData = localStorage.getItem("extractedScorecardData");
    if (extractedData) {
      const parsedData = JSON.parse(extractedData);
      if (parsedData && Array.isArray(parsedData.driverKPIs) && parsedData.driverKPIs.length > 0) {
        console.log(`Using ${parsedData.driverKPIs.length} extracted driver KPIs`);
        return parsedData.driverKPIs;
      }
    }
  } catch (error) {
    console.error("Error retrieving driver KPIs from storage:", error);
  }
  
  // Fallback zu leeren Daten, wenn nichts extrahiert wurde
  return [];
};
