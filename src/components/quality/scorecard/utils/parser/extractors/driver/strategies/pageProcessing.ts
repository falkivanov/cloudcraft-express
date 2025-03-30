
import { DriverKPI } from '../../../../../types';
import { extractDriversWithTablePattern, extractDriversLineByLine } from '../utils/patternMatching';

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
