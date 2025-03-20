
import { ScoreCardData } from '../../types';
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
  // Default template with empty values
  const data: ScoreCardData = {
    week: weekNum,
    year: new Date().getFullYear(),
    location: extractLocation(companyText) || 'DSU1',
    overallScore: extractOverallScore(companyText) || 85,
    overallStatus: extractOverallStatus(companyText) || 'Great',
    rank: extractRank(companyText) || 5,
    rankNote: extractRankChange(companyText) || 'Up 2 places from last week',
    companyKPIs: extractCompanyKPIs(companyText),
    driverKPIs: extractDriverKPIs(driverText),
    recommendedFocusAreas: extractFocusAreas(companyText),
  };
  
  return data;
};
