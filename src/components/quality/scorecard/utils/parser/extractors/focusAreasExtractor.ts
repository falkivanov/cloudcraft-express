
/**
 * Extract focus areas from PDF content
 */
export const extractFocusAreasFromStructure = (pageData: Record<number, any>) => {
  // Focus areas are typically on page 1 or 2
  const relevantPages = [1, 2].filter(num => pageData[num]);
  
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    
    // Look for sections that might contain focus areas
    const focusItems = page.items.filter((item: any) => 
      /focus\s+areas?|improvement|bereich/i.test(item.str)
    );
    
    for (const focusItem of focusItems) {
      // Get items below the focus area header
      const belowItems = page.items.filter((item: any) => 
        item.y < focusItem.y && item.y > focusItem.y - 100
      );
      
      // Concatenate text from below items
      const belowText = belowItems.map((item: any) => item.str).join(' ');
      
      // Extract potential focus areas by looking for capitalized words or bullet points
      const potentialAreas = belowText.split(/[•\-,\n]/)
        .map(area => area.trim())
        .filter(area => area.length > 0 && /^[A-Z]/.test(area));
      
      if (potentialAreas.length > 0) {
        return potentialAreas;
      }
    }
  }
  
  return [];
};
