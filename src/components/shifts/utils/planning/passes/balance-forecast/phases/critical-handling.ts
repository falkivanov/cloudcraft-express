
import { BalanceParams, CriticalDay } from "../types";
import { aggressiveRebalancing } from "../aggressive-rebalancing";
import { identifyDaysWithExtraStaff } from "../helpers/staffing-imbalance";

/**
 * Handle critical understaffed days with aggressive rebalancing
 */
export function handleCriticalDays(
  criticalDays: CriticalDay[],
  params: BalanceParams
): void {
  const {
    sortedEmployees,
    weekDays,
    filledPositions,
    requiredEmployees,
    assignedWorkDays,
    formatDateKey,
    isTemporarilyFlexible,
    existingShifts,
    workShifts,
    freeShifts
  } = params;
  
  if (criticalDays.length === 0) return;
  
  // Look through all days that have staffing above the required level
  const daysWithExtraStaff = identifyDaysWithExtraStaff(
    weekDays, filledPositions, requiredEmployees
  );
  
  // Log what we're attempting to fix
  console.log(`Running aggressive rebalancing for ${criticalDays.length} critical days`);
  console.log(`Days with extra staff available: ${daysWithExtraStaff.length}`);
  
  // Try to move employees from days with extra staff to critically understaffed days
  if (daysWithExtraStaff.length > 0) {
    aggressiveRebalancing(
      sortedEmployees, weekDays, filledPositions, requiredEmployees,
      daysWithExtraStaff, criticalDays, assignedWorkDays, formatDateKey,
      isTemporarilyFlexible, existingShifts, workShifts, freeShifts
    );
  }
}

/**
 * Prioritize weekend days in critical day list
 */
export function prioritizeWeekendCriticalDays(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  criticalUnderfilledDays: { dayIndex: number, shortage: number }[]
): CriticalDay[] {
  // Weekend days get special treatment in our staffing algorithms
  const weekendIndices = [5, 6]; // Saturday and Sunday
  
  const criticalWeekendDays = weekendIndices.map(dayIndex => {
    if (dayIndex < weekDays.length) {
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      
      if (filled < required) {
        const shortage = required - filled;
        // Flag as critical even with small shortages on weekends
        return { dayIndex, shortage, isCritical: true };
      }
    }
    return null;
  }).filter(Boolean) as CriticalDay[];
  
  // Combine weekend and other critical days, ensuring weekend days appear first
  return [
    ...criticalWeekendDays,
    ...criticalUnderfilledDays.filter(day => day.dayIndex < 5)
  ];
}
