
import { DriverKPI } from '../../../../../types';
import { generateSampleDrivers } from '../sampleData';
import { extractDriversByPage } from './pageProcessing';
import { tryAllExtractionStrategies } from './multiStrategy';

/**
 * Extract drivers from text content using multiple strategies,
 * falling back to sample data only if absolutely necessary
 */
export function extractDriversOrUseSampleData(text: string): DriverKPI[] {
  console.log("Starting enhanced driver extraction from PDF text");
  
  // Step 1: Try all extraction strategies
  const extractedDrivers = tryAllExtractionStrategies(text);
  
  // If we found at least 10 drivers, that's likely a good extraction
  if (extractedDrivers.length >= 10) {
    console.log(`Successfully extracted ${extractedDrivers.length} drivers`);
    return extractedDrivers;
  }
  
  // Step 2: If few drivers found, try page-by-page approach which can work better for some PDFs
  if (extractedDrivers.length < 10) {
    console.log(`First attempt found only ${extractedDrivers.length} drivers, trying page-by-page approach`);
    const driversFromPages = extractDriversByPage(text);
    
    if (driversFromPages.length > extractedDrivers.length) {
      console.log(`Page approach found ${driversFromPages.length} drivers, using that result`);
      return driversFromPages;
    }
  }
  
  // Step 3: As a last resort, try a very aggressive pattern matching approach
  // Look for any patterns that might be driver IDs, even without complete metrics
  if (extractedDrivers.length < 10) {
    const aggressivePatterns = [
      /([A-Z][A-Z0-9]{5,})/g,  // Any uppercase sequence with at least 6 chars
      /([A-Z]\d{1,2}[A-Z]\d[A-Z0-9]{3,})/g,  // Patterns like A1B2C345
      /([A-Z]{2,3}\d{2,})/g,   // Patterns like AB12345
      /(TR[-\s]?\d{2,})/g,     // TR- patterns
    ];
    
    const combinedResults: DriverKPI[] = [...extractedDrivers];
    const foundIds = new Set(extractedDrivers.map(d => d.name));
    
    console.log("Trying aggressive ID pattern matching as last resort");
    
    // Try each pattern
    for (const pattern of aggressivePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      
      if (matches.length > 0) {
        console.log(`Found ${matches.length} potential driver IDs with pattern ${pattern}`);
        
        // For each match, create a driver if it's not already in the list
        for (const match of matches) {
          const driverId = match[0].trim();
          
          // Skip if already in our results or not a valid ID
          if (foundIds.has(driverId) || 
              driverId.toLowerCase().includes('page') ||
              driverId.length < 4 ||
              driverId.toLowerCase() === 'id' ||
              driverId.toLowerCase().includes('kpi') ||
              driverId.toLowerCase().includes('score')) {
            continue;
          }
          
          // Extract context around this ID to look for metrics
          const startIndex = Math.max(0, match.index! - 50);
          const endIndex = Math.min(text.length, match.index! + 150);
          const context = text.substring(startIndex, endIndex);
          
          // Try to find numbers in this context
          const numberMatches = context.match(/\b(\d+(?:\.\d+)?)\b/g);
          
          if (numberMatches && numberMatches.length >= 3) {
            // Create metrics from the numbers found
            const metrics = [
              {
                name: "Delivered",
                value: parseFloat(numberMatches[0]),
                target: 0,
                unit: ""
              },
              {
                name: "DCR",
                value: parseFloat(numberMatches[1]),
                target: 98.5,
                unit: "%"
              },
              {
                name: "DNR DPMO",
                value: parseFloat(numberMatches[2]),
                target: 1500,
                unit: "DPMO"
              }
            ];
            
            // Add more metrics if available
            if (numberMatches.length > 3) {
              metrics.push({
                name: "POD",
                value: parseFloat(numberMatches[3]),
                target: 98,
                unit: "%"
              });
            }
            
            if (numberMatches.length > 4) {
              metrics.push({
                name: "CC",
                value: parseFloat(numberMatches[4]),
                target: 95,
                unit: "%"
              });
            }
            
            // Create driver
            combinedResults.push({
              name: driverId,
              status: "active",
              metrics
            });
            
            foundIds.add(driverId);
          }
        }
      }
    }
    
    if (combinedResults.length > extractedDrivers.length) {
      console.log(`Aggressive approach improved driver count from ${extractedDrivers.length} to ${combinedResults.length}`);
      return combinedResults;
    }
  }
  
  // If we still found some drivers (but fewer than we'd like), return those
  if (extractedDrivers.length > 0) {
    console.log(`Returning ${extractedDrivers.length} drivers found through extraction, though fewer than expected`);
    return extractedDrivers;
  }
  
  // Absolute last resort: return sample data
  console.warn("No driver extraction methods succeeded, using sample data");
  return generateSampleDrivers();
}

// Export the functions needed by extractionStrategies.ts
export { extractDriversByPage, tryAllExtractionStrategies };
