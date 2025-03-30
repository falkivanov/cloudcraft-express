
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
  // First, look specifically for "Overall Score" on page 2
  const overallScorePatterns = [
    /Overall\s+Score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Overall\s+Score\s+of:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Scorecard\s+Score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
    /Total\s+Score:?\s*(\d{1,3}(?:\.\d+)?)\s*%?/i,
  ];
  
  // Try each overall score pattern
  for (const pattern of overallScorePatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Next look for patterns where overall score is mentioned near percentage
  const nearbyPatterns = [
    /Overall(?:\s+[\w\s]+){0,5}:?\s*(\d{1,3}(?:\.\d+)?)\s*%/i,
    /Score(?:\s+[\w\s]+){0,5}:?\s*(\d{1,3}(?:\.\d+)?)\s*%/i,
    /Total(?:\s+[\w\s]+){0,5}:?\s*(\d{1,3}(?:\.\d+)?)\s*%/i,
  ];
  
  // Try nearby patterns
  for (const pattern of nearbyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Try to find patterns like "XX% Overall"
  const percentFirstPatterns = [
    /(\d{1,3}(?:\.\d+)?)\s*%\s*(?:Overall|Total|Scorecard)/i,
  ];
  
  for (const pattern of percentFirstPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Alternative approach: find all percentages and take the most prominent (likely to be the overall score)
  const percentMatches = text.match(/(\d{2,3}(?:\.\d+)?)\s*%/g);
  if (percentMatches && percentMatches.length > 0) {
    // Sort by length (longer numbers first) and then by value (larger numbers first)
    const sortedMatches = percentMatches
      .map(match => {
        const value = parseFloat(match.replace(/[^0-9.]/g, ''));
        return { match, value };
      })
      .sort((a, b) => {
        // Prioritize values between 70 and 100 as they're likely to be overall scores
        const aInRange = a.value >= 70 && a.value <= 100;
        const bInRange = b.value >= 70 && b.value <= 100;
        
        if (aInRange && !bInRange) return -1;
        if (!aInRange && bInRange) return 1;
        
        // Then sort by value (higher first)
        return b.value - a.value;
      });
      
    if (sortedMatches.length > 0) {
      return sortedMatches[0].value;
    }
  }
  
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
  // First, try to find the exact rank patterns
  const exactRankPatterns = [
    /Overall\s+Rank:?\s*(\d+)/i,
    /Rank:?\s*(\d+)/i,
    /Ranked:?\s*(\d+)/i,
    /Position:?\s*(\d+)/i,
  ];
  
  // Try each pattern in order
  for (const pattern of exactRankPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  // Try looking for patterns where rank is mentioned with ordinal indicators
  const ordinalPatterns = [
    /(\d+)(?:st|nd|rd|th)\s+(?:place|position|rank)/i,
    /placed\s+(\d+)(?:st|nd|rd|th)/i,
    /ranked\s+(\d+)(?:st|nd|rd|th)/i
  ];
  
  for (const pattern of ordinalPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  // Look for the pattern "rank X out of Y"
  const rankOutOfPatterns = [
    /rank\s+(\d+)\s+out\s+of\s+\d+/i,
    /ranked\s+(\d+)\s+out\s+of\s+\d+/i,
    /position\s+(\d+)\s+out\s+of\s+\d+/i
  ];
  
  for (const pattern of rankOutOfPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  // Try more generic patterns with numbers near rank-related words
  const nearbyRankPatterns = [
    /rank(?:\s+[\w\s]+){0,3}:?\s*(\d+)/i,
    /position(?:\s+[\w\s]+){0,3}:?\s*(\d+)/i,
    /(\d+)(?:\s+[\w\s]+){0,3}\s+rank/i
  ];
  
  for (const pattern of nearbyRankPatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
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
