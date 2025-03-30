
/**
 * Extract location from text content
 */
export const extractLocation = (text: string): string | null => {
  // Look for location pattern (usually DSU1, DSU2, etc.)
  const locationMatch = text.match(/DS[A-Z]\d+/g);
  return locationMatch ? locationMatch[0] : null;
};

/**
 * Extract overall score from text content - improved with multiple patterns
 */
export const extractOverallScore = (text: string): number | null => {
  // Try multiple patterns to find the overall score
  const patterns = [
    /Overall\s+Score[:\s]+(\d+)/i,
    /Gesamtpunktzahl[:\s]+(\d+)/i,
    /Total\s+Score[:\s]+(\d+)/i,
    /Score[:\s]+(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  // Look for prominent numbers that might be the score
  const prominentNumbers = text.match(/\b([7-9][0-9]|100)\b/g);
  if (prominentNumbers && prominentNumbers.length > 0) {
    // Use the first number in the range 70-100 as a possible score
    return parseInt(prominentNumbers[0], 10);
  }
  
  return null;
};

/**
 * Extract overall status from text content - improved with more status keywords
 */
export const extractOverallStatus = (text: string): string | null => {
  // Look for status keywords with broader patterns
  const statuses = [
    { pattern: /\b(fantastic|ausgezeichnet|excellent)\b/i, value: 'Fantastic' },
    { pattern: /\b(great|sehr gut|very good)\b/i, value: 'Great' },
    { pattern: /\b(fair|gut|good|okay)\b/i, value: 'Fair' },
    { pattern: /\b(poor|schlecht|bad)\b/i, value: 'Poor' }
  ];
  
  for (const status of statuses) {
    if (text.match(status.pattern)) {
      return status.value;
    }
  }
  
  // Determine status based on any extracted score
  const score = extractOverallScore(text);
  if (score !== null) {
    if (score >= 95) return 'Fantastic';
    if (score >= 85) return 'Great';
    if (score >= 75) return 'Fair';
    return 'Poor';
  }
  
  return null;
};

/**
 * Extract rank from text content - improved with multiple patterns
 */
export const extractRank = (text: string): number | null => {
  // Try multiple patterns to find the rank
  const patterns = [
    /Rank[:\s]+(\d+)/i,
    /Platz[:\s]+(\d+)/i,
    /Position[:\s]+(\d+)/i,
    /Ranked\s+(\d+)/i,
    /\b(\d+)\s+von\s+\d+\b/i,  // "X von Y" pattern in German
    /\b(\d+)\s+of\s+\d+\b/i    // "X of Y" pattern in English
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
};

/**
 * Extract rank change information - improved with more patterns
 */
export const extractRankChange = (text: string): string | null => {
  // Try multiple patterns for rank changes
  const upPatterns = [
    /up\s+(\d+)\s+places?/i,
    /\+(\d+)\s+places?/i,
    /verbessert\s+um\s+(\d+)/i,
    /gestiegen\s+um\s+(\d+)/i
  ];
  
  const downPatterns = [
    /down\s+(\d+)\s+places?/i,
    /-(\d+)\s+places?/i,
    /verschlechtert\s+um\s+(\d+)/i,
    /gefallen\s+um\s+(\d+)/i
  ];
  
  // Check all up patterns
  for (const pattern of upPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return `Up ${match[1]} places from last week`;
    }
  }
  
  // Check all down patterns
  for (const pattern of downPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return `Down ${match[1]} places from last week`;
    }
  }
  
  return null;
};

/**
 * Extract focus areas from text content - improved extraction logic
 */
export const extractFocusAreas = (text: string): string[] => {
  // Default focus areas if none found
  const defaultAreas = ['Contact Compliance', 'DNR DPMO'];
  
  // Look for focus area sections with multiple patterns
  const patterns = [
    /focus\s+areas?:([^]*)(?=\n\n|\n[A-Z])/i,
    /schwerpunkte:([^]*)(?=\n\n|\n[A-Z])/i,
    /prioritäten:([^]*)(?=\n\n|\n[A-Z])/i,
    /fokus:([^]*)(?=\n\n|\n[A-Z])/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Split by bullet points, commas, or line breaks
      const areas = match[1]
        .split(/[•,\n-]/)
        .map(area => area.trim())
        .filter(area => area.length > 0);
      
      if (areas.length > 0) {
        return areas;
      }
    }
  }
  
  // Look for known KPI names in the text that might be focus areas
  const commonKPIs = [
    'Contact Compliance',
    'DNR DPMO',
    'Photo-On-Delivery',
    'Delivery Completion Rate',
    'FICO',
    'Vehicle Audit',
    'DVIC Compliance',
    'Customer escalation'
  ];
  
  const foundKPIs = commonKPIs.filter(kpi => 
    text.includes(kpi) && text.indexOf(kpi) > text.length / 2
  );
  
  if (foundKPIs.length > 0) {
    return foundKPIs.slice(0, 3); // Return up to 3 found KPIs
  }
  
  return defaultAreas;
};
