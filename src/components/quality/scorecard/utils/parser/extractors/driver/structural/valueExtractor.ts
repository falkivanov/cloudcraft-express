
/**
 * Extract a numeric value from a string, handling various formats
 */
export function extractNumeric(value: string): number {
  if (!value || value === "-") return 0;
  
  // Remove any non-numeric characters except for period and comma
  const numericString = value.replace(/[^0-9.,]/g, '');
  
  // Handle different number formats
  let cleanNumber = numericString;
  
  // Replace comma with period if it's used as a decimal separator
  if (numericString.includes(',') && !numericString.includes('.')) {
    cleanNumber = numericString.replace(',', '.');
  }
  
  // If there are both commas and periods, assume comma is thousands separator
  if (numericString.includes(',') && numericString.includes('.')) {
    cleanNumber = numericString.replace(/,/g, '');
  }
  
  const result = parseFloat(cleanNumber);
  return isNaN(result) ? 0 : result;
}
