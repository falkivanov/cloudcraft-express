
/**
 * Utilities for cleaning and formatting focus areas
 */
import { isLikelyKPI } from './kpiUtils';

/**
 * Clean and limit focus areas to the top 3
 */
export function cleanFocusAreas(areas: string[]) {
  // Clean up each area text
  const cleanedAreas = areas.map(area => {
    // Remove any numbering like "1. " at the beginning
    let cleaned = area.replace(/^\d+\.\s*/, '');
    
    // Remove any percentages and content after it
    cleaned = cleaned.replace(/\s*[-–]\s*\d+(\.\d+)?%.*$/, '');
    
    // Trim any extra whitespace
    return cleaned.trim();
  });
  
  // Remove duplicates and limit to 3
  return [...new Set(cleanedAreas)]
    .filter(area => area.length > 3 && isLikelyKPI(area))
    .slice(0, 3);
}
