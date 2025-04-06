
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";
import { extractDriverKPIsFromText } from "../textExtractor";

/**
 * Process page text to extract driver data
 */
export function processPageForDrivers(pageText: string, pageIndex: number): DriverKPI[] {
  console.log(`Processing page ${pageIndex} for driver extraction`);
  
  // Use the standard extractor for each page
  let drivers = extractDriverKPIsFromText(pageText);
  
  // If standard extractor didn't find drivers, try more aggressive patterns
  if (drivers.length === 0) {
    // Try to find any pattern with driver IDs and numbers
    const flexPattern = /\b([A-Z][A-Z0-9]{2,}[-\s]?\d*)\s+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/g;
    
    let match;
    while ((match = flexPattern.exec(pageText)) !== null) {
      const [, id, value1, value2, value3] = match;
      
      drivers.push({
        name: id,
        status: "active",
        metrics: [
          {
            name: "Delivered",
            value: parseFloat(value1),
            target: 0,
            unit: "",
            status: determineMetricStatus("Delivered", parseFloat(value1))
          },
          {
            name: "DCR",
            value: parseFloat(value2),
            target: 98.5,
            unit: "%",
            status: determineMetricStatus("DCR", parseFloat(value2))
          },
          {
            name: "DNR DPMO",
            value: parseFloat(value3),
            target: 1500,
            unit: "DPMO",
            status: determineMetricStatus("DNR DPMO", parseFloat(value3))
          }
        ]
      });
    }
  }
  
  console.log(`Found ${drivers.length} drivers on page ${pageIndex}`);
  return drivers;
}

/**
 * Extract drivers from all pages in the PDF
 */
export function extractDriversFromAllPages(pageTexts: string[]): DriverKPI[] {
  console.log(`Extracting drivers from ${pageTexts.length} pages`);
  
  const allDrivers: DriverKPI[] = [];
  const driverIds = new Set<string>();
  
  // Process each page
  pageTexts.forEach((pageText, pageIndex) => {
    // Skip pages that are likely not driver pages (too short)
    if (pageText.length < 100) return;
    
    const pageDrivers = processPageForDrivers(pageText, pageIndex);
    
    // Add unique drivers from this page
    pageDrivers.forEach(driver => {
      if (!driverIds.has(driver.name)) {
        allDrivers.push(driver);
        driverIds.add(driver.name);
      }
    });
  });
  
  console.log(`Extracted ${allDrivers.length} unique drivers from all pages`);
  return allDrivers;
}
