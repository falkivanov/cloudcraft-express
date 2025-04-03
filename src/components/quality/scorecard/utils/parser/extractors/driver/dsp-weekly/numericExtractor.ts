
/**
 * Extract numeric values from text with different formats
 */
export function extractNumericValues(text: string): number[] {
  const numericPattern = /\b(\d+(?:[.,]\d+)?)\b/g;
  const matches = Array.from(text.matchAll(numericPattern));
  
  if (!matches || matches.length === 0) {
    return [];
  }
  
  return matches.map(match => parseFloat(match[1].replace(',', '.')));
}

/**
 * Clean and parse a numeric value from a string
 */
export function cleanNumericValue(value: string): number {
  if (!value || value === "-") return 0;
  
  // Remove non-numeric characters except period, comma and dash
  const numericString = value.replace(/[^0-9.,\-]/g, '');
  
  // Handle percentages and other formatting
  const cleanValue = numericString
    .replace(/%/g, '')
    .replace(/,/g, '.');
  
  const result = parseFloat(cleanValue);
  return isNaN(result) ? 0 : result;
}
