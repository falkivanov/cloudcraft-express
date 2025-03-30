
import { DriverKPI } from '../../../../types';
import { extractDriversWithTablePattern, extractDriversLineByLine, extractDriversWithEnhancedPattern } from './utils/patternMatching';
import { extractDriverKPIsFromStructure } from './structuralExtractor';
import { extractDriverKPIsFromText } from './textExtractor';
import { generateSampleDrivers } from './sampleData';

/**
 * Process text by page to extract drivers
 */
export function extractDriversByPage(text: string): DriverKPI[] {
  console.log("Extracting drivers by processing text page by page");
  
  // Split the text by page markers if they exist
  const pages = text.split(/(?:Page|Seite)\s+\d+\s+(?:of|von)\s+\d+/i);
  const allDrivers: DriverKPI[] = [];
  
  // Process the full text first (in case there are no clear page markers)
  const driversFromFullText = extractDriversWithTablePattern(text);
  driversFromFullText.forEach(driver => {
    if (!allDrivers.some(d => d.name === driver.name)) {
      allDrivers.push(driver);
    }
  });
  
  // Also process each page separately for better coverage
  if (pages.length > 1) {
    pages.forEach(pageText => {
      const driversFromPage = extractDriversWithTablePattern(pageText);
      
      // Add only new drivers not already found
      driversFromPage.forEach(driver => {
        if (!allDrivers.some(d => d.name === driver.name)) {
          allDrivers.push(driver);
        }
      });
      
      // Try line-by-line extraction for this page
      const lineDrivers = extractDriversLineByLine(pageText);
      lineDrivers.forEach(driver => {
        if (!allDrivers.some(d => d.name === driver.name)) {
          allDrivers.push(driver);
        }
      });
    });
  }
  
  return allDrivers;
}

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

/**
 * Try to extract drivers or return sample data as a last resort
 */
export function extractDriversOrUseSampleData(text: string): DriverKPI[] {
  const drivers = tryAllExtractionStrategies(text);
  
  if (drivers.length > 3) {
    console.log(`Successfully extracted ${drivers.length} unique drivers`);
    return drivers;
  }
  
  // If we get here, all extraction methods failed - use sample data
  console.warn("All extraction methods failed, using sample data");
  return generateSampleDrivers();
}
