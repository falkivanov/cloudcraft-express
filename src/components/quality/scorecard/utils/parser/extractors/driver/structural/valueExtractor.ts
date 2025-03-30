
/**
 * Helper function to extract numeric values from strings, handling percentages and commas
 */
export const extractNumeric = (str: string): number => {
  if (!str) return NaN;
  
  // Remove % symbol and replace commas with dots for decimal notation
  const cleanStr = str.replace('%', '').replace(',', '.');
  return parseFloat(cleanStr);
};
