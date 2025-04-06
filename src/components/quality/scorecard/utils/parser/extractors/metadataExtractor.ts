
/**
 * Extract location information from text
 */
export const extractLocation = (text: string): string | null => {
  // Look for location pattern: DSX# or other station codes
  const locationMatch = text.match(/\b(DS[A-Z]\d+|[A-Z]{3}\d+)\b/);
  return locationMatch ? locationMatch[1] : null;
};

/**
 * Extract overall score from text with enhanced pattern matching
 */
export const extractOverallScore = (text: string): number | null => {
  // First, try to find score patterns specifically labeled as "Overall Score"
  const overallScorePatterns = [
    /Overall\s+Score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Overall\s+Score\s+of:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Scorecard\s+Score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Total\s+Score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Overall(?:\s+[^:]*):?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Score(?:\s+[^:]*):?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
  ];
  
  // Try each overall score pattern
  for (const pattern of overallScorePatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Try looking for patterns where a number is followed by a % sign
  // and is near words like "score", "overall", "total", etc.
  const scoreContextPatterns = [
    /(\d{1,3}(?:\.\d+)?)\s*%\s*(?:overall|total|score)/i,
    /(\d{1,3}(?:\.\d+)?)\s*points?\s*(?:overall|total|score)/i,
    /score\s*(?:of|is|=)?\s*(\d{1,3}(?:\.\d+)?)/i,
    /(\d{1,3}(?:\.\d+)?)\s*(?:points?|score)/i,
  ];
  
  for (const pattern of scoreContextPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Look for numbers in specific ranges that are likely to be overall scores
  // (typically between 0-100 for percentages)
  const percentMatches = text.match(/(\d{1,3}(?:\.\d+)?)\s*%/g);
  if (percentMatches && percentMatches.length > 0) {
    // Look for scores in the range that's likely to be an overall score (e.g., 60-100)
    const scores = percentMatches
      .map(match => parseFloat(match.replace(/[^0-9.]/g, '')))
      .filter(value => value >= 50 && value <= 100) // Most overall scores fall in this range
      .sort((a, b) => b - a); // Sort descending
    
    if (scores.length > 0) {
      return scores[0]; // Return the highest score in the expected range
    }
  }
  
  // If no percentage found, look for standalone numbers that might be scores
  const potentialScores = text.match(/\b(\d{1,3}(?:\.\d+)?)\b/g);
  if (potentialScores && potentialScores.length > 0) {
    const scores = potentialScores
      .map(match => parseFloat(match))
      .filter(value => value >= 50 && value <= 100) // Filter to likely score range
      .sort((a, b) => b - a); // Sort descending
    
    if (scores.length > 0) {
      return scores[0]; // Return the highest score in the expected range
    }
  }
  
  console.warn("Could not extract overall score from text");
  return null;
};

/**
 * Determine overall status based on score
 */
export const extractOverallStatus = (score: number | null): string => {
  // If score is null, return default
  if (score === null) {
    return 'Fair';
  }
  
  // Determine status based on score
  if (score >= 95) return 'Fantastic';
  if (score >= 85) return 'Great';
  if (score >= 75) return 'Fair';
  return 'Poor';
};

/**
 * Extract rank information with enhanced pattern matching
 */
export const extractRank = (text: string): number | null => {
  // Look for rank pattern with various formats
  const rankPatterns = [
    /rank:?\s*(\d+)/i,
    /ranking:?\s*(\d+)/i,
    /position:?\s*(\d+)/i,
    /place:?\s*(\d+)/i,
    /ranked\s*(?:at\s*)?(\d+)/i
  ];
  
  for (const pattern of rankPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  // Look for ordinal patterns like "5th" or "3rd place"
  const ordinalPattern = /(\d+)(?:st|nd|rd|th)(?:\s+place)?/i;
  const ordinalMatch = text.match(ordinalPattern);
  if (ordinalMatch) {
    return parseInt(ordinalMatch[1]);
  }
  
  return null;
};

/**
 * Extract rank change information
 */
export const extractRankChange = (text: string): number | null => {
  // Look for rank change patterns
  const upPattern = /up\s+(\d+)\s+(?:place|rank|position)/i;
  const upMatch = text.match(upPattern);
  if (upMatch) {
    return parseInt(upMatch[1]);
  }
  
  const downPattern = /down\s+(\d+)\s+(?:place|rank|position)/i;
  const downMatch = text.match(downPattern);
  if (downMatch) {
    return -parseInt(downMatch[1]);
  }
  
  return null;
};

/**
 * Extract focus areas based on text content
 */
export const extractFocusAreas = (text: string): string[] => {
  const focusAreas = [];
  
  // Common focus area phrases
  const focusPatterns = [
    /focus\s+(?:on|area)?\s*:?\s*([^.,:;]+)/i,
    /priorities?\s*:?\s*([^.,:;]+)/i,
    /improvement\s+(?:area|needed)\s*:?\s*([^.,:;]+)/i
  ];
  
  for (const pattern of focusPatterns) {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      // Split by commas or "and" if multiple areas mentioned
      const areas = matches[1].split(/,|\sand\s/).map(area => area.trim());
      focusAreas.push(...areas.filter(area => area.length > 0));
    }
  }
  
  return focusAreas;
};
