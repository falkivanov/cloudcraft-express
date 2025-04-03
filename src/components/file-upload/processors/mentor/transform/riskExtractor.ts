
import { cleanNumericValue } from "@/components/quality/scorecard/utils/parser/extractors/driver/dsp-weekly/numericExtractor";

/**
 * Extracts and standardizes risk ratings from various formats
 * @param value The raw risk value from the Excel file
 * @returns A standardized risk rating string
 */
export function extractRiskRating(value: any): string {
  // First check if value exists and isn't empty or a dash
  if (!value || value === '-' || value === '' || value === null || value === undefined) {
    return '-';
  }
  
  // If it's an object (which can happen with Excel), try to extract meaningful values
  if (typeof value === 'object') {
    console.log("Processing object value for risk:", value);
    
    // Check for undefined object types
    if (value._type === 'undefined' || value.value === 'undefined') {
      return '-';
    }
    
    // Try to extract a meaningful value from the object
    if ('text' in value && value.text) return String(value.text);
    if ('value' in value && value.value) return String(value.value);
    if ('result' in value) return String(value.result);
    
    // Try to stringify the object to see if we can extract anything useful
    try {
      const stringValue = JSON.stringify(value);
      if (stringValue.includes('Low') || stringValue.includes('low')) return 'Low Risk';
      if (stringValue.includes('Medium') || stringValue.includes('med')) return 'Medium Risk';
      if (stringValue.includes('High') || stringValue.includes('high')) return 'High Risk';
    } catch (e) {
      // Ignore JSON stringify errors
    }
    
    return '-';
  }
  
  // Handle numeric risk ratings
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);
    if (numValue === 0) return '-';
    if (numValue >= 1 && numValue <= 3) return 'Low Risk';
    if (numValue === 4 || numValue === 5) return 'Medium Risk';
    if (numValue > 5) return 'High Risk';
  }
  
  // Process string values
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    
    // Skip empty or dash values
    if (lowerValue === '-' || lowerValue === '' || lowerValue === 'unknown') {
      return '-';
    }
    
    // Handle risk labels directly
    if (lowerValue.includes('low') || lowerValue.includes('niedrig')) return 'Low Risk';
    if (lowerValue.includes('med') || lowerValue.includes('mittel')) return 'Medium Risk';
    if (lowerValue.includes('high') || lowerValue.includes('hoch')) return 'High Risk';
    
    // Handle Yes/No values (sometimes used for risk indicators)
    if (lowerValue.includes('ja') || lowerValue.includes('yes')) return 'High Risk';
    if (lowerValue.includes('nein') || lowerValue.includes('no')) return 'Low Risk';
  }
  
  // Return the original value as a string if nothing else matches
  return String(value);
}

/**
 * Extracts and formats a numeric value
 * @param value The raw numeric value
 * @returns A cleaned numeric value
 */
export function extractNumericValue(value: any): number {
  if (!value) return 0;
  
  // If it's already a number, return it
  if (typeof value === 'number') return value;
  
  // Try to convert string to number
  return cleanNumericValue(String(value));
}
