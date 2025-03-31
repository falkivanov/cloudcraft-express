
import { ScoreCardData } from '../../../../types';
import { extractWeekFromFilename } from '../../weekUtils';
import { extractBOC } from './bocExtractor';
import { extractLocation } from './locationExtractor';
import { extractOverallScore } from './scoreExtractor';
import { extractRankInfo } from './rankExtractor';
import { extractCompanyKPIsFromStructure } from '../companyKpiExtractor';
import { extractDriverKPIsFromStructure } from '../driver/structural/structuralExtractor';
import { extractFocusAreasFromStructure } from '../focus-areas';
import { extractDriverKPIsFromText } from '../driver/textExtractor';

export type KPIStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Extract scorecard data from a PDF based on structural analysis
 * @param pageData Object containing extracted page data with positions
 * @param filename The PDF filename for week extraction
 * @returns Structured ScoreCardData based on positional analysis
 */
export const extractStructuredScorecard = (pageData: Record<number, any>, filename: string): ScoreCardData => {
  const weekNum = extractWeekFromFilename(filename);
  const currentYear = new Date().getFullYear();
  
  // Extract location
  const location = extractLocation(pageData);
  
  // Extract overall score and status
  const { overallScore, overallStatus } = extractOverallScore(pageData);
  
  // Extract rank information
  const { rank, rankNote } = extractRankInfo(pageData);
  
  // Extract company KPIs
  const companyKPIs = extractCompanyKPIsFromStructure(pageData);
  
  // Special handling for BOC (Breach of Contract)
  extractBOC(pageData, companyKPIs);
  
  // Extract driver KPIs
  let driverKPIs = extractDriverKPIsFromStructure(pageData);
  
  // If structural extraction didn't find many drivers, try text-based extraction
  if (driverKPIs.length < 10) {
    console.log("Structural extraction found few drivers, trying text-based extraction");
    
    // Combine all page texts for better context
    const combinedText = Object.values(pageData)
      .map(page => page.text || "")
      .join("\n\n");
    
    const textExtractedDrivers = extractDriverKPIsFromText(combinedText);
    
    // If text extraction found more drivers, use those instead
    if (textExtractedDrivers.length >= 10 || textExtractedDrivers.length > driverKPIs.length * 2) {
      console.log(`Text-based extraction found ${textExtractedDrivers.length} drivers (vs. ${driverKPIs.length} from structural), using text-based results`);
      driverKPIs = textExtractedDrivers;
    } else {
      console.log(`Keeping structural extraction (${driverKPIs.length} drivers) since text-based only found ${textExtractedDrivers.length} drivers`);
    }
  }
  
  // Extract focus areas
  const focusAreas = extractFocusAreasFromStructure(pageData);
  
  // Create categorized KPIs
  const categorizedKPIs = {
    safety: companyKPIs.filter(kpi => kpi.category === "safety"),
    compliance: companyKPIs.filter(kpi => kpi.category === "compliance"),
    customer: companyKPIs.filter(kpi => kpi.category === "customer"),
    standardWork: companyKPIs.filter(kpi => kpi.category === "standardWork"),
    quality: companyKPIs.filter(kpi => kpi.category === "quality"),
    capacity: companyKPIs.filter(kpi => kpi.category === "capacity")
  };
  
  return {
    week: weekNum,
    year: currentYear,
    location,
    overallScore,
    overallStatus,
    rank,
    rankNote,
    companyKPIs,
    categorizedKPIs,
    driverKPIs,
    recommendedFocusAreas: focusAreas,
  };
};
