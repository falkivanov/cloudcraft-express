
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { extractDriversFromDSPWeeklySummary } from './text/dspWeeklySummaryExtractor';
import { generateSampleDrivers } from './sampleData';
import { ensureAllMetrics, createAllStandardMetrics } from './utils/metricUtils';
import { findDriverTable } from './table/gridTableFinder';

/**
 * Main driver extraction function - tries all strategies in priority order
 */
export const extractDriverKPIs = (text: string, pageData?: any): any[] => {
  console.log("Starting driver KPI extraction");
  
  let extractedDrivers = [];
  
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
  
  // Priority 2: Try structural extraction if page data is available
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
  
  // Priority 3: Try DSP Weekly Summary extraction for this specific format
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
  generateSampleDrivers,
  ensureAllMetrics,
  createAllStandardMetrics,
  findDriverTable
};
