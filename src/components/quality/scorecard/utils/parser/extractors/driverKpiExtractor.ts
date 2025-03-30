
import { extractDriversOrUseSampleData } from './driver/strategies';
import { 
  extractDriverKPIsFromStructure, 
  extractDriverKPIsFromText,
  generateSampleDrivers,
  extractDriversFromDSPWeeklySummary,
  extractDriversWithFlexiblePattern,
  extractDriversLineByLine,
  extractDriversWithEnhancedPatterns
} from './driver';
import { determineMetricStatus } from './driver/utils/metricStatus';
import { DriverKPI } from '../../../types';
import { ensureAllMetrics } from './driver/utils/metricUtils';

/**
 * Extract driver KPIs from text content
 * @param text Text content to extract driver KPIs from
 * @returns Array of DriverKPIs
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  
  // Try our most robust extraction method
  const drivers = extractDriversOrUseSampleData(text);
  
  // Ensure all drivers have complete metric sets
  const enhancedDrivers = ensureAllMetrics(drivers);
  
  console.log(`Returning ${enhancedDrivers.length} driver KPIs`);
  return enhancedDrivers;
};

export {
  extractDriverKPIsFromStructure,
  extractDriverKPIsFromText,
  generateSampleDrivers,
  determineMetricStatus,
  extractDriversFromDSPWeeklySummary,
  extractDriversWithFlexiblePattern,
  extractDriversLineByLine,
  extractDriversWithEnhancedPatterns,
  ensureAllMetrics
};
