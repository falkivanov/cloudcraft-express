
import { ScoreCardData } from "../../types";

// Empty data for KW 6 2025
export const getWeek6Data = (): ScoreCardData => {
  return {
    week: 6,
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
