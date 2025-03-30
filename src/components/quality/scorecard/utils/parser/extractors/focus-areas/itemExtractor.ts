
/**
 * Utilities for extracting focus areas from PDF items
 */
import { isLikelyKPI } from './kpiUtils';

/**
 * Extracts focus areas from a list of PDF items
 */
export function extractAreasFromItems(items: any[]) {
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
