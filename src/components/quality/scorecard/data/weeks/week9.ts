
import { ScoreCardData } from "../../types";

// Empty data for KW 9 2025
export const getWeek9Data = (): ScoreCardData => {
  return {
    week: 9,
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
