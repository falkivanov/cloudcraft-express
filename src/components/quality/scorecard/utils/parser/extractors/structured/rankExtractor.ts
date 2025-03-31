
/**
 * Extract rank information from PDF content
 */
export function extractRankInfo(pageData: Record<number, any>): { rank: number, rankNote: string } {
  let rank = 0;
  let rankNote = '';
  
  // Extract rank information - focus on page 2 with specific pattern "Rank at (Station): X"
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
  
  return { rank, rankNote };
}
