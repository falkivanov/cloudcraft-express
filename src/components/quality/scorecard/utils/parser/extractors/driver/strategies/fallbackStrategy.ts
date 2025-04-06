
import { DriverKPI } from '../../../../../types';
import { generateSampleDrivers } from '../sampleData';
import { extractDriversUsingMultipleStrategies } from './multiStrategy';

/**
 * Try to extract drivers or return sample data as a last resort
 */
export function extractDriversOrUseSampleData(text: string): DriverKPI[] {
  // First try with multiple strategies
  const drivers = extractDriversUsingMultipleStrategies(text);
  
  if (drivers.length > 3) {
    console.log(`Successfully extracted ${drivers.length} unique drivers`);
    return drivers;
  }
  
  // If we get here, all extraction methods failed - use sample data
  console.warn("All extraction methods failed, using sample data");
  return generateSampleDrivers();
}
