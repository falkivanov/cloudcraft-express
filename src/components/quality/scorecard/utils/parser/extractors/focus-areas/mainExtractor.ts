
/**
 * Main focus areas extractor that coordinates the extraction process
 */
import { extractAreasFromItems } from './itemExtractor';
import { groupItemsByVerticalProximity } from './groupingUtils';
import { cleanFocusAreas } from './cleaningUtils';
import { isLikelyKPI } from './kpiUtils';
import { getFallbackFocusAreas } from './fallbackUtils';

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
  
  // First, look for "Recommended Focus Areas" or similar headers
  const recommendedHeaders = page.items.filter((item: any) => {
    const text = item.str.toLowerCase().trim();
    return text.includes('recommended focus') || 
           text.includes('focus area') || 
           text.includes('recommended action');
  });
  
  if (recommendedHeaders.length > 0) {
    console.log("Found 'Recommended Focus Areas' header");
    const header = recommendedHeaders[0];
    
    // Look for numbered items below the header (1., 2., 3., etc.)
    const numberedItems = page.items.filter((item: any) => {
      // Check if item is below the header and starts with a number followed by a dot
      return item.y > header.y && /^\d+\./.test(item.str.trim());
    });
    
    if (numberedItems.length > 0) {
      console.log("Found numbered focus areas:", numberedItems.map((i: any) => i.str));
      const extractedAreas = numberedItems.map((item: any) => {
        // Remove the number and dot at the beginning
        return item.str.trim().replace(/^\d+\.\s*/, '').trim();
      });
      
      return extractedAreas.slice(0, 3); // Take up to 3 focus areas
    }
  }
  
  // If no recommended headers found, try looking for other common formats
  // Sort items by y-position (top to bottom)
  const sortedItems = [...page.items].sort((a, b) => a.y - b.y);
  
  // Look specifically for patterns like "DNR DPMO" or "Contact Compliance"
  const knownKPIs = [
    "DNR DPMO", "Delivered Not Received", 
    "Delivery Completion Rate", "DCR",
    "Contact Compliance", 
    "Photo-On-Delivery", "POD",
    "Safe Driving", 
    "Working Hours Compliance",
    "Mentor Adoption"
  ];
  
  // Try to find items that contain known KPIs
  const kpiMatches = [];
  
  for (const item of sortedItems) {
    const itemText = item.str.trim();
    
    // Check if this item contains any of our known KPIs
    for (const kpi of knownKPIs) {
      if (itemText.includes(kpi) || 
          // Special case for DNR DPMO - sometimes written as "Delivered Not Received (DNR DPMO)"
          (kpi === "DNR DPMO" && itemText.includes("Delivered Not Received"))) {
        
        // Extract the full KPI name
        let extractedKpi = itemText;
        // If it's numbered (like "1. DNR DPMO"), remove the numbering
        extractedKpi = extractedKpi.replace(/^\d+\.\s*/, '');
        // If it's in the form "DNR DPMO - 5.2%", remove the percentage
        extractedKpi = extractedKpi.replace(/\s*[-–]\s*\d+(\.\d+)?%.*$/, '');
        
        // Remove any extra whitespace
        extractedKpi = extractedKpi.trim();
        
        kpiMatches.push(extractedKpi);
        break;
      }
    }
    
    // Stop after finding 3 KPIs
    if (kpiMatches.length >= 3) {
      break;
    }
  }
  
  // If we found at least one KPI, return them
  if (kpiMatches.length > 0) {
    console.log("Found KPI matches in text:", kpiMatches);
    return kpiMatches.slice(0, 3);
  }
  
  // Try the original method as fallback - looking for focus area headers
  console.log("Trying original method - looking for focus area section headers");
  
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
      item.y > (page.height * 0.7)
    );
  });
  
  if (focusHeaders.length > 0) {
    console.log("Found potential focus area headers:", 
      focusHeaders.map(h => `"${h.str}" at y=${h.y}`).join(', '));
    
    // For each potential header, look for items below it
    for (const header of focusHeaders) {
      // Get items below the focus area header, within a reasonable distance
      const itemsBelow = sortedItems.filter(item => 
        item.y > header.y && 
        item.y < header.y + 200 && // Look within 200 units below the header
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
  
  // Fall back to looking for common KPIs in the whole text
  console.log("Checking for common KPI names in page 2 text");
  if (page.text) {
    for (const kpi of knownKPIs) {
      if (page.text.includes(kpi)) {
        const foundKPIs = knownKPIs.filter(k => page.text.includes(k));
        if (foundKPIs.length > 0) {
          console.log("Found common KPIs in page text:", foundKPIs);
          return foundKPIs.slice(0, 3);
        }
      }
    }
  }
  
  console.log("Could not find focus areas, using fallback");
  return getFallbackFocusAreas();
};
