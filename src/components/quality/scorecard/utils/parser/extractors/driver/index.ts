
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { extractDriversFromDSPWeeklySummary } from './text/dspWeeklySummaryExtractor';
import { generateSampleDrivers } from './sampleData';
import { ensureAllMetrics, createAllStandardMetrics } from './utils/metricUtils';

/**
 * Main driver extraction function - tries all strategies in priority order
 */
export const extractDriverKPIs = (text: string, pageData?: any): any[] => {
  console.log("Starting driver KPI extraction");
  
  // Strategy 1: Try structural extraction if page data is available
  if (pageData && Object.keys(pageData).length > 0) {
    console.log("Attempting structural extraction with page data");
    const structuralDrivers = extractDriverKPIsFromStructure(pageData);
    
    if (structuralDrivers.length >= 5) {
      console.log(`Found ${structuralDrivers.length} drivers with structural extraction`);
      return ensureAllMetrics(structuralDrivers);
    }
  }
  
  // Strategy 2: Try DSP Weekly Summary extraction for this specific format
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("Found DSP Weekly Summary format, using specialized extractor");
    const dspDrivers = extractDriversFromDSPWeeklySummary(text);
    
    if (dspDrivers.length >= 5) {
      console.log(`Found ${dspDrivers.length} drivers with DSP Weekly Summary extraction`);
      return ensureAllMetrics(dspDrivers);
    }
  }
  
  // Strategy 3: Fall back to sample data when no drivers found
  console.log("No drivers found with extraction strategies, using sample data");
  return ensureAllMetrics(generateSampleDrivers());
};

export {
  extractDriverKPIsFromStructure,
  extractDriversFromDSPWeeklySummary,
  generateSampleDrivers,
  ensureAllMetrics,
  createAllStandardMetrics
};
