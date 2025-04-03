
import { cleanNumericValue } from "@/components/quality/scorecard/utils/parser/extractors/driver/dsp-weekly/numericExtractor";
import { MentorDriverData } from "./types";

/**
 * Transforms the raw data using the detected column mapping
 * @param rawData The raw data from Excel
 * @param headerRow The detected header row
 * @param columnMapping The column mapping from headers to columns
 */
export function transformDataWithHeaders(rawData: any[], headerRow: any, columnMapping: Record<string, string>): any[] {
  // Skip header row and filter empty rows
  const startRow = headerRow ? rawData.indexOf(headerRow) + 1 : 1;
  const dataRows = rawData.slice(startRow).filter(row => {
    // Check if row contains essential data
    const firstNameCol = columnMapping['Driver First Name'];
    const lastNameCol = columnMapping['Driver Last Name'];
    const stationCol = columnMapping['Station'];
    
    return (
      // Check if there's a name or station value
      (row[firstNameCol] || row[lastNameCol] || row[stationCol]) &&
      // Make sure it's not an empty header row
      !(typeof row[firstNameCol] === 'string' && row[firstNameCol].toLowerCase().includes('first'))
    );
  });
  
  // Transform the data with correct column names
  return dataRows.map(row => {
    const transformed: Record<string, any> = {};
    
    // For each needed field, get the value from the right column
    Object.entries(columnMapping).forEach(([field, col]) => {
      transformed[field] = row[col];
    });
    
    return transformed;
  });
}

/**
 * Converts raw transformed data to structured driver data
 * @param transformedData The transformed data with proper column names
 */
export function convertToDriverData(transformedData: any[]): MentorDriverData[] {
  return transformedData.map(row => {
    // Extract name intelligently
    let firstName = row['Driver First Name'] || '';
    let lastName = row['Driver Last Name'] || '';
    
    // If the name in a column contains a number (driver ID), try to extract the name from subsequent columns
    if (/^\d+$/.test(firstName.toString())) {
      // If first name is a number, it's likely an ID
      // Try to extract name from another field
      firstName = row['B'] || row['C'] || '';
    }
    
    // Clean up station format
    let station = row['Station'] || '';
    if (!station && row['D']) {
      station = row['D'];
    }
    
    // Ensure string type conversion
    firstName = String(firstName).trim();
    lastName = String(lastName).trim();
    station = String(station).trim();
    
    // Standardize "UNASSIGNED" values
    if (station.toUpperCase().includes('UNASSIGNED')) {
      station = 'UNASSIGNED';
    }
    
    // Clean and convert numeric values
    const totalTrips = cleanNumericValue(String(row['Total Trips'] || 0));
    
    // Handle Total Hours
    let totalHours = row['Total Hours'] || 0;
    
    // Check if hours is in time format (HH:MM)
    if (typeof totalHours === 'string' && totalHours.includes(':')) {
      // Keep time format as is for proper display
      totalHours = String(totalHours).trim();
    } else if (typeof totalHours === 'string') {
      totalHours = cleanNumericValue(totalHours);
    }
    
    // Extract total kilometers with improved fallback detection
    let totalKm = 0;
    if (row['Total Driver km'] !== undefined) {
      totalKm = cleanNumericValue(String(row['Total Driver km'] || 0));
    } else if (row['Total KM'] !== undefined) {
      totalKm = cleanNumericValue(String(row['Total KM'] || 0));
    } else if (row['Total Kilometers'] !== undefined) {
      totalKm = cleanNumericValue(String(row['Total Kilometers'] || 0));
    } else if (row['Total Distance'] !== undefined) {
      totalKm = cleanNumericValue(String(row['Total Distance'] || 0));
    } else if (row['Miles'] !== undefined || row['Total Miles'] !== undefined) {
      // Convert miles to kilometers if that's what we have
      const miles = cleanNumericValue(String(row['Miles'] || row['Total Miles'] || 0));
      totalKm = miles * 1.60934; // Miles to km conversion
    } else {
      // Additional fallback checks for common patterns
      for (const key of Object.keys(row)) {
        if (
          key.toLowerCase().includes('km') || 
          key.toLowerCase().includes('kilometer') || 
          key.toLowerCase().includes('distance')
        ) {
          const value = row[key];
          if (value && (typeof value === 'number' || !isNaN(parseFloat(String(value))))) {
            totalKm = cleanNumericValue(String(value));
            break;
          }
        }
      }
      
      // Last resort: check columns by position (F, G, H often contain distance)
      if (totalKm === 0) {
        for (const col of ['F', 'G', 'H']) {
          const value = row[col];
          if (value && (typeof value === 'number' || !isNaN(parseFloat(String(value))))) {
            totalKm = cleanNumericValue(String(value));
            break;
          }
        }
      }
    }
    
    // Improved risk extraction with fallbacks for empty or "-" values
    const extractRiskRating = (value: any): string => {
      if (!value || value === '-' || value === '' || value === null || value === undefined) {
        return '-';
      }
      
      // If it's a number, convert to risk rating
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = Number(value);
        if (numValue === 0) return '-';
        if (numValue >= 1 && numValue <= 3) return 'Low Risk';
        if (numValue === 4 || numValue === 5) return 'Medium Risk';
        if (numValue > 5) return 'High Risk';
      }
      
      // Process "Low", "Medium", "High" risk values
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        
        // Handle German terms
        if (lowerValue.includes('niedrig') || lowerValue.includes('low')) return 'Low Risk';
        if (lowerValue.includes('mittel') || lowerValue.includes('med')) return 'Medium Risk';
        if (lowerValue.includes('hoch') || lowerValue.includes('high')) return 'High Risk';
        
        // Handle Yes/No values (sometimes used for risk indicators)
        if (lowerValue.includes('ja') || lowerValue.includes('yes')) return 'High Risk';
        if (lowerValue.includes('nein') || lowerValue.includes('no')) return 'Low Risk';
      }
      
      // Return the original value as a string
      return String(value);
    };
    
    return {
      firstName,
      lastName,
      station,
      totalTrips,
      totalHours,
      totalKm,
      overallRating: String(row['Overall Rating'] || row['FICO Score'] || row['FICO® Safe Driving Score'] || ''),
      acceleration: extractRiskRating(row['Acceleration']),
      braking: extractRiskRating(row['Braking']),
      cornering: extractRiskRating(row['Cornering']),
      speeding: extractRiskRating(row['Speeding'] || row['V']),  // Also check column V which should have speeding data
      seatbelt: extractRiskRating(row['Seatbelt']),
      following: extractRiskRating(row['Following Distance']),
      distraction: extractRiskRating(row['Phone Distraction'])
    };
  });
}

/**
 * Filters out invalid driver records
 * @param drivers The array of driver data
 */
export function filterValidDrivers(drivers: MentorDriverData[]): MentorDriverData[] {
  // Filter out drivers with empty names or obvious headers
  return drivers.filter(driver => {
    const isValid = 
      (driver.firstName || driver.lastName) && 
      !driver.firstName.toLowerCase().includes('first') &&
      !driver.lastName.toLowerCase().includes('last');
    
    return isValid;
  });
}
