
import { MentorDriverData, MentorReport } from "../types";

/**
 * Process mentor data for display and calculation
 */
export function processMentorData(data: MentorReport): MentorReport {
  // Process each driver to ensure data formatting is correct
  const processedDrivers = data.drivers.map(processDriverData);
  
  return {
    ...data,
    drivers: processedDrivers
  };
}

/**
 * Process individual driver data
 */
function processDriverData(driver: MentorDriverData): MentorDriverData {
  // Clean up field values
  return {
    ...driver,
    firstName: cleanNameField(driver.firstName),
    lastName: cleanNameField(driver.lastName),
    station: cleanStationField(driver.station),
    totalTrips: ensureNumber(driver.totalTrips),
    totalKm: calculateTotalKm(driver),
    totalHours: formatHours(driver.totalHours),
    acceleration: formatRating(driver.acceleration),
    braking: formatRating(driver.braking),
    cornering: formatRating(driver.cornering),
    distraction: formatRating(driver.distraction),
    seatbelt: formatRating(driver.seatbelt),
    speeding: formatRating(driver.speeding),
    following: formatRating(driver.following),
    overallRating: cleanFicoScore(driver.overallRating)
  };
}

/**
 * Clean up name fields
 */
function cleanNameField(name: string): string {
  if (!name) return "";
  
  // Remove any numeric prefix (sometimes driver IDs are mixed in)
  return name.replace(/^\d+\s*/, '').trim();
}

/**
 * Clean up station field
 */
function cleanStationField(station: string): string {
  if (!station) return "";
  
  // Standardize "unassigned" values
  const upperStation = station.toUpperCase();
  if (upperStation.includes('UNASSIGNED')) {
    return 'UNASSIGNED';
  }
  
  return station.trim();
}

/**
 * Ensure numeric values
 */
function ensureNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const numValue = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * Calculate total kilometers if not provided
 */
function calculateTotalKm(driver: MentorDriverData): number {
  // If already has km value, return it
  if (driver.totalKm && driver.totalKm > 0) {
    return ensureNumber(driver.totalKm);
  }
  
  // Otherwise, try to estimate from other fields (if needed)
  // This is a placeholder - in real implementation you might have a way to calculate this
  return 0;
}

/**
 * Format hours to be consistent
 */
function formatHours(hours: number | string): number | string {
  if (typeof hours === 'number') {
    // If it's a very large number (likely seconds), convert to hours format
    if (hours > 1000) {
      return Math.round(hours / 36) / 100; // Convert to hours with 2 decimal places
    }
    return hours;
  }
  
  if (!hours) return 0;
  
  // Try to parse as number
  const numHours = parseFloat(String(hours).replace(/[^\d.-]/g, ''));
  if (!isNaN(numHours)) {
    // If it's a very large number (likely seconds), convert to hours format
    if (numHours > 1000) {
      return Math.round(numHours / 36) / 100; // Convert to hours with 2 decimal places
    }
    return numHours;
  }
  
  // Return original if not parseable
  return hours;
}

/**
 * Format risk ratings to be consistent
 */
function formatRating(rating: string): string {
  if (!rating || rating === "-") return "Unknown";
  
  const lowerRating = rating.toLowerCase();
  
  // Handle numeric ratings (German style)
  if (/^\d+(\.\d+)?$/.test(rating)) {
    const numValue = parseFloat(rating);
    if (numValue === 0) return "-";
    if (numValue >= 1 && numValue <= 3) return "Low Risk";
    if (numValue === 4 || numValue === 5) return "Medium Risk";
    if (numValue > 5) return "High Risk";
  }
  
  // Handle text-based ratings
  if (lowerRating.includes('high')) {
    return "High Risk";
  } else if (lowerRating.includes('med')) {
    return "Medium Risk";
  } else if (lowerRating.includes('low')) {
    return "Low Risk";
  }
  
  return rating;
}

/**
 * Clean FICO score
 */
function cleanFicoScore(score: string): string {
  if (!score) return "Unknown";
  
  // If it's already a number format, return as is
  if (/^\d+$/.test(score)) return score;
  
  // Extract number from string
  const match = score.match(/(\d+)/);
  if (match) return match[1];
  
  return score;
}
