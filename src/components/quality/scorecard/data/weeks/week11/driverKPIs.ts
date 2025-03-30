
import { DriverKPI, ScoreCardData } from "../../../types";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";

export const getDriverKPIs = (): DriverKPI[] => {
  // Use a consistent approach to check for data
  try {
    // First check using the structured storage approach
    const structuredData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    if (structuredData && Array.isArray(structuredData.driverKPIs) && structuredData.driverKPIs.length > 0) {
      console.log(`Using ${structuredData.driverKPIs.length} extracted driver KPIs from structured storage`);
      
      // Only trust the storage data if we have more than 1 driver or if it's not sample data
      const shouldUseSavedData = structuredData.driverKPIs.length > 1 || !structuredData.isSampleData;
      if (shouldUseSavedData) {
        return structuredData.driverKPIs;
      } else {
        console.log("Found only 1 driver in storage that looks like sample data, generating more sample data");
      }
    }
    
    // Fallback to legacy direct localStorage approach
    const legacyData = localStorage.getItem("extractedScorecardData");
    if (legacyData) {
      try {
        const parsedData = JSON.parse(legacyData) as ScoreCardData;
        if (parsedData && Array.isArray(parsedData.driverKPIs) && parsedData.driverKPIs.length > 1) {
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
  
  // Fallback to sample data if nothing extracted or only 1 driver found
  return generateSampleDrivers();
};

// Generate more diverse sample driver data if the real data couldn't be extracted
const generateSampleDrivers = (): DriverKPI[] => {
  const driverIds = [
    "AW3332YL5B5OX", "A3DIG631DG25QY", "A2V82R55OSFX13", 
    "A10PTSFT1G664", "AKLXATMRADBNI", "A35YAZ4QX53UUC",
    "A2NPJR1DNCQSWT", "A3NRSY7GUNAC6L", "A81RBHQXDC55B",
    "A1ON8E0ODQHBPK", "A2QQ7SAZ5YNVFY", "TR-001", "TR-002", "TR-003"
  ];
  
  return driverIds.map((driverId, index) => {
    const delivered = 95 + (index % 5);
    const dcr = 97 + (index % 3);
    const dnrDpmo = 1500 - (index * 100);
    
    return {
      name: driverId,
      status: "active",
      metrics: [
        {
          name: "Delivered",
          value: delivered,
          target: 0,
          unit: "",
          status: delivered > 98 ? "fantastic" : "great"
        },
        {
          name: "DCR",
          value: dcr,
          target: 98.5,
          unit: "%",
          status: dcr >= 98.5 ? "fantastic" : "fair"
        },
        {
          name: "DNR DPMO",
          value: dnrDpmo,
          target: 1500,
          unit: "DPMO",
          status: dnrDpmo < 1200 ? "fantastic" : "great"
        }
      ]
    };
  });
};
