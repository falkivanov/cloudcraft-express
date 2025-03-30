
/**
 * Extract focus areas from PDF content
 */
export const extractFocusAreasFromStructure = (pageData: Record<number, any>) => {
  // Focus areas are typically on page 1 or 2, but prioritize page 2
  const relevantPages = [2, 1].filter(num => pageData[num]);
  
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    
    // Look for sections that might contain focus areas
    const focusKeywords = [
      'focus areas?', 'improvement', 'bereich', 'to improve', 
      'action items?', 'priority', 'recommended'
    ];
    const focusPattern = new RegExp(focusKeywords.join('|'), 'i');
    
    // Find items that might indicate focus areas sections
    const focusItems = page.items.filter((item: any) => 
      focusPattern.test(item.str)
    );
    
    for (const focusItem of focusItems) {
      console.log("Found potential focus area header:", focusItem.str);
      
      // Get items below the focus area header
      const belowItems = page.items.filter((item: any) => 
        item.y < focusItem.y && 
        item.y > focusItem.y - 150 && // Increased range to catch more items
        item.x > focusItem.x - 50     // Items roughly aligned or indented
      );
      
      // Sort by y-position (top to bottom)
      belowItems.sort((a: any, b: any) => b.y - a.y);
      
      // Look for bullet points or numbered lists
      const potentialAreas = [];
      let lastY = -1;
      
      for (const item of belowItems) {
        const trimmedText = item.str.trim();
        
        // Skip if the item is too similar to the header or too short
        if (
          trimmedText.length < 3 || 
          focusPattern.test(trimmedText) ||
          /^\d+$/.test(trimmedText) // Just a number
        ) {
          continue;
        }
        
        // Look for bullet point items or capitalized phrases
        if (
          /^[•\-*]/.test(trimmedText) || // Starts with bullet
          /^\d+\./.test(trimmedText) ||  // Numbered list
          /^[A-Z]/.test(trimmedText)     // Starts with capital letter
        ) {
          // Clean up the text
          let cleanText = trimmedText
            .replace(/^[•\-*\d\.]+\s*/, '') // Remove bullets or numbers
            .replace(/^\s*–\s*/, '')        // Remove dashes
            .trim();
          
          // Skip common words that aren't focus areas
          if (
            cleanText.length > 3 && 
            !/^(the|and|area|focus|priority|action|item)$/i.test(cleanText)
          ) {
            potentialAreas.push(cleanText);
            console.log("Added potential focus area:", cleanText);
          }
        }
        
        // If we have 3 or more items, we're probably good
        if (potentialAreas.length >= 3) {
          break;
        }
        
        lastY = item.y;
      }
      
      if (potentialAreas.length > 0) {
        return potentialAreas.slice(0, 3); // Return max 3 focus areas
      }
    }
  }
  
  console.log("No focus areas found through structure analysis");
  
  // If we couldn't find focus areas from structure, try to extract from text content
  for (const pageNum of relevantPages) {
    if (!pageData[pageNum]?.text) continue;
    
    const text = pageData[pageNum].text;
    
    // Try to find section with focus areas
    const focusKeywords = [
      'focus areas?', 'improvement', 'to improve', 
      'action items?', 'priority', 'recommended'
    ];
    
    for (const keyword of focusKeywords) {
      const pattern = new RegExp(`${keyword}[^.]*\\s*((?:\\s*[-•*]\\s*[^.\\n]+[.\\n])+)`, 'i');
      const match = text.match(pattern);
      
      if (match && match[1]) {
        // Found a section with potential bullet points
        const bulletItems = match[1].split(/[-•*]\s*/)
          .map(item => item.trim())
          .filter(item => item.length > 3);
        
        if (bulletItems.length > 0) {
          console.log("Found focus areas from text bullet points:", bulletItems);
          return bulletItems.slice(0, 3);
        }
      }
    }
    
    // Look for specific common focus areas in the text
    const commonFocusAreas = [
      'Contact Compliance',
      'Photo-On-Delivery',
      'DNR DPMO',
      'Customer escalation',
      'Working Hours Compliance',
      'Delivery Completion Rate',
      'Mentor Adoption Rate',
      'Safe Driving'
    ];
    
    const foundAreas = commonFocusAreas.filter(area => 
      new RegExp(`\\b${area.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text)
    );
    
    if (foundAreas.length > 0) {
      console.log("Found focus areas by keyword matching:", foundAreas);
      return foundAreas.slice(0, 3);
    }
  }
  
  // Fallback focus areas
  return ['Contact Compliance', 'DNR DPMO', 'Photo-On-Delivery'];
};
