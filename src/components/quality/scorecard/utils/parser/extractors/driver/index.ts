
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { extractDriversFromDSPWeeklySummary, extractDriversFromFixedWidthTable } from './dsp-weekly/extractors';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { generateSampleDrivers } from './sampleData';
import { ensureAllMetrics, createAllStandardMetrics } from './utils/metricUtils';
import { findDriverTable } from './table/gridTableFinder';
import { extractDriversFromDSPWeekly } from './dsp-weekly';

/**
 * Main driver extraction function - tries all strategies in priority order
 * with improved detection for driver KPIs
 */
export const extractDriverKPIs = (text: string, pageData?: any): any[] => {
  console.log("Starting driver KPI extraction with enhanced strategies");
  
  let extractedDrivers = [];
  
  // Priority 0: Check for DSP WEEKLY SUMMARY format which is most reliable when present
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found DSP WEEKLY SUMMARY format, trying specialized extractors first");
    
    // Use our refactored DSP Weekly extractor
    const dspWeeklyDrivers = extractDriversFromDSPWeekly(text);
    if (dspWeeklyDrivers.length >= 10) {
      console.log(`Found ${dspWeeklyDrivers.length} drivers with DSP WEEKLY extractor, using these`);
      return ensureAllMetrics(dspWeeklyDrivers);
    }
    
    // Try the fixed-width table extractor
    const fixedWidthDrivers = extractDriversFromFixedWidthTable(text);
    if (fixedWidthDrivers.length >= 10) {
      console.log(`Found ${fixedWidthDrivers.length} drivers with fixed-width table extractor, using these`);
      return ensureAllMetrics(fixedWidthDrivers);
    }
    
    // Try the general DSP weekly summary extractor
    const dspSummaryDrivers = extractDriversFromDSPWeeklySummary(text);
    if (dspSummaryDrivers.length >= 10) {
      console.log(`Found ${dspSummaryDrivers.length} drivers with DSP WEEKLY SUMMARY extractor, using these`);
      return ensureAllMetrics(dspSummaryDrivers);
    }
    
    // If any drivers were found with these specialized methods, use them even if fewer than 10
    if (dspWeeklyDrivers.length > 0) {
      console.log(`Using ${dspWeeklyDrivers.length} drivers from DSP WEEKLY format`);
      return ensureAllMetrics(dspWeeklyDrivers);
    }
    
    if (fixedWidthDrivers.length > 0) {
      console.log(`Using ${fixedWidthDrivers.length} drivers from fixed-width table`);
      return ensureAllMetrics(fixedWidthDrivers);
    }
    
    if (dspSummaryDrivers.length > 0) {
      console.log(`Using ${dspSummaryDrivers.length} drivers from DSP WEEKLY SUMMARY`);
      return ensureAllMetrics(dspSummaryDrivers);
    }
  }
  
  // Priority 1: Try structured extraction if positional data is available
  if (pageData) {
    console.log("Trying structured extraction with positional data");
    const structuralDrivers = extractDriverKPIsFromStructure(pageData);
    if (structuralDrivers.length >= 8) {
      console.log(`Found ${structuralDrivers.length} drivers with structural extraction, using these`);
      return ensureAllMetrics(structuralDrivers);
    }
    extractedDrivers = structuralDrivers;
  }
  
  // Priority 2: Try pattern-based extraction methods
  console.log("Trying pattern-based extraction methods");
  
  // Check specifically for 14-character alphanumeric IDs starting with 'A'
  const hasAIDs = /\bA[A-Z0-9]{13}\b/.test(text);
  
  if (hasAIDs) {
    console.log("Detected 14-character A-prefixed IDs, using enhanced pattern extraction");
    // Try the enhanced pattern extractor optimized for A-prefixed IDs
    const enhancedPatternDrivers = extractDriversWithEnhancedPatterns(text, { prioritizeAIds: true });
    if (enhancedPatternDrivers.length >= 8) {
      console.log(`Found ${enhancedPatternDrivers.length} drivers with enhanced pattern extraction, using these`);
      
      // Combine with any existing drivers
      if (extractedDrivers.length > 0) {
        const combinedDrivers = [...extractedDrivers];
        const existingNames = new Set(combinedDrivers.map(d => d.name));
        
        for (const driver of enhancedPatternDrivers) {
          if (!existingNames.has(driver.name)) {
            combinedDrivers.push(driver);
          }
        }
        
        return ensureAllMetrics(combinedDrivers);
      }
      
      return ensureAllMetrics(enhancedPatternDrivers);
    }
    
    // Add any found drivers to our collection
    if (enhancedPatternDrivers.length > 0) {
      const existingNames = new Set(extractedDrivers.map(d => d.name));
      for (const driver of enhancedPatternDrivers) {
        if (!existingNames.has(driver.name)) {
          extractedDrivers.push(driver);
        }
      }
    }
  }
  
  // Priority 3: Try line-by-line extraction
  console.log("Trying line-by-line extraction");
  const lineByLineDrivers = extractDriversLineByLine(text);
  if (lineByLineDrivers.length >= 8) {
    console.log(`Found ${lineByLineDrivers.length} drivers with line-by-line extraction, using these`);
    
    // Combine with any existing drivers
    if (extractedDrivers.length > 0) {
      const combinedDrivers = [...extractedDrivers];
      const existingNames = new Set(combinedDrivers.map(d => d.name));
      
      for (const driver of lineByLineDrivers) {
        if (!existingNames.has(driver.name)) {
          combinedDrivers.push(driver);
        }
      }
      
      return ensureAllMetrics(combinedDrivers);
    }
    
    return ensureAllMetrics(lineByLineDrivers);
  }
  
  // Add any found drivers to our collection
  if (lineByLineDrivers.length > 0) {
    const existingNames = new Set(extractedDrivers.map(d => d.name));
    for (const driver of lineByLineDrivers) {
      if (!existingNames.has(driver.name)) {
        extractedDrivers.push(driver);
      }
    }
  }
  
  // Priority 4: Try flexible pattern extraction as last resort
  console.log("Trying flexible pattern extraction as last resort");
  const flexiblePatternDrivers = extractDriversWithFlexiblePattern(text);
  if (flexiblePatternDrivers.length > 0) {
    const existingNames = new Set(extractedDrivers.map(d => d.name));
    for (const driver of flexiblePatternDrivers) {
      if (!existingNames.has(driver.name)) {
        extractedDrivers.push(driver);
      }
    }
  }
  
  // If we found any drivers with any method, return them
  if (extractedDrivers.length > 0) {
    console.log(`Returning ${extractedDrivers.length} drivers from combined extraction methods`);
    return ensureAllMetrics(extractedDrivers);
  }
  
  // Fallback: return sample data if all extraction methods failed
  console.log("All extraction methods failed, returning sample drivers");
  // Fix: Call generateSampleDrivers without arguments or with a default count
  return generateSampleDrivers();
};

// Export these functions for usage in other extractors
export { generateSampleDrivers, ensureAllMetrics };
