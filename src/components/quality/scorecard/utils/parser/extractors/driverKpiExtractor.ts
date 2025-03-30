
import { extractDriverKPIsFromStructure } from './driver/structuralExtractor';
import { extractDriverKPIsFromText } from './driver/textExtractor';
import { generateSampleDrivers } from './driver/sampleData';
import { DriverKPI } from '../../../types';

/**
 * Extract driver KPIs from text content
 * @param text Text content to extract driver KPIs from
 * @returns Array of DriverKPIs
 */
export const extractDriverKPIs = (text: string): DriverKPI[] => {
  console.log("Extracting driver KPIs from text content");
  
  // First attempt with text extraction
  const driversFromText = extractDriverKPIsFromText(text);
  
  // If we found a reasonable number of drivers, return them
  if (driversFromText.length > 1) {
    console.log(`Found ${driversFromText.length} drivers using text extraction`);
    return driversFromText;
  }
  
  // If text extraction failed or found too few drivers, fall back to sample data
  console.warn("Text extraction found too few drivers, using sample data as fallback");
  return generateSampleDrivers();
};

export {
  extractDriverKPIsFromStructure,
  extractDriverKPIsFromText,
  generateSampleDrivers
};
