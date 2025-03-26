
import { ScoreCardData } from "../../types";

// Empty data for KW 10 2025
export const getWeek10Data = (): ScoreCardData => {
  return {
    week: 10,
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
