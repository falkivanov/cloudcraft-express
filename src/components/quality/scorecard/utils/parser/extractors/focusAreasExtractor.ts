
/**
 * Extract focus areas from PDF content
 */
export const extractFocusAreasFromStructure = (pageData: Record<number, any>) => {
  // Focus areas are typically on page 2, at the bottom
  if (!pageData[2]) {
    console.log("Page 2 not available for focus area extraction");
    return getFallbackFocusAreas();
  }
  
  const page = pageData[2];
  console.log(`Analyzing page 2 for focus areas with ${page.items.length} items`);
  
  // First, sort items by y-position (top to bottom)
  const sortedItems = [...page.items].sort((a, b) => b.y - a.y);
  
  // Look for focus area section headers near the bottom of the page
  const focusHeaders = sortedItems.filter(item => {
    const itemText = item.str.toLowerCase().trim();
    return (
      // Look for header phrases that indicate focus areas
      (itemText.includes('focus area') || 
       itemText.includes('to improve') || 
       itemText.includes('improvement') || 
       itemText.includes('priority') || 
       itemText.includes('action item') ||
       itemText.includes('recommend')) &&
      // Check if it's in the bottom third of the page
      item.y < (page.height * 0.7)
    );
  });
  
  if (focusHeaders.length > 0) {
    console.log("Found potential focus area headers:", 
      focusHeaders.map(h => `"${h.str}" at y=${h.y}`).join(', '));
    
    // For each potential header, look for items below it
    for (const header of focusHeaders) {
      // Get items below the focus area header, within a reasonable distance
      const itemsBelow = sortedItems.filter(item => 
        item.y < header.y && 
        item.y > header.y - 200 && // Look within 200 units below the header
        item !== header
      );
      
      if (itemsBelow.length === 0) continue;
      
      console.log(`Found ${itemsBelow.length} items below "${header.str}"`);
      
      // Process items below to extract focus areas
      const potentialAreas = extractAreasFromItems(itemsBelow);
      
      if (potentialAreas.length > 0) {
        console.log("Extracted focus areas from below header:", potentialAreas);
        return cleanFocusAreas(potentialAreas);
      }
    }
  }
  
  // If no headers found, try looking at items in the bottom quarter of the page
  console.log("No focus area headers found, checking bottom section of page");
  
  const bottomPageItems = sortedItems.filter(item => 
    item.y < (page.height * 0.4) && // Bottom 40% of page
    item.str.trim().length > 3 // Must have meaningful content
  );
  
  if (bottomPageItems.length > 0) {
    // Group items that are close to each other vertically
    const groupedItems = groupItemsByVerticalProximity(bottomPageItems);
    
    // For each group, see if it contains bullet points or numbered items
    for (const group of groupedItems) {
      const potentialAreas = extractAreasFromItems(group);
      if (potentialAreas.length > 0) {
        console.log("Extracted focus areas from bottom page group:", potentialAreas);
        return cleanFocusAreas(potentialAreas);
      }
    }
  }
  
  // If still not found, try checking specific KPI names directly in the page
  console.log("Checking for common KPI names in page 2 text");
  const commonKPIs = [
    "Contact Compliance", 
    "Photo-On-Delivery", 
    "DNR DPMO", 
    "Customer escalation",
    "Working Hours Compliance",
    "Delivery Completion Rate",
    "Mentor Adoption Rate",
    "Safe Driving",
    "Next Day Capacity"
  ];
  
  // Check if page text contains any of these KPIs
  if (page.text) {
    const foundKPIs = commonKPIs.filter(kpi => 
      page.text.includes(kpi)
    );
    
    if (foundKPIs.length > 0) {
      console.log("Found common KPIs in page text:", foundKPIs);
      return cleanFocusAreas(foundKPIs);
    }
  }
  
  // Try page 1 if page 2 doesn't yield results
  if (pageData[1]) {
    console.log("Trying to extract focus areas from page 1");
    const page1 = pageData[1];
    
    if (page1.text) {
      // Look for KPI mentions in page 1
      const foundKPIs = commonKPIs.filter(kpi => 
        page1.text.includes(kpi)
      );
      
      if (foundKPIs.length > 0) {
        console.log("Found common KPIs in page 1 text:", foundKPIs);
        return cleanFocusAreas(foundKPIs);
      }
    }
  }
  
  console.log("Could not find focus areas, using fallback");
  return getFallbackFocusAreas();
};

/**
 * Extracts focus areas from a list of PDF items
 */
function extractAreasFromItems(items: any[]) {
  const potentialAreas = [];
  
  for (const item of items) {
    const text = item.str.trim();
    
    // Skip very short strings or pure numbers
    if (text.length < 3 || /^\d+$/.test(text) || /^[0-9.]+%$/.test(text)) {
      continue;
    }
    
    // Look for bullet points, numbers, or KPI-like text
    if (
      /^[•\-*]/.test(text) || // Starts with bullet
      /^\d+\./.test(text) ||  // Numbered list
      /^[A-Z]/.test(text) ||  // Starts with capital letter
      isLikelyKPI(text)       // Resembles a KPI name
    ) {
      // Clean up the text
      let cleanText = text
        .replace(/^[•\-*\d\.]+\s*/, '') // Remove bullets or numbers
        .replace(/^\s*–\s*/, '')        // Remove dashes
        .replace(/%.*$/, '')            // Remove percentage and anything after
        .trim();
      
      // Skip common words that aren't focus areas
      if (
        cleanText.length > 3 && 
        !/^(the|and|area|focus|priority|action|item)$/i.test(cleanText) &&
        !potentialAreas.includes(cleanText)
      ) {
        potentialAreas.push(cleanText);
        console.log("Added potential focus area:", cleanText);
      }
    }
  }
  
  return potentialAreas;
}

/**
 * Group items that are close to each other vertically
 */
function groupItemsByVerticalProximity(items: any[]) {
  const groups: any[][] = [];
  let currentGroup: any[] = [];
  let lastY = -1;
  
  // Sort by y-position (top to bottom)
  const sortedItems = [...items].sort((a, b) => b.y - a.y);
  
  for (const item of sortedItems) {
    if (lastY === -1 || Math.abs(item.y - lastY) < 20) {
      // Items close together go in the same group
      currentGroup.push(item);
    } else {
      // Start a new group
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [item];
    }
    lastY = item.y;
  }
  
  // Add the last group if it has items
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
}

/**
 * Clean and limit focus areas to the top 3
 */
function cleanFocusAreas(areas: string[]) {
  // Remove duplicates and limit to 3
  return [...new Set(areas)]
    .filter(area => isLikelyKPI(area))
    .slice(0, 3);
}

/**
 * Check if text resembles a KPI name
 */
function isLikelyKPI(text: string) {
  if (!text) return false;
  
  // Clean the text
  const cleanText = text.trim().toLowerCase();
  
  // Skip percentage values or status words
  if (/^\d+%$/.test(cleanText) || 
      /^(good|great|fair|poor|fantastic)$/i.test(cleanText)) {
    return false;
  }
  
  // Common KPI keywords
  const kpiKeywords = [
    'compliance', 'rate', 'adoption', 'dpmo', 'capacity', 
    'reliability', 'delivery', 'received', 'photo', 'contact',
    'escalation', 'feedback', 'audit', 'mentor', 'safe', 'driving',
    'hours', 'completion'
  ];
  
  // Check if any keyword is part of the text
  return kpiKeywords.some(keyword => cleanText.includes(keyword));
}

/**
 * Return fallback focus areas when extraction fails
 */
function getFallbackFocusAreas() {
  return ['Contact Compliance', 'DNR DPMO', 'Photo-On-Delivery'];
}
