
import { ScoreCardData } from "../../../types";
import { getCompanyKPIs } from "./companyKPIs";
import { getDriverKPIs } from "./driverKPIs";
import { getMetadata } from "./metadata";

export const getWeek11Data = (): ScoreCardData => {
  return {
    week: 11,
    year: 2025,
    location: "",
    overallScore: 0,
    overallStatus: "",
    rank: 0,
    rankNote: "",
    companyKPIs: [],
    driverKPIs: [],
    recommendedFocusAreas: [],
    ...getMetadata()
  };
};
