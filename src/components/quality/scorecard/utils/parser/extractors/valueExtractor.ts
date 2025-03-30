
/**
 * Extract numeric values from text
 */
export const extractNumericValues = (text: string): number[] => {
  const matches = text.match(/\b\d+(?:\.\d+)?\b/g);
  return matches ? matches.map(m => parseFloat(m)) : [];
};
