
/**
 * Extract location from PDF content
 */
export function extractLocation(pageData: Record<number, any>): string {
  // Look specifically for station codes in common formats
  const locationPattern = /DS[A-Z]\d+|[A-Z]{3}\d+/g;
  const locationMatches = [];
  
  // Search all pages for location
  for (let i = 1; i <= Object.keys(pageData).length; i++) {
    if (pageData[i]?.text) {
      const matches = pageData[i].text.match(locationPattern);
      if (matches) locationMatches.push(...matches);
    }
  }
  
  return locationMatches.length > 0 ? locationMatches[0] : 'DSU1';
}
