
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIsFromText } from '../textExtractor';
import { findAndProcessTables, processIdentifiedTables } from './tableFinder';
import { extractDriversWithAlternativeApproach, extractDriversAggressively } from './alternativeExtractor';
import { deduplicateDrivers } from './deduplicationUtils';

/**
 * Extract driver KPIs from structural analysis of the PDF
 */
export function extractDriverKPIsFromStructure(pageData: Record<number, any>): DriverKPI[] {
  console.log("Extracting driver KPIs with structural analysis");
  
  // We'll focus on pages 2, 3, and 4 which typically contain driver data
  const relevantPages = [2, 3, 4, 5, 6, 7].filter(num => pageData[num]);
  const drivers: DriverKPI[] = [];
  
  // Log available pages for debugging
  console.log(`Available pages for extraction: ${Object.keys(pageData).join(', ')}`);
  
  // Check if we have the DSP Weekly Summary heading
  let isDspWeeklySummaryFound = false;
  for (const pageNum of Object.keys(pageData).map(Number)) {
    const pageText = pageData[pageNum]?.text || "";
    if (pageText.includes("DSP WEEKLY SUMMARY")) {
      console.log("Found DSP WEEKLY SUMMARY heading on page " + pageNum);
      isDspWeeklySummaryFound = true;
      break;
    }
  }
  
  // For improved extraction, look through all tables in all relevant pages
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    if (!page || !page.items || page.items.length === 0) continue;
    
    console.log(`Processing page ${pageNum} with ${page.items.length} items and ${page.tables?.length || 0} tables`);
    
    // Process predefined tables if they exist
    if (page.tables && page.tables.length > 0) {
      const tableDrivers = processIdentifiedTables(page.tables);
      if (tableDrivers.length > 0) {
        drivers.push(...tableDrivers);
        console.log(`Added ${tableDrivers.length} drivers from predefined tables on page ${pageNum}`);
      }
    }
    
    // Try to find and process tables in page items
    const { drivers: foundDrivers, foundTable } = findAndProcessTables(page);
    if (foundDrivers.length > 0) {
      drivers.push(...foundDrivers);
      console.log(`Added ${foundDrivers.length} drivers from detected tables on page ${pageNum}`);
    }
    
    // If no table was found, try alternative approaches
    if (!foundTable) {
      console.log(`No standard table found on page ${pageNum}, trying alternative approach`);
      
      // Try to extract drivers with alternative approach
      const alternativeDrivers = extractDriversWithAlternativeApproach(page.items);
      if (alternativeDrivers.length > 0) {
        drivers.push(...alternativeDrivers);
        console.log(`Added ${alternativeDrivers.length} drivers with alternative approach on page ${pageNum}`);
      } else {
        // If still no luck, try aggressive extraction
        console.log(`No drivers found on page ${pageNum} with alternative approach, trying aggressive detection`);
        const aggressiveDrivers = extractDriversAggressively(page.items);
        if (aggressiveDrivers.length > 0) {
          drivers.push(...aggressiveDrivers);
          console.log(`Added ${aggressiveDrivers.length} drivers with aggressive detection on page ${pageNum}`);
        }
      }
    }
  }
  
  // Try to check ALL pages for driver data if we still don't have enough
  if (drivers.length < 5) {
    console.log("Not enough drivers found in standard pages, checking ALL pages");
    for (const pageNum of Object.keys(pageData).map(Number)) {
      if (relevantPages.includes(pageNum)) continue; // Skip already processed pages
      
      const page = pageData[pageNum];
      if (!page || !page.items || page.items.length === 0) continue;
      
      console.log(`Additional check on page ${pageNum}`);
      
      // Try all extraction methods on this page
      const { drivers: foundDrivers } = findAndProcessTables(page);
      if (foundDrivers.length > 0) {
        drivers.push(...foundDrivers);
        console.log(`Added ${foundDrivers.length} drivers from page ${pageNum}`);
      } else {
        const alternativeDrivers = extractDriversWithAlternativeApproach(page.items);
        if (alternativeDrivers.length > 0) {
          drivers.push(...alternativeDrivers);
        }
      }
    }
  }
  
  // If we found even one driver with structural analysis, return them
  if (drivers.length > 0) {
    console.log(`Successfully extracted ${drivers.length} drivers with structural analysis`);
    
    // Deduplicate drivers based on name
    const uniqueDrivers = deduplicateDrivers(drivers);
    
    console.log(`After deduplication: ${uniqueDrivers.length} unique drivers`);
    return uniqueDrivers;
  }
  
  // If we didn't find any drivers with the structural approach, fall back to regex-based extraction
  console.log("No drivers found with structural analysis, trying text-based extraction");
  
  // Combine all page texts for better context
  const combinedText = Object.keys(pageData).map(key => 
    pageData[Number(key)]?.text || ""
  ).join("\n\n");
  
  const textDrivers = extractDriverKPIsFromText(combinedText);
  console.log(`Text-based extraction found ${textDrivers.length} drivers`);
  return textDrivers;
}
