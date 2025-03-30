
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

/**
 * Extract driver KPIs from text content
 * @param text Text content to extract driver KPIs from
 * @returns Array of DriverKPIs
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  return extractDriversOrUseSampleData(text);
};

export {
  extractDriverKPIsFromStructure,
  extractDriverKPIsFromText,
  generateSampleDrivers,
  determineMetricStatus,
  extractDriversFromDSPWeeklySummary,
  extractDriversWithFlexiblePattern,
  extractDriversLineByLine,
  extractDriversWithEnhancedPatterns
};
