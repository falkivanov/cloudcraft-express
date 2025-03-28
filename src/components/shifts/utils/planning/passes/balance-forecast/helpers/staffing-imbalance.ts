import { Employee } from "@/types/employee";

/**
 * Identifies overfilled and underfilled days based on required and filled positions
 */
export function identifyStaffingImbalances(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
) {
  const overfilledDays: { dayIndex: number, excess: number }[] = [];
  const underfilledDays: { dayIndex: number, shortage: number }[] = [];
  
  // Calculate total required and filled positions to determine if we're globally understaffed
  let totalRequired = 0;
  let totalFilled = 0;
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    totalRequired += required;
    totalFilled += filled;
    
    if (filled > required && required > 0) {
      overfilledDays.push({ dayIndex, excess: filled - required });
    } else if (filled < required) {
      underfilledDays.push({ dayIndex, shortage: required - filled });
    }
  });
  
  // Sort by most overfilled/underfilled first
  overfilledDays.sort((a, b) => b.excess - a.excess);
  underfilledDays.sort((a, b) => b.shortage - a.shortage);
  
  return { 
    overfilledDays, 
    underfilledDays, 
    totalRequired, 
    totalFilled 
  };
}

/**
 * Identifies days with extra staff that could potentially be rebalanced
 */
export function identifyDaysWithExtraStaff(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): { dayIndex: number, excess: number }[] {
  const daysWithExtraStaff: { dayIndex: number, excess: number }[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    // Only consider days with at least 1 extra person after meeting requirements
    if (filled > required && filled > 1) {
      daysWithExtraStaff.push({ dayIndex, excess: filled - required });
    }
  });
  
  // Sort by least critical excess first (to keep days with many extra staff stable if possible)
  daysWithExtraStaff.sort((a, b) => a.excess - b.excess);
  
  return daysWithExtraStaff;
}

/**
 * Identifies critically understaffed days after initial balancing
 */
export function identifyCriticalUnderfilledDays(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): { dayIndex: number, shortage: number }[] {
  const criticalUnderfilledDays: { dayIndex: number, shortage: number }[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled < required) {
      criticalUnderfilledDays.push({ dayIndex, shortage: required - filled });
    }
  });
  
  // Sort by most understaffed first
  if (criticalUnderfilledDays.length > 0) {
    criticalUnderfilledDays.sort((a, b) => b.shortage - a.shortage);
  }
  
  return criticalUnderfilledDays;
}
