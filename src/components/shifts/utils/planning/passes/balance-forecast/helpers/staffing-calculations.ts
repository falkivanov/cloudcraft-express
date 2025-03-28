
/**
 * Calculates staffing imbalance ratio for a day
 * Higher value means more severely understaffed relative to requirements
 */
export function calculateStaffingImbalanceRatio(
  filledPositions: number,
  requiredPositions: number
): number {
  // If we have enough staff, ratio is 0 (no imbalance)
  if (filledPositions >= requiredPositions) return 0;
  
  // Calculate how far we are from meeting requirements as a percentage
  // Higher percentage means bigger staffing gap
  if (requiredPositions === 0) return 0;
  
  // Calculate: 1 - (filled/required) to get shortage percentage
  // This gives higher values to days with bigger shortages relative to requirements
  return 1 - (filledPositions / requiredPositions);
}
