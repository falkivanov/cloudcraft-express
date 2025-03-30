
import { DriverKPI } from '../../../../../types';
import { createAllStandardMetrics } from '../utils/metricUtils';

/**
 * Enhanced approach to find driver IDs when other extraction methods fail
 */
export const extractDriversWithEnhancedPatterns = (text: string): DriverKPI[] => {
  console.log("Trying enhanced ID pattern extraction");
  
  // This pattern looks for both Amazon-style IDs and TR-pattern IDs
  const enhancedDriverIdPatterns = [
    /\b([A-Z0-9]{10,})\b/g,  // Amazon-style IDs (at least 10 alphanumeric chars)
    /\b(TR[-\s]?\d{3,})\b/g, // TR-pattern IDs
    /\b([A-Z]\d{5,}[A-Z0-9]*)\b/g // Other common driver ID patterns
  ];
  
  const potentialDriverIds = new Set<string>();
  
  // Try each pattern and collect unique IDs
  enhancedDriverIdPatterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      if (match[1] && match[1].length >= 8) { // Minimum length for a valid ID
        potentialDriverIds.add(match[1].trim());
      }
    });
  });
  
  console.log(`Found ${potentialDriverIds.size} potential driver IDs using enhanced patterns`);
  
  if (potentialDriverIds.size > 0) {
    // Create simple drivers for each ID found
    const simpleDrivers: DriverKPI[] = Array.from(potentialDriverIds).map((driverId, index) => {
      return {
        name: driverId,
        status: "active",
        metrics: createAllStandardMetrics(index)
      };
    });
    
    console.log(`Created ${simpleDrivers.length} simple drivers from potential IDs`);
    return simpleDrivers;
  }
  
  // Fall back to looking for just TR-patterns in the whole text if no other methods worked
  const trPattern = /TR[-\s]?(\d{3,})/g;
  const trMatches = Array.from(text.matchAll(trPattern));
  
  if (trMatches.length > 0) {
    console.log(`Found ${trMatches.length} TR-pattern matches as last resort`);
    
    // Create simple drivers for each TR match
    const simpleDrivers: DriverKPI[] = trMatches.map((match, index) => {
      const driverId = match[0].trim();
      return {
        name: driverId,
        status: "active",
        metrics: createAllStandardMetrics(index)
      };
    });
    
    console.log(`Created ${simpleDrivers.length} simple drivers from TR patterns`);
    return simpleDrivers;
  }
  
  return [];
}
