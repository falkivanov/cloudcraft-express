
import { KPIStatus } from './mainExtractor';

/**
 * Extract overall score and status from PDF content
 */
export function extractOverallScore(pageData: Record<number, any>): { overallScore: number, overallStatus: KPIStatus } {
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
  
  return { overallScore, overallStatus };
}
