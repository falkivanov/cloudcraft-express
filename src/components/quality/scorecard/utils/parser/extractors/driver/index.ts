import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { extractDriversFromDSPWeeklySummary, extractDriversFromFixedWidthTable } from './dspWeeklySummaryExtractor';
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
      console.log(`Found ${dspWeeklyDrivers.length} drivers with DSP WEEKLY SUMMARY extraction`);
      return ensureAllMetrics(dspWeeklyDrivers);
    }
    
    // If we found some drivers but not enough, keep them and continue with other methods
    if (dspWeeklyDrivers.length > 0) {
      extractedDrivers = [...dspWeeklyDrivers];
      console.log(`Added ${dspWeeklyDrivers.length} drivers from DSP WEEKLY SUMMARY extraction`);
    }
  }
  
  let hasAlphaNumericIds = text.includes("A1") || text.includes("A2") || text.includes("A3") || /\bA[A-Z0-9]{5,}\b/.test(text);
  
  // Priority 1: Try table grid extraction with all pages (most reliable for structured tables)
  if (pageData && Object.keys(pageData).length > 0) {
    console.log("Attempting table grid extraction with page data");
    const gridDrivers = findDriverTable(pageData);
    
    if (gridDrivers.length >= 5) {
      console.log(`Found ${gridDrivers.length} drivers with table grid extraction`);
      return ensureAllMetrics(gridDrivers);
    } else {
      console.log(`Only found ${gridDrivers.length} drivers with table grid extraction, trying other methods`);
    }
  }
  
  // Priority 2: Try enhanced pattern extraction first for newer PDF formats
  // This works better for formats where driver IDs start with 'A' followed by alphanumeric characters
  if (hasAlphaNumericIds) {
    console.log("PDF likely contains alphanumeric IDs, trying enhanced pattern extraction first");
    const enhancedDrivers = extractDriversWithEnhancedPatterns(text, { prioritizeAIds: true });
    
    if (enhancedDrivers.length >= 8) {
      console.log(`Found ${enhancedDrivers.length} drivers with enhanced pattern extraction`);
      return ensureAllMetrics(enhancedDrivers);
    } else if (enhancedDrivers.length > 0) {
      extractedDrivers = [...extractedDrivers, ...enhancedDrivers];
      console.log(`Added ${enhancedDrivers.length} drivers from enhanced pattern extraction`);
    }
  }
  
  // Priority 3: Try structural extraction if page data is available
  if (pageData && Object.keys(pageData).length > 0) {
    console.log("Attempting structural extraction with page data");
    const structuralDrivers = extractDriverKPIsFromStructure(pageData);
    
    if (structuralDrivers.length > 0) {
      console.log(`Found ${structuralDrivers.length} drivers with structural extraction`);
      // Combine with any drivers found so far
      const combinedDrivers = [...extractedDrivers];
      
      // Add only new drivers that weren't found already
      structuralDrivers.forEach(driver => {
        if (!combinedDrivers.some(d => d.name === driver.name)) {
          combinedDrivers.push(driver);
        }
      });
      
      if (combinedDrivers.length >= 10) {
        console.log(`Combined extraction found ${combinedDrivers.length} drivers, returning results`);
        return ensureAllMetrics(combinedDrivers);
      }
      
      extractedDrivers = combinedDrivers;
    }
  }
  
  // Priority 4: Try line-by-line extraction
  console.log("Trying line-by-line extraction");
  const lineByLineDrivers = extractDriversLineByLine(text);
  
  if (lineByLineDrivers.length > 0) {
    console.log(`Found ${lineByLineDrivers.length} drivers with line-by-line extraction`);
    // Combine with any drivers found so far
    const combinedDrivers = [...extractedDrivers];
    
    // Add only new drivers that weren't found already
    lineByLineDrivers.forEach(driver => {
      if (!combinedDrivers.some(d => d.name === driver.name)) {
        combinedDrivers.push(driver);
      }
    });
    
    extractedDrivers = combinedDrivers;
  }
  
  // Priority 5: Try flexible pattern extraction as last resort for text-based extraction
  if (extractedDrivers.length < 5) {
    console.log("Trying flexible pattern extraction");
    const flexibleDrivers = extractDriversWithFlexiblePattern(text);
    
    if (flexibleDrivers.length > 0) {
      console.log(`Found ${flexibleDrivers.length} drivers with flexible pattern extraction`);
      // Combine with any drivers found so far
      const combinedDrivers = [...extractedDrivers];
      
      // Add only new drivers that weren't found already
      flexibleDrivers.forEach(driver => {
        if (!combinedDrivers.some(d => d.name === driver.name)) {
          combinedDrivers.push(driver);
        }
      });
      
      extractedDrivers = combinedDrivers;
    }
  }
  
  // If we found any drivers, return them with ensured metrics
  if (extractedDrivers.length > 0) {
    console.log(`Returning ${extractedDrivers.length} total drivers from combined extraction methods`);
    return ensureAllMetrics(extractedDrivers);
  }
  
  // If we got here, we couldn't extract any drivers
  console.warn("No drivers could be extracted with any method, returning sample data");
  return generateSampleDrivers();
};

export {
  generateSampleDrivers,
  ensureAllMetrics
};
