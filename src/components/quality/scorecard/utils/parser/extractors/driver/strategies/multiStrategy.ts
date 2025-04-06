
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIsFromStructure } from '../structuralExtractor';
import { extractDriverKPIsFromText } from '../textExtractor';
import { extractDriversByPage } from './pageProcessing';
import { extractDriversWithEnhancedPatterns } from '../text/enhancedPatternExtractor';
import { extractDriversLineByLine } from '../text/lineBasedExtractor';

/**
 * Try all extraction strategies to find driver KPIs
 */
export function tryAllExtractionStrategies(text: string): DriverKPI[] {
  console.log("Trying all extraction strategies for driver KPIs");
  let extractedDrivers: DriverKPI[] = [];
  
  // Strategy 1: Structural extraction - most reliable for table-based data
  const driversFromStructure = extractDriverKPIsFromStructure({ 
    3: { text, items: [] },
    4: { text, items: [] }
  });
  
  if (driversFromStructure.length > 3) {
    console.log(`Found ${driversFromStructure.length} drivers using structural extraction`);
    extractedDrivers = [...extractedDrivers, ...driversFromStructure];
  }
  
  // Strategy 2: Text extraction - good for structured text
  if (extractedDrivers.length < 10) {
    const driversFromText = extractDriverKPIsFromText(text);
    if (driversFromText.length > 3) {
      console.log(`Found ${driversFromText.length} drivers using text extraction`);
      
      // Add only new drivers that weren't found already
      driversFromText.forEach(driver => {
        if (!extractedDrivers.some(d => d.name === driver.name)) {
          extractedDrivers.push(driver);
        }
      });
    }
  }
  
  // Strategy 3: Page-by-page extraction
  if (extractedDrivers.length < 10) {
    const driversFromPages = extractDriversByPage(text);
    if (driversFromPages.length > 0) {
      console.log(`Found ${driversFromPages.length} drivers using page-by-page extraction`);
      
      // Add only new drivers
      driversFromPages.forEach(driver => {
        if (!extractedDrivers.some(d => d.name === driver.name)) {
          extractedDrivers.push(driver);
        }
      });
    }
  }
  
  // Strategy 4: Enhanced pattern matching - especially for alphanumeric IDs
  if (extractedDrivers.length < 10) {
    // We'll add a specific pattern for KW11-style IDs which often start with 'A' followed by numbers and letters
    const enhancedPatterns = [
      /\b([A][0-9][A-Z0-9]{4,}[A-Z0-9]*)\b/g,  // KW11 pattern like A1ABCD123
      /\b([A][0-9][A-Z]{2,}[0-9]{2,}[A-Z0-9]*)\b/g,  // Alternative KW11 format
      /\b(AWS[0-9]{3}[A-Z][0-9]['\'][A-Z0-9]+)\b/g,  // Special format seen in KW11
    ];
    
    for (const pattern of enhancedPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        console.log(`Found ${matches.length} potential KW11-style IDs with pattern ${pattern}`);
        
        for (const match of matches) {
          const driverId = match[0].trim();
          
          // Skip if already in results or invalid
          if (extractedDrivers.some(d => d.name === driverId) || 
              driverId.length < 8 ||
              driverId.toLowerCase().includes('page')) {
            continue;  
          }
          
          // Try to find values around this ID
          const startIndex = Math.max(0, match.index! - 50);
          const endIndex = Math.min(text.length, match.index! + 200);
          const context = text.substring(startIndex, endIndex);
          
          // KW11 often has metrics as sequences of numbers
          const numericSequences = context.match(/(\d{2,4}(?:\.\d{1,2})?)/g);
          
          if (numericSequences && numericSequences.length >= 3) {
            // Create a driver with the metrics found
            const metrics = [];
            const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
            const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
            const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
            
            for (let i = 0; i < Math.min(numericSequences.length, metricNames.length); i++) {
              metrics.push({
                name: metricNames[i],
                value: parseFloat(numericSequences[i]),
                target: metricTargets[i],
                unit: metricUnits[i]
              });
            }
            
            extractedDrivers.push({
              name: driverId,
              status: "active",
              metrics
            });
          }
        }
      }
    }
  }
  
  // Strategy 5: Line-by-line extraction - least reliable but good fallback
  if (extractedDrivers.length < 10) {
    const driversFromLines = extractDriversLineByLine(text);
    if (driversFromLines.length > 0) {
      console.log(`Found ${driversFromLines.length} drivers using line-by-line extraction`);
      
      // Add only new drivers
      driversFromLines.forEach(driver => {
        if (!extractedDrivers.some(d => d.name === driver.name)) {
          extractedDrivers.push(driver);
        }
      });
    }
  }
  
  // Remove any duplicate drivers (by name)
  return Array.from(new Map(extractedDrivers.map(driver => [driver.name, driver])).values());
}
