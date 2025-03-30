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
export const extractOverallStatus = (text: string): string => {
  // Check text for status words
  const statusMatches = {
    fantastic: /fantastic|excellent|outstanding/i,
    great: /great|good|well/i,
    fair: /fair|average|okay/i,
    poor: /poor|bad|needs\s+improvement/i
  };
  
  for (const [status, pattern] of Object.entries(statusMatches)) {
    if (pattern.test(text)) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }
  
  // Otherwise determine based on score
  const score = extractOverallScore(text);
  if (score !== null) {
    if (score >= 95) return 'Fantastic';
    if (score >= 85) return 'Great';
    if (score >= 75) return 'Fair';
    return 'Poor';
  }
  
  return 'Fair'; // Default
};

/**
 * Extract rank information with enhanced pattern matching
 */
export const extractRank = (text: string): number | null => {
  // First look for direct rank mentions
  const rankPatterns = [
    /(?:overall\s+)?rank(?:ing)?:?\s*(?:is|=|-)?\s*(\d+)/i,
    /ranked(?:\s+at)?:?\s*(?:#|no\.|number)?\s*(\d+)/i,
    /position:?\s*(?:#|no\.|number)?\s*(\d+)/i,
    /(?:#|no\.|number)\s*(\d+)\s*(?:rank|position)/i,
    /(\d+)(?:st|nd|rd|th)\s+(?:rank|place|position)/i,
    /rank(?:ed)?(?:\s+[^0-9]{0,20})?\s*(\d+)/i,
    /station\s+rank(?:ing)?:?\s*(\d+)/i,
    /rank(?:ing)?\s+(?:among|of|in)\s+stations:?\s*(\d+)/i,
  ];
  
  // Try each rank pattern
  for (const pattern of rankPatterns) {
    const match = text.match(pattern);
    if (match) {
      const rank = parseInt(match[1], 10);
      // Validate the rank (typically between 1-100)
      if (rank > 0 && rank < 100) {
        return rank;
      }
    }
  }
  
  // Look for "out of" patterns (e.g., "rank 5 out of 20")
  const outOfPatterns = [
    /rank(?:ed)?(?:\s+at)?\s*(?:#|no\.|number)?\s*(\d+)\s+out\s+of\s+\d+/i,
    /position(?:\s+at)?\s*(?:#|no\.|number)?\s*(\d+)\s+out\s+of\s+\d+/i,
    /(\d+)(?:st|nd|rd|th)\s+out\s+of\s+\d+/i,
  ];
  
  for (const pattern of outOfPatterns) {
    const match = text.match(pattern);
    if (match) {
      const rank = parseInt(match[1], 10);
      if (rank > 0 && rank < 100) {
        return rank;
      }
    }
  }
  
  // Look for ordinal indicators
  const ordinalPatterns = [
    /(\d+)(?:st|nd|rd|th)/i,
  ];
  
  for (const pattern of ordinalPatterns) {
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      // Only consider if nearby context suggests rank
      const context = text.substring(Math.max(0, match.index! - 30), Math.min(text.length, match.index! + 30));
      if (/rank|position|place|standing/i.test(context)) {
        const rank = parseInt(match[1], 10);
        if (rank > 0 && rank < 100) {
          return rank;
        }
      }
    }
  }
  
  console.warn("Could not extract rank from text");
  return null;
};

/**
 * Extract rank change information with enhanced detection
 */
export const extractRankChange = (text: string): string => {
  // Look for up/down patterns with numbers
  const upMatch = text.match(/up\s+(\d+)(?:\s+places?|positions?)?/i);
  if (upMatch) {
    return `Up ${upMatch[1]} places from last week`;
  }
  
  const downMatch = text.match(/down\s+(\d+)(?:\s+places?|positions?)?/i);
  if (downMatch) {
    return `Down ${downMatch[1]} places from last week`;
  }
  
  // Check for improved/decreased language
  if (/improved|better|higher/i.test(text)) {
    return 'Improved from last week';
  }
  
  if (/decreased|worse|lower/i.test(text)) {
    return 'Decreased from last week';
  }
  
  // Look for new rank indicators
  if (/new\s+rank|first\s+time/i.test(text)) {
    return 'New ranking this week';
  }
  
  // Look for stable rank indicators
  if (/same|stable|unchanged|maintained/i.test(text)) {
    return 'Same position as last week';
  }
  
  return ''; // No change information found
};

/**
 * Extract focus areas with enhanced detection
 */
export const extractFocusAreas = (text: string): string[] => {
  // Define patterns that might indicate focus areas sections
  const focusSectionPatterns = [
    /focus\s+areas?/i,
    /areas\s+(?:of|for)\s+improvement/i,
    /improve\s+(?:on|the)/i,
    /action\s+items/i,
    /priorit(?:y|ies)/i,
    /recommended/i
  ];
  
  // Try to find a section with focus areas
  for (const pattern of focusSectionPatterns) {
    const match = pattern.exec(text);
    if (match) {
      // Get text after the match
      const subsequentText = text.substring(match.index + match[0].length, match.index + match[0].length + 300);
      
      // Look for bullet points or numbered lists
      const bulletItems = subsequentText.match(/(?:•|-|\d+\.|\*|\+|>)\s*([A-Za-z][A-Za-z\s\/\&\.,]+)(?:$|\n)/g);
      if (bulletItems && bulletItems.length > 0) {
        return bulletItems
          .map(item => item.replace(/(?:•|-|\d+\.|\*|\+|>)\s*/, '').trim())
          .filter(item => item.length > 3);
      }
      
      // Look for capitalized phrases that might be focus areas
      const capitalizedItems = subsequentText.match(/([A-Z][A-Za-z\s\/\&\.,]+(?:[A-Z][A-Za-z\s\/\&\.,]+)*)/g);
      if (capitalizedItems && capitalizedItems.length > 0) {
        return capitalizedItems
          .filter(item => item.length > 3 && !/^(The|And|With|Focus|Area|Priority|Action|Item)$/i.test(item))
          .slice(0, 3); // Take max 3 items
      }
      
      // If no structured format, try to extract sentences or phrases
      const sentences = subsequentText.split(/[.!?]\s+/);
      if (sentences.length > 0) {
        return sentences
          .filter(s => s.trim().length > 10 && s.trim().length < 100)
          .slice(0, 2);
      }
    }
  }
  
  // If no focus areas found, try to determine based on KPI performance
  // Look for underperforming KPIs
  const kpiPatterns = [
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%/i, threshold: 90 },
    { name: "Photo-On-Delivery", pattern: /Photo[- ]On[- ]Delivery[:\s]+(\d+(?:\.\d+)?)\s*%/i, threshold: 90 },
    { name: "DNR DPMO", pattern: /DNR[:\s]+(\d+(?:\.\d+)?)/i, threshold: 3000, higher: true }
  ];
  
  const potentialFocusAreas = [];
  
  for (const { name, pattern, threshold, higher } of kpiPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      // Check if this KPI is underperforming (lower than threshold or higher for DPMO)
      if ((higher && value > threshold) || (!higher && value < threshold)) {
        potentialFocusAreas.push(name);
      }
    }
  }
  
  return potentialFocusAreas.length > 0 ? potentialFocusAreas : ['Contact Compliance', 'DNR DPMO'];
};
