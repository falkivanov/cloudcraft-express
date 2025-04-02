
import { DriverKPI } from '../../../../../types';
import { extractDriverKPIs } from '../';

/**
 * Simplified extractor that uses our consolidated extraction approach
 */
export const extractDriversOrUseSampleData = (text: string, pageData?: any): DriverKPI[] => {
  return extractDriverKPIs(text, pageData);
};

/**
 * Legacy compatibility function
 */
export const tryAllExtractionStrategies = (text: string): DriverKPI[] => {
  return extractDriverKPIs(text);
};

/**
 * Legacy compatibility function
 */
export const extractDriversByPage = (text: string, pageData?: any): DriverKPI[] => {
  return extractDriverKPIs(text, pageData);
};

// No need to re-export since these functions are already exported above
