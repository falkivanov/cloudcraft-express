
import { DriverKPI } from "../../../../../types";
import { extractDriversFromAllPages } from "../text/pageExtractor";
import { extractDriverKPIsFromText } from "../textExtractor";

/**
 * Try multiple strategies to extract drivers from text
 * @param text The PDF text content
 * @returns Array of driver KPIs
 */
export const extractDriversUsingMultipleStrategies = (text: string): DriverKPI[] => {
  console.log("Trying multiple driver extraction strategies");
  
  let allDrivers: DriverKPI[] = [];
  const driverIds = new Set<string>();
  
  // Strategy 1: Use the page extractor (usually most accurate)
  try {
    const pageTexts = text.split("\f"); // Form feed character usually separates PDF pages
    const pageDrivers = extractDriversFromAllPages(pageTexts);
    
    // Add unique drivers
    pageDrivers.forEach(driver => {
      if (!driverIds.has(driver.name)) {
        allDrivers.push(driver);
        driverIds.add(driver.name);
      }
    });
    
    console.log(`Found ${pageDrivers.length} drivers using page extraction`);
  } catch (error) {
    console.error("Error in page extraction strategy:", error);
  }
  
  // Strategy 2: Use the text-based extractor if we don't have enough drivers
  if (allDrivers.length < 5) {
    try {
      const textDrivers = extractDriverKPIsFromText(text);
      
      // Add unique drivers not already found
      textDrivers.forEach(driver => {
        if (!driverIds.has(driver.name)) {
          allDrivers.push(driver);
          driverIds.add(driver.name);
        }
      });
      
      console.log(`Found ${textDrivers.length} additional drivers using text extraction`);
    } catch (error) {
      console.error("Error in text extraction strategy:", error);
    }
  }
  
  console.log(`Total unique drivers found across all strategies: ${allDrivers.length}`);
  return allDrivers;
};
