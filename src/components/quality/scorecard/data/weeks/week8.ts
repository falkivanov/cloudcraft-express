
import { ScoreCardData } from "../../types";

// Empty data for KW 8 2025
export const getWeek8Data = (): ScoreCardData => {
  return {
    week: 8,
    year: 2025,
    location: "",
    overallScore: 0,
    overallStatus: "",
    rank: 0,
    rankNote: "",
    companyKPIs: [],
    driverKPIs: [],
    recommendedFocusAreas: [],
    sectionRatings: {
      complianceAndSafety: "",
      qualityAndSWC: "",
      capacity: ""
    }
  };
};
