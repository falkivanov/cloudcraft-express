
/**
 * Extract a numeric value from a string, handling various formats
 */
export function extractNumeric(value: string): number {
  if (!value || value === "-") return 0;
  
  // Remove any non-numeric characters except for period, comma and dash (could be negative)
  const numericString = value.replace(/[^0-9.,\-]/g, '');
  
  // Handle different number formats
  let cleanNumber = numericString;
  
  // Handle negative numbers first
  const isNegative = numericString.startsWith('-');
  if (isNegative) {
    cleanNumber = numericString.substring(1);
  }
  
  // Replace comma with period if it's used as a decimal separator
  if (cleanNumber.includes(',') && !cleanNumber.includes('.')) {
    cleanNumber = cleanNumber.replace(',', '.');
  }
  
  // If there are both commas and periods, assume comma is thousands separator
  if (cleanNumber.includes(',') && cleanNumber.includes('.')) {
    cleanNumber = cleanNumber.replace(/,/g, '');
  }
  
  let result = parseFloat(cleanNumber);
  
  // Apply negative sign if needed
  if (isNegative) {
    result = -result;
  }
  
  return isNaN(result) ? 0 : result;
}
