
import { ScoreCardData } from '../../../types';
import { extractWeekFromFilename } from '../weekUtils';
import { extractCompanyKPIsFromStructure } from './companyKpiExtractor';
import { extractDriverKPIsFromStructure } from './driver/structural/structuralExtractor';
import { extractFocusAreasFromStructure } from './focus-areas';
import { extractNumericValues } from './valueExtractor';
import { extractDriverKPIsFromText } from './driver/textExtractor';

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
  
  // Extract possible location from title or header (usually on page 1)
  // Look specifically for station codes in common formats
  const locationPattern = /DS[A-Z]\d+|[A-Z]{3}\d+/g;
  const locationMatches = [];
  
  // Search all pages for location
  for (let i = 1; i <= Object.keys(pageData).length; i++) {
    if (pageData[i]?.text) {
      const matches = pageData[i].text.match(locationPattern);
      if (matches) locationMatches.push(...matches);
    }
  }
  
  const location = locationMatches.length > 0 ? locationMatches[0] : 'DSU1';
  
  // Extract overall score - try to find it on every page with focus on page 2
  let overallScore = 0;
  let overallStatus: KPIStatus = "fair";
  
  // First check page 2 which usually has this information
  if (pageData[2]?.text) {
    // Try to find score with various patterns including status
    const scoreStatusPatterns = [
      /(?:overall|total)\s+score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i,
      /score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i,
      /(\d{1,3}(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i,
      /(\d{1,3}(?:\.\d+)?)\s*%?\s*(?:points?|score)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i
    ];
    
    for (const pattern of scoreStatusPatterns) {
      const match = pageData[2].text.match(pattern);
      if (match && match.length >= 3) {
        overallScore = parseFloat(match[1]);
        const statusText = match[2].toLowerCase();
        
        if (statusText === "poor") overallStatus = "poor";
        else if (statusText === "fair") overallStatus = "fair";
        else if (statusText === "great") overallStatus = "great";
        else if (statusText === "fantastic") overallStatus = "fantastic";
        
        console.log(`Found overall score ${overallScore} with status "${overallStatus}"`);
        break;
      }
    }
    
    // If no score with status found, try just the score patterns
    if (overallScore === 0) {
      const scorePatterns = [
        /(?:overall|total)\s+score:?\s*(\d{1,3}(?:\.\d+)?)/i,
        /score:?\s*(\d{1,3}(?:\.\d+)?)/i,
        /(\d{1,3}(?:\.\d+)?)\s*%\s*(?:overall|score)/i,
        /(\d{1,3}(?:\.\d+)?)\s*(?:points?|score)/i
      ];
      
      for (const pattern of scorePatterns) {
        const match = pageData[2].text.match(pattern);
        if (match) {
          overallScore = parseFloat(match[1]);
          break;
        }
      }
    }
    
    // For page 2 items, also look for specific status items near the score
    if (overallScore > 0 && overallStatus === "fair") {
      // Find items near where the score would be
      const scoreItems = pageData[2].items.filter((item: any) => {
        return item.str.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
      });
      
      for (const scoreItem of scoreItems) {
        // Look for items on the same line that might contain status
        const sameLineItems = pageData[2].items.filter((item: any) => {
          return Math.abs(item.y - scoreItem.y) < 5 && item.x > scoreItem.x;
        });
        
        for (const item of sameLineItems) {
          const statusMatch = item.str.match(/(poor|fair|great|fantastic)/i);
          if (statusMatch) {
            const statusText = statusMatch[1].toLowerCase();
            if (statusText === "poor") overallStatus = "poor";
            else if (statusText === "fair") overallStatus = "fair";
            else if (statusText === "great") overallStatus = "great"; 
            else if (statusText === "fantastic") overallStatus = "fantastic";
            break;
          }
        }
      }
    }
    
    // If not found, try to extract numbers followed by % sign that might be the score
    if (overallScore === 0) {
      const percentMatches = pageData[2].text.match(/(\d{1,3}(?:\.\d+)?)\s*%/g);
      if (percentMatches && percentMatches.length > 0) {
        // Filter for numbers that are likely to be overall scores (typically between 60-100)
        const scores = percentMatches
          .map(match => parseFloat(match.replace(/[^0-9.]/g, '')))
          .filter(score => score >= 50 && score <= 100)
          .sort((a, b) => b - a); // Sort descending
        
        if (scores.length > 0) {
          overallScore = scores[0];
        }
      }
    }
  }
  
  // If not found on page 2, check page 1
  if (overallScore === 0 && pageData[1]?.text) {
    const scoreMatch = pageData[1].text.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
    if (scoreMatch) {
      const candidate = parseFloat(scoreMatch[1]);
      if (candidate >= 50 && candidate <= 100) {
        overallScore = candidate;
      }
    }
  }
  
  // Fallback if still no score found
  if (overallScore === 0) {
    overallScore = 85; // Default value
  }
  
  // If no status was found, determine it based on score
  if (overallStatus === "fair") {
    if (overallScore >= 95) overallStatus = "fantastic";
    else if (overallScore >= 85) overallStatus = "great";
    else if (overallScore < 75) overallStatus = "poor";
  }
  
  // Extract rank information - focus on page 2 with specific pattern "Rank at (Station): X"
  let rank = 0;
  let rankNote = '';
  
  if (pageData[2]?.text) {
    // Try the specific pattern mentioned "Rank at (Station): X"
    const rankStationPattern = /Rank\s+at\s+(?:\([^)]*\)|[^:]*):?\s*(\d+)/i;
    const rankStationMatch = pageData[2].text.match(rankStationPattern);
    
    if (rankStationMatch) {
      rank = parseInt(rankStationMatch[1], 10);
      console.log("Found rank with 'Rank at' pattern:", rank);
    } else {
      // Try various other patterns for rank if specific pattern not found
      const rankPatterns = [
        /rank(?:ing)?:?\s*(?:is|=|-)?\s*(\d+)/i,
        /ranked(?:\s+at)?:?\s*(?:#|no\.|number)?\s*(\d+)/i,
        /position:?\s*(?:#|no\.|number)?\s*(\d+)/i,
        /(\d+)(?:st|nd|rd|th)\s+(?:rank|place|position)/i,
        /rank(?:ed)?(?:\s+[^0-9]{0,20})?\s*(\d+)/i,
      ];
      
      for (const pattern of rankPatterns) {
        const match = pageData[2].text.match(pattern);
        if (match) {
          rank = parseInt(match[1], 10);
          console.log("Found rank with alternative pattern:", rank, pattern);
          break;
        }
      }
    }
    
    // Look for rank change indicators
    if (pageData[2].text.match(/up\s+(\d+)/i)) {
      const upMatch = pageData[2].text.match(/up\s+(\d+)/i);
      rankNote = `Up ${upMatch[1]} places from last week`;
    } else if (pageData[2].text.match(/down\s+(\d+)/i)) {
      const downMatch = pageData[2].text.match(/down\s+(\d+)/i);
      rankNote = `Down ${downMatch[1]} places from last week`;
    }
  }
  
  // Check page 1 if rank not found on page 2
  if (rank === 0 && pageData[1]?.text) {
    const rankMatch = pageData[1].text.match(/rank(?:ing)?[:\s]+(\d+)/i);
    if (rankMatch) {
      rank = parseInt(rankMatch[1], 10);
    }
  }
  
  // Fall back to default if no rank found
  if (rank === 0) {
    rank = 5; // Default value
  }
  
  // Extract company KPIs by looking for specific patterns across all pages
  const companyKPIs = extractCompanyKPIsFromStructure(pageData);
  
  // Special handling for BOC (Breach of Contract)
  // Check if BOC exists and update its status correctly
  for (const kpi of companyKPIs) {
    if (kpi.name.includes("Breach of Contract") || kpi.name.includes("BOC")) {
      // BOC should have a status of either "none" or "not in compliance"
      // and we don't care about the numeric value 
      kpi.value = 0; // Reset value to 0
      kpi.target = 0; // Reset target to 0
      
      // Check for status in text like "in compliance" or "not in compliance"
      if (pageData[2]?.text) {
        if (pageData[2].text.toLowerCase().includes("not in compliance")) {
          kpi.status = "not in compliance";
        } else {
          kpi.status = "none"; // Default to "none" (in compliance)
        }
      }
    }
  }
  
  // Try multiple methods to extract driver KPIs and combine the results
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
  
  // Extract focus areas - usually found in a specific section
  const focusAreas = extractFocusAreasFromStructure(pageData);
  
  // Look for recommended focus areas on page 2
  let recommendedFocusAreas = focusAreas;
  if (recommendedFocusAreas.length === 0) {
    // Try to identify focus areas from underperforming KPIs
    recommendedFocusAreas = companyKPIs
      .filter(kpi => kpi.status === 'poor' || kpi.status === 'fair')
      .slice(0, 3)
      .map(kpi => kpi.name);
    
    if (recommendedFocusAreas.length === 0) {
      recommendedFocusAreas = ['Contact Compliance', 'DNR DPMO'];
    }
  }
  
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
    recommendedFocusAreas,
  };
};
