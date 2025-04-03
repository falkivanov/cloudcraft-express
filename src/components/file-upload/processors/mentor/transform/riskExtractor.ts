
/**
 * Extracts a standardized risk rating from various input formats
 * @param value The risk rating value from the Excel file
 */
export function extractRiskRating(value: any): string {
  if (!value || value === '-' || value === undefined) {
    return '-';
  }
  
  // Convert to string to handle different data types
  const strValue = String(value).trim().toLowerCase();
  
  // Handle empty cases
  if (strValue === '' || strValue === '-' || strValue === 'n/a') {
    return '-';
  }
  
  // Handle numeric ratings (German style with numeric risk ratings)
  if (/^\d+(\.\d+)?$/.test(strValue)) {
    const numValue = parseFloat(strValue);
    if (numValue === 0) return '-';
    if (numValue > 0 && numValue <= 3) return 'Low Risk';
    if (numValue > 3 && numValue <= 5) return 'Medium Risk';
    if (numValue > 5) return 'High Risk';
  }
  
  // Handle text-based ratings
  if (strValue.includes('low')) {
    return 'Low Risk';
  } else if (strValue.includes('med')) {
    return 'Medium Risk';
  } else if (strValue.includes('high')) {
    return 'High Risk';
  }
  
  // Add more detailed logging for debugging
  console.log(`Processing risk value: "${value}" (type: ${typeof value}, as string: "${strValue}")`);
  
  // If we can't determine the format, return the original value
  return String(value);
}

/**
 * Extracts a numeric value from various input formats
 * @param value The input value that should be converted to a number
 */
export function extractNumericValue(value: any): number {
  // If already a number, return it
  if (typeof value === 'number') return value;
  
  // Handle undefined, null or empty string
  if (value === undefined || value === null || value === '' || value === '-') {
    return 0;
  }
  
  // Convert to string and try to extract numeric value
  const strValue = String(value).trim();
  
  // Handle empty values
  if (strValue === '' || strValue === '-' || strValue === 'n/a') {
    return 0;
  }
  
  // If this looks like an anonymized ID, don't try to extract numeric value
  if (/^[a-zA-Z0-9+\/=]+$/.test(strValue) && strValue.length > 10) {
    console.log(`Skipping numeric extraction for what appears to be an ID: ${strValue}`);
    return 0;
  }
  
  // Try to extract numeric values with regex
  const matches = strValue.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (matches && matches.length > 0) {
    return parseFloat(matches[0]);
  }
  
  // If no match found, log for debugging
  console.log(`Failed to extract numeric value from: "${value}" (type: ${typeof value})`);
  return 0;
}
