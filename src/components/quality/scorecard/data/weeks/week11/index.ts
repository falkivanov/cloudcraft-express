
import { ScoreCardData } from "../../../types";
import { getCompanyKPIs } from "./companyKPIs";
import { getDriverKPIs } from "./driverKPIs";
import { getMetadata } from "./metadata";

export const getWeek11Data = (): ScoreCardData => {
  const metadata = getMetadata();
  const companyKPIs = getCompanyKPIs();
  const driverKPIs = getDriverKPIs();
  
  return {
    week: 11,
    year: 2025,
    location: metadata.location || "DSU1",
    overallScore: metadata.overallScore || 78.65,
    overallStatus: metadata.overallStatus || "great",
    rank: metadata.rank || 5,
    rankNote: metadata.rankNote || "Down 1 places from last week",
    companyKPIs: companyKPIs,
    driverKPIs: driverKPIs,
    recommendedFocusAreas: metadata.recommendedFocusAreas || [],
    categorizedKPIs: {
      safety: companyKPIs.filter(kpi => kpi.category === "safety"),
      compliance: companyKPIs.filter(kpi => kpi.category === "compliance"),
      customer: companyKPIs.filter(kpi => kpi.category === "customer"),
      standardWork: companyKPIs.filter(kpi => kpi.category === "standardWork"),
      quality: companyKPIs.filter(kpi => kpi.category === "quality"),
      capacity: companyKPIs.filter(kpi => kpi.category === "capacity")
    }
  };
};
