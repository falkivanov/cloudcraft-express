
import { ScoreCardData, ScorecardKPI } from '../../types';
import { extractCompanyKPIs } from './companyKpiExtractor';
import { extractDriverKPIs } from './driverKpiExtractor';
import { 
  extractLocation, 
  extractOverallScore, 
  extractOverallStatus, 
  extractRank, 
  extractRankChange,
  extractFocusAreas
} from './metadataExtractor';

/**
 * Extract structured data from the raw text content
 */
export const extractScorecardData = (
  companyText: string, 
  driverText: string, 
  weekNum: number
): ScoreCardData => {
  console.log("Extracting scorecard data from text");
  console.log("Company text sample:", companyText.substring(0, 150));
  console.log("Driver text sample:", driverText.substring(0, 150));
  
  // Look for location information
  const location = extractLocation(companyText) || 'DSU1';
  console.log("Extracted location:", location);
  
  // Extract overall score with improved extraction
  const overallScore = extractOverallScore(companyText);
  console.log("Extracted overall score:", overallScore);
  
  // Get the rank with improved extraction
  const rank = extractRank(companyText);
  console.log("Extracted rank:", rank);
  
  // Get the rank change note
  const rankNote = extractRankChange(companyText);
  console.log("Extracted rank note:", rankNote);
  
  // Extract KPIs from company text (usually page 2)
  const companyKPIs = extractCompanyKPIs(companyText);
  console.log(`Extracted ${companyKPIs.length} company KPIs`);
  
  // Extract driver metrics from driver text (usually page 3)
  const driverKPIs = extractDriverKPIs(driverText);
  console.log(`Extracted ${driverKPIs.length} driver KPIs`);
  
  // Extract focus areas
  const focusAreas = extractFocusAreas(companyText);
  console.log("Extracted focus areas:", focusAreas);
  
  // Determine status based on overall score
  const overallStatus = extractOverallStatus(companyText);
  console.log("Determined overall status:", overallStatus);
  
  // Categorize the KPIs
  const categorizedKPIs = {
    safety: companyKPIs.filter(kpi => kpi.category === "safety"),
    compliance: companyKPIs.filter(kpi => kpi.category === "compliance"),
    customer: companyKPIs.filter(kpi => kpi.category === "customer"),
    standardWork: companyKPIs.filter(kpi => kpi.category === "standardWork"),
    quality: companyKPIs.filter(kpi => kpi.category === "quality"),
    capacity: companyKPIs.filter(kpi => kpi.category === "capacity")
  };
  
  // Default template with extracted values and fallbacks
  const data: ScoreCardData = {
    week: weekNum,
    year: new Date().getFullYear(),
    location: location,
    overallScore: overallScore || 85,
    overallStatus: overallStatus,
    rank: rank || 5,
    rankNote: rankNote || 'Up 2 places from last week',
    companyKPIs: companyKPIs,
    categorizedKPIs: categorizedKPIs,
    driverKPIs: driverKPIs,
    recommendedFocusAreas: focusAreas,
  };
  
  return data;
};
