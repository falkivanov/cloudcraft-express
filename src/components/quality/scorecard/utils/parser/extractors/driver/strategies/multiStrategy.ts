
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIsFromStructure } from '../structuralExtractor';
import { extractDriverKPIsFromText } from '../textExtractor';
import { extractDriversByPage } from './pageProcessing';
import { extractDriversWithEnhancedPattern } from '../text/enhancedPatternExtractor';
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
  if (extractedDrivers.length < 3) {
    const driversFromText = extractDriverKPIsFromText(text);
    if (driversFromText.length > 3) {
      console.log(`Found ${driversFromText.length} drivers using text extraction`);
      extractedDrivers = [...extractedDrivers, ...driversFromText];
    }
  }
  
  // Strategy 3: Page-by-page extraction
  if (extractedDrivers.length < 3) {
    const driversFromPages = extractDriversByPage(text);
    if (driversFromPages.length > 0) {
      console.log(`Found ${driversFromPages.length} drivers using page-by-page extraction`);
      extractedDrivers = [...extractedDrivers, ...driversFromPages];
    }
  }
  
  // Strategy 4: Enhanced pattern matching
  if (extractedDrivers.length < 3) {
    const driversFromEnhancedPattern = extractDriversWithEnhancedPattern(text);
    if (driversFromEnhancedPattern.length > 0) {
      console.log(`Found ${driversFromEnhancedPattern.length} drivers using enhanced pattern matching`);
      extractedDrivers = [...extractedDrivers, ...driversFromEnhancedPattern];
    }
  }
  
  // Strategy 5: Line-by-line extraction - least reliable but good fallback
  if (extractedDrivers.length < 3) {
    const driversFromLines = extractDriversLineByLine(text);
    if (driversFromLines.length > 0) {
      console.log(`Found ${driversFromLines.length} drivers using line-by-line extraction`);
      extractedDrivers = [...extractedDrivers, ...driversFromLines];
    }
  }
  
  // Remove any duplicate drivers (by name)
  return Array.from(new Map(extractedDrivers.map(driver => [driver.name, driver])).values());
}
