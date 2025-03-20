
/**
 * Extract location from text content
 */
export const extractLocation = (text: string): string | null => {
  // Look for location pattern (usually DSU1, DSU2, etc.)
  const locationMatch = text.match(/DS[A-Z]\d+/g);
  return locationMatch ? locationMatch[0] : null;
};

/**
 * Extract overall score from text content
 */
export const extractOverallScore = (text: string): number | null => {
  // Look for overall score pattern (usually a number like 85%)
  const scoreMatch = text.match(/Overall\s+Score[:\s]+(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1], 10) : null;
};

/**
 * Extract overall status from text content
 */
export const extractOverallStatus = (text: string): string | null => {
  // Look for status keywords
  if (text.match(/\bfantastic\b/i)) return 'Fantastic';
  if (text.match(/\bgreat\b/i)) return 'Great';
  if (text.match(/\bfair\b/i)) return 'Fair';
  if (text.match(/\bpoor\b/i)) return 'Poor';
  return null;
};

/**
 * Extract rank from text content
 */
export const extractRank = (text: string): number | null => {
  // Look for rank pattern (e.g., "Rank: 5 of 20")
  const rankMatch = text.match(/Rank[:\s]+(\d+)/i);
  return rankMatch ? parseInt(rankMatch[1], 10) : null;
};

/**
 * Extract rank change information
 */
export const extractRankChange = (text: string): string | null => {
  // Look for rank change patterns
  const upMatch = text.match(/up\s+(\d+)\s+places?/i);
  if (upMatch) return `Up ${upMatch[1]} places from last week`;
  
  const downMatch = text.match(/down\s+(\d+)\s+places?/i);
  if (downMatch) return `Down ${downMatch[1]} places from last week`;
  
  return null;
};

/**
 * Extract focus areas from text content
 */
export const extractFocusAreas = (text: string): string[] => {
  // Default focus areas if none found
  const defaultAreas = ['Contact Compliance', 'DNR DPMO'];
  
  // Look for focus area section
  const focusMatch = text.match(/focus\s+areas?:([^]*)(?=\n\n|\n[A-Z])/i);
  if (!focusMatch) return defaultAreas;
  
  // Split by bullet points, commas, or line breaks
  const focusText = focusMatch[1];
  const areas = focusText
    .split(/[•,\n]/)
    .map(area => area.trim())
    .filter(area => area.length > 0);
  
  return areas.length > 0 ? areas : defaultAreas;
};
