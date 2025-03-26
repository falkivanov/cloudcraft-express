
import { ScoreCardData } from "../../types";

// Empty data for KW 7 2025
export const getWeek7Data = (): ScoreCardData => {
  return {
    week: 7,
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
