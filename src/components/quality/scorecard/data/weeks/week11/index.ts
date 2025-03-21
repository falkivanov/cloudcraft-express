
import { ScoreCardData } from "../../../types";
import { getCompanyKPIs } from "./companyKPIs";
import { getDriverKPIs } from "./driverKPIs";
import { getMetadata } from "./metadata";

export const getWeek11Data = (): ScoreCardData => {
  return {
    week: 11,
    year: 2025,
    location: "DSU1",
    overallScore: 83.63,
    overallStatus: "Fantastic",
    rank: 1,
    rankNote: "Up 5 places from last week",
    companyKPIs: getCompanyKPIs(),
    driverKPIs: getDriverKPIs(),
    recommendedFocusAreas: [
      "Delivery Completion Rate (DCR)",
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance"
    ],
    ...getMetadata()
  };
};
