
import { ScoreCardData } from '../../../types';
import { extractWeekFromFilename } from '../weekUtils';
import { extractCompanyKPIsFromStructure } from './companyKpiExtractor';
import { extractDriverKPIsFromStructure } from './driverKpiExtractor';
import { extractFocusAreasFromStructure } from './focusAreasExtractor';
import { extractNumericValues } from './valueExtractor';

/**
 * Extract scorecard data from a PDF based on structural analysis
 * @param pageData Object containing extracted page data with positions
 * @param filename The PDF filename for week extraction
 * @returns Structured ScoreCardData based on positional analysis
 */
export const extractStructuredScorecard = (pageData: Record<number, any>, filename: string): ScoreCardData => {
  const weekNum = extractWeekFromFilename(filename);
  const currentYear = new Date().getFullYear();
  
  // Extract possible location from title or header (usually on page 1)
  const locationPattern = /DS[A-Z]\d+|[A-Z]{3}\d+/g;
  const locationMatches = pageData[1]?.text.match(locationPattern);
  const location = locationMatches ? locationMatches[0] : 'DSU1';
  
  // Extract overall score (usually a prominent number on page 1)
  const scoreMatches = pageData[1]?.text.match(/(\d{2,3})(\s*%|\s*points|\s*score)/i);
  const overallScore = scoreMatches ? parseInt(scoreMatches[1], 10) : 85;
  
  // Determine status based on score
  let overallStatus = 'Fair';
  if (overallScore >= 95) overallStatus = 'Fantastic';
  else if (overallScore >= 85) overallStatus = 'Great';
  else if (overallScore < 75) overallStatus = 'Poor';
  
  // Extract rank information
  const rankMatches = pageData[1]?.text.match(/rank\D*(\d+)/i);
  const rank = rankMatches ? parseInt(rankMatches[1], 10) : 5;
  
  // Try to find rank change information
  let rankNote = '';
  if (pageData[1]?.text.match(/up\s+(\d+)/i)) {
    const upMatch = pageData[1]?.text.match(/up\s+(\d+)/i);
    rankNote = upMatch ? `Up ${upMatch[1]} places from last week` : '';
  } else if (pageData[1]?.text.match(/down\s+(\d+)/i)) {
    const downMatch = pageData[1]?.text.match(/down\s+(\d+)/i);
    rankNote = downMatch ? `Down ${downMatch[1]} places from last week` : '';
  }
  
  // Extract company KPIs by looking for specific patterns across all pages
  const companyKPIs = extractCompanyKPIsFromStructure(pageData);
  
  // Extract driver KPIs from typically page 2 or 3
  const driverKPIs = extractDriverKPIsFromStructure(pageData);
  
  // Extract focus areas - usually found in a specific section
  const focusAreas = extractFocusAreasFromStructure(pageData);
  
  return {
    week: weekNum,
    year: currentYear,
    location,
    overallScore,
    overallStatus,
    rank,
    rankNote,
    companyKPIs,
    driverKPIs,
    recommendedFocusAreas: focusAreas.length > 0 ? focusAreas : ['Contact Compliance', 'DNR DPMO'],
  };
};
