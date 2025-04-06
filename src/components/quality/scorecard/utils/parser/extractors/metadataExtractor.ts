
/**
 * Extract location from text content
 */
export function extractLocation(text: string): string {
  const locationRegex = /Location:\s*([A-Z0-9]+)/i;
  const match = text.match(locationRegex);
  return match ? match[1].trim() : "DSP";
}

/**
 * Extract overall score from text content
 */
export function extractOverallScore(text: string): number {
  const scoreRegex = /Overall\s+Score:?\s*(\d+(?:\.\d+)?)/i;
  const match = text.match(scoreRegex);
  return match ? parseFloat(match[1]) : 75;
}

/**
 * Determine the overall status based on the score
 */
export function extractOverallStatus(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  return "Needs Improvement";
}

/**
 * Extract rank from text content
 */
export function extractRank(text: string): number {
  const rankRegex = /Rank:?\s*(\d+)\s*(?:of|\/)\s*\d+/i;
  const match = text.match(rankRegex);
  return match ? parseInt(match[1]) : 10;
}

/**
 * Extract rank change from text content
 */
export function extractRankChange(text: string): number {
  const changeRegex = /(?:Change|Δ):?\s*([-+]?\d+)/i;
  const match = text.match(changeRegex);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Extract focus areas from text content
 */
export function extractFocusAreas(text: string): string[] {
  const focusAreaRegex = /Focus\s+Areas?:(.*?)(?:\n\n|\n[A-Z]|$)/is;
  const match = text.match(focusAreaRegex);
  
  if (match) {
    // Split the matched text by line breaks or commas
    return match[1].split(/[,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 3);
  }
  
  return [];
}
