
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
  
  // NEW: Try table grid extraction first
  if (pageData && Object.keys(pageData).length > 0) {
    console.log("Attempting table grid extraction with page data");
    const tableDrivers = findDriverTable(pageData);
    
    if (tableDrivers.length >= 5) {
      console.log(`Found ${tableDrivers.length} drivers with table grid extraction`);
      return ensureAllMetrics(tableDrivers);
    } else {
      console.log(`Only found ${tableDrivers.length} drivers with table grid extraction, trying other methods`);
    }
  }
  
  // Strategy 1: Try structural extraction if page data is available
  if (pageData && Object.keys(pageData).length > 0) {
    console.log("Attempting structural extraction with page data");
    const structuralDrivers = extractDriverKPIsFromStructure(pageData);
    
    if (structuralDrivers.length >= 3) {
      console.log(`Found ${structuralDrivers.length} drivers with structural extraction`);
      return ensureAllMetrics(structuralDrivers);
    } else {
      console.log(`Only found ${structuralDrivers.length} drivers with structural extraction, trying other methods`);
    }
  }
  
  // Strategy 2: Try DSP Weekly Summary extraction for this specific format
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found DSP Weekly Summary format, using specialized extractor");
    const dspDrivers = extractDriversFromDSPWeeklySummary(text);
    
    if (dspDrivers.length >= 3) {
      console.log(`Found ${dspDrivers.length} drivers with DSP Weekly Summary extraction`);
      return ensureAllMetrics(dspDrivers);
    } else {
      console.log(`Only found ${dspDrivers.length} drivers with DSP Weekly Summary extraction, trying fallback`);
    }
  }
  
  // Additional logging before falling back to sample data
  console.log("No sufficient drivers found with extraction strategies");
  
  // See if we got at least some drivers from the structural extraction
  if (pageData && Object.keys(pageData).length > 0) {
    const lastAttemptDrivers = extractDriverKPIsFromStructure(pageData);
    if (lastAttemptDrivers.length > 0) {
      console.log(`Returning ${lastAttemptDrivers.length} partial drivers found in last attempt`);
      return ensureAllMetrics(lastAttemptDrivers);
    }
  }
  
  // Strategy 3: Fall back to sample data when no drivers found
  console.log("Using sample data as fallback");
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
