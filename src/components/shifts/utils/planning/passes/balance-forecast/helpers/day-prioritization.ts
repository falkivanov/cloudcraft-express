
import { calculateStaffingImbalanceRatio } from './staffing-calculations';

/**
 * Prioritizes days for rebalancing based on staffing imbalance ratio
 * Returns days sorted by most understaffed first
 */
export function prioritizeDaysForRebalancing(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string
): { dayIndex: number, dateKey: string, imbalance: number, filled: number, required: number }[] {
  const daysWithImbalance = weekDays.map((day, index) => {
    const required = requiredEmployees[index] || 0;
    const filled = filledPositions[index];
    const imbalance = calculateStaffingImbalanceRatio(filled, required);
    
    return {
      dayIndex: index,
      dateKey: formatDateKey(day),
      imbalance,
      filled,
      required
    };
  });
  
  // Sort by imbalance (highest first)
  return daysWithImbalance
    .filter(day => day.imbalance > 0)  // Only include days with imbalance
    .sort((a, b) => b.imbalance - a.imbalance);
}

/**
 * Identifies the optimal sources for employee transfers
 * Prefers taking from days with smaller relative understaffing
 */
export function findOptimalSourceDays(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  excludeDayIndex: number,
  formatDateKey: (date: Date) => string
): { dayIndex: number, dateKey: string, excess: number, surplusRatio: number, filled: number, required: number }[] {
  return weekDays
    .map((day, index) => {
      if (index === excludeDayIndex) return null;
      
      const required = requiredEmployees[index] || 0;
      const filled = filledPositions[index];
      const excess = Math.max(0, filled - required);
      
      // Calculate surplus ratio (how much extra staff relative to requirements)
      const surplusRatio = required > 0 ? (filled / required) - 1 : 0;
      
      return {
        dayIndex: index,
        dateKey: formatDateKey(day),
        excess,
        surplusRatio,
        filled,
        required
      };
    })
    .filter(day => day !== null && day.excess > 0)
    .sort((a, b) => b.surplusRatio - a.surplusRatio); // Sort by highest surplus ratio first
}
