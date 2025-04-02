
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { extractDriversFromDSPWeeklySummary } from './text/dspWeeklySummaryExtractor';
import { extractDriversWithEnhancedPatterns } from './text/enhancedPatternExtractor';
import { extractDriversLineByLine } from './text/lineBasedExtractor';
import { extractDriversWithFlexiblePattern } from './text/flexiblePatternExtractor';
import { generateSampleDrivers } from './sampleData';
import { ensureAllMetrics, createAllStandardMetrics } from './utils/metricUtils';
import { findDriverTable } from './table/gridTableFinder';

/**
 * Main driver extraction function - tries all strategies in priority order
 * with improved detection for driver KPIs
 */
export const extractDriverKPIs = (text: string, pageData?: any): any[] => {
  console.log("Starting driver KPI extraction with enhanced strategies");
  
  let extractedDrivers = [];
  let hasAlphaNumericIds = text.includes("A1") || text.includes("A2") || text.includes("A3");
  
  // Priority 1: Try table grid extraction with all pages (most reliable for structured tables)
  if (pageData && Object.keys(pageData).length > 0) {
    console.log("Attempting table grid extraction with page data");
    extractedDrivers = findDriverTable(pageData);
    
    if (extractedDrivers.length >= 5) {
      console.log(`Found ${extractedDrivers.length} drivers with table grid extraction`);
      return ensureAllMetrics(extractedDrivers);
    } else {
      console.log(`Only found ${extractedDrivers.length} drivers with table grid extraction, trying other methods`);
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
        console.log(`Combined extraction found ${combinedDrivers.length} drivers`);
        return ensureAllMetrics(combinedDrivers);
      }
      
      // Update our running total
      extractedDrivers = combinedDrivers;
    }
  }
  
  // Priority 4: Try DSP Weekly Summary extraction for this specific format
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found DSP Weekly Summary format, using specialized extractor");
    const dspDrivers = extractDriversFromDSPWeeklySummary(text);
    
    if (dspDrivers.length > 0) {
      console.log(`Found ${dspDrivers.length} drivers with DSP Weekly Summary extraction`);
      
      // Combine with any drivers found so far
      const combinedDrivers = [...extractedDrivers];
      
      // Add only new drivers that weren't found already
      dspDrivers.forEach(driver => {
        if (!combinedDrivers.some(d => d.name === driver.name)) {
          combinedDrivers.push(driver);
        }
      });
      
      if (combinedDrivers.length >= 10) {
        console.log(`Combined extraction found ${combinedDrivers.length} drivers`);
        return ensureAllMetrics(combinedDrivers);
      }
      
      // Update our running total
      extractedDrivers = combinedDrivers;
    }
  }
  
  // Priority 5: Try flexible pattern extraction as a fallback
  console.log("Trying flexible pattern extraction as additional method");
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
    
    // Update our running total
    extractedDrivers = combinedDrivers;
  }
  
  // Priority 6: Try line-by-line extraction as last extraction attempt
  console.log("Trying line-by-line extraction as final attempt");
  const lineBasedDrivers = extractDriversLineByLine(text);
  
  if (lineBasedDrivers.length > 0) {
    console.log(`Found ${lineBasedDrivers.length} drivers with line-based extraction`);
    
    // Combine with any drivers found so far
    const combinedDrivers = [...extractedDrivers];
    
    // Add only new drivers that weren't found already
    lineBasedDrivers.forEach(driver => {
      if (!combinedDrivers.some(d => d.name === driver.name)) {
        combinedDrivers.push(driver);
      }
    });
    
    // Update our running total
    extractedDrivers = combinedDrivers;
  }
  
  // If we found at least some drivers, return them
  if (extractedDrivers.length > 0) {
    console.log(`Returning ${extractedDrivers.length} drivers found from combined extraction methods`);
    return ensureAllMetrics(extractedDrivers);
  }
  
  // All extraction strategies failed, fall back to sample data
  console.log("No drivers found with any extraction strategy, using sample data as fallback");
  return ensureAllMetrics(generateSampleDrivers());
};

export {
  extractDriverKPIsFromStructure,
  extractDriversFromDSPWeeklySummary,
  extractDriversWithEnhancedPatterns,
  extractDriversLineByLine,
  extractDriversWithFlexiblePattern,
  generateSampleDrivers,
  ensureAllMetrics,
  createAllStandardMetrics,
  findDriverTable
};
