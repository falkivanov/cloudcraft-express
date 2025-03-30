
/**
 * Utilities for cleaning and formatting focus areas
 */
import { isLikelyKPI } from './kpiUtils';

/**
 * Clean and limit focus areas to the top 3
 */
export function cleanFocusAreas(areas: string[]) {
  // Remove duplicates and limit to 3
  return [...new Set(areas)]
    .filter(area => isLikelyKPI(area))
    .slice(0, 3);
}
