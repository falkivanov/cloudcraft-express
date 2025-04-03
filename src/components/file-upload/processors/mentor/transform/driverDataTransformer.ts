
import { MentorDriverData } from "../types";
import { extractRiskRating, extractNumericValue } from "./riskExtractor";

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
    const totalTrips = extractNumericValue(row['Total Trips'] || 0);
    
    // Handle Total Hours
    let totalHours = row['Total Hours'] || 0;
    
    // Check if hours is in time format (HH:MM)
    if (typeof totalHours === 'string' && totalHours.includes(':')) {
      // Keep time format as is for proper display
      totalHours = String(totalHours).trim();
    } else if (typeof totalHours === 'string') {
      totalHours = extractNumericValue(totalHours);
    }
    
    // Extract total kilometers with improved fallback detection
    let totalKm = 0;
    if (row['Total Driver km'] !== undefined) {
      totalKm = extractNumericValue(row['Total Driver km'] || 0);
    } else if (row['Total KM'] !== undefined) {
      totalKm = extractNumericValue(row['Total KM'] || 0);
    } else if (row['Total Kilometers'] !== undefined) {
      totalKm = extractNumericValue(row['Total Kilometers'] || 0);
    } else if (row['Total Distance'] !== undefined) {
      totalKm = extractNumericValue(row['Total Distance'] || 0);
    } else if (row['Miles'] !== undefined || row['Total Miles'] !== undefined) {
      // Convert miles to kilometers if that's what we have
      const miles = extractNumericValue(row['Miles'] || row['Total Miles'] || 0);
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
            totalKm = extractNumericValue(value);
            break;
          }
        }
      }
      
      // Last resort: check columns by position (F, G, H often contain distance)
      if (totalKm === 0) {
        for (const col of ['F', 'G', 'H']) {
          const value = row[col];
          if (value && (typeof value === 'number' || !isNaN(parseFloat(String(value))))) {
            totalKm = extractNumericValue(value);
            break;
          }
        }
      }
    }
    
    // Print out raw values for debugging - ADD MORE DEBUG INFORMATION
    console.log("Raw risk values from row columns:", {
      H: row['H'], // Acceleration
      J: row['J'], // Braking
      L: row['L'], // Cornering
      N: row['N'], // Speeding
      V: row['V']  // Seatbelt
    });
    
    // Also print mapped column values
    console.log("Values from mapped columns:", {
      accel: row['Acceleration'], 
      brake: row['Braking'],
      corner: row['Cornering'],
      speed: row['Speeding'],
      seatbelt: row['Seatbelt']
    });
    
    // Process risk values from specific columns and with more debugging
    // IMPORTANT: We're using both the mapped columns AND the direct column letters to ensure we get data
    const acceleration = extractRiskRating(row['Acceleration'] || row['H'] || '-');
    const braking = extractRiskRating(row['Braking'] || row['J'] || '-');
    const cornering = extractRiskRating(row['Cornering'] || row['L'] || '-');
    const speeding = extractRiskRating(row['Speeding'] || row['N'] || '-');
    const seatbelt = extractRiskRating(row['Seatbelt'] || row['V'] || '-');

    // Log processed values for debugging
    console.log("Processed risk values:", { 
      firstName, lastName, 
      accel: acceleration, 
      brake: braking, 
      corner: cornering, 
      speed: speeding,
      seatbelt: seatbelt
    });

    return {
      firstName,
      lastName,
      station,
      totalTrips,
      totalHours,
      totalKm,
      overallRating: String(row['Overall Rating'] || row['FICO Score'] || row['FICO® Safe Driving Score'] || ''),
      // Use directly processed risk values
      acceleration,
      braking,
      cornering,
      speeding,
      seatbelt,
      following: extractRiskRating(row['Following Distance']),
      distraction: extractRiskRating(row['Phone Distraction'])
    };
  });
}
