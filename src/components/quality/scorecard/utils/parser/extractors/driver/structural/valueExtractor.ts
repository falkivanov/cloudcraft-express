
/**
 * Extract a numeric value from a string, handling various formats
 * but preserving the original value without transformations
 */
export function extractNumeric(value: string): number {
  if (!value || value === "-" || value.trim() === "-") return 0;
  
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

/**
 * Determines if a string contains a numeric value or a dash
 */
export function isNumeric(value: string): boolean {
  if (!value) return false;
  
  // Accept dash as valid non-numeric placeholder
  if (value.trim() === "-") return true;
  
  // Check for numeric values (with possible percent sign)
  return /^-?\d*\.?\d+%?$/.test(value.trim().replace(/,/g, '.'));
}

/**
 * Extracts a value from a table cell, handling various formats
 * including numeric values, percentages, dashes, and text
 */
export function extractCellValue(cell: string): { value: number; isPercentage: boolean; isDash: boolean; } {
  if (!cell) return { value: 0, isPercentage: false, isDash: false };
  
  const trimmed = cell.trim();
  
  // Handle dash case
  if (trimmed === "-") {
    return { value: 0, isPercentage: false, isDash: true };
  }
  
  const isPercentage = trimmed.includes('%');
  
  // Extract the numeric value
  const value = extractNumeric(trimmed);
  
  return { value, isPercentage, isDash: false };
}
