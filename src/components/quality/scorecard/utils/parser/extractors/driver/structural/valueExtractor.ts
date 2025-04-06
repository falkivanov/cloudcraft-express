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
  
  // Handle percentages - if the original string contains '%', and the number is not already small (< 1),
  // divide by 100 to ensure consistent percentage representation
  if (value.includes('%') && result > 1) {
    // Only convert if not already a decimal percentage
    if (result > 100) {
      result = result / 100;
    }
  }
  
  return isNaN(result) ? 0 : result;
}

/**
 * Determines if a string contains a numeric value
 */
export function isNumeric(value: string): boolean {
  if (!value) return false;
  return /^-?\d*\.?\d+%?$/.test(value.trim().replace(/,/g, '.'));
}

/**
 * Extracts a value from a table cell, handling various formats
 * including numeric values, percentages, and text
 */
export function extractCellValue(cell: string): { value: number; isPercentage: boolean; } {
  if (!cell) return { value: 0, isPercentage: false };
  
  const trimmed = cell.trim();
  const isPercentage = trimmed.includes('%');
  
  // Extract the numeric value
  let value = extractNumeric(trimmed);
  
  // For percentages, ensure consistent representation
  if (isPercentage && value > 1 && value <= 100) {
    // Keep as-is, this is a proper percentage representation
    // value = value / 100; - We'll handle the display in MetricCell
  } else if (isPercentage && value > 100) {
    // This is likely already multiplied by 100, so we bring it back to decimal form
    value = value / 100;
  }
  
  return {
    value,
    isPercentage
  };
}
