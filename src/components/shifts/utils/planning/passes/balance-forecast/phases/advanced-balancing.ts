
import { BalanceParams } from "../types";
import { performAdvancedRebalancing } from "../helpers/advanced-rebalancing";

/**
 * Apply advanced rebalancing for significant imbalances
 * Especially focused on weekend days which are critically important
 */
export function applyAdvancedBalancing(
  weekendShortage: number,
  params: BalanceParams
): void {
  const {
    sortedEmployees,
    weekDays,
    filledPositions,
    requiredEmployees,
    formatDateKey,
    isTemporarilyFlexible,
    assignedWorkDays,
    existingShifts,
    workShifts,
    freeShifts
  } = params;
  
  if (weekendShortage > 0) {
    console.log(`After aggressive rebalancing, weekend days are still short by ${weekendShortage} employees`);
    
    // If we have a severe imbalance (weekend days still significantly understaffed),
    // perform even more advanced rebalancing
    const staffingImbalances = weekDays.map((_, dayIndex) => {
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      return { dayIndex, ratio: required > 0 ? filled / required : 1 };
    });
    
    // Calculate the variance in staffing ratios
    const ratios = staffingImbalances.map(day => day.ratio).filter(r => !isNaN(r) && isFinite(r));
    const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    const weekendRatios = staffingImbalances.filter(day => day.dayIndex >= 5).map(day => day.ratio);
    const hasSignificantWeekendImbalance = weekendRatios.some(r => r < 0.7); // If weekend is below 70% staffed
    
    if (hasSignificantWeekendImbalance) {
      console.log("Detected significant weekend staffing imbalance, performing advanced rebalancing");
      performAdvancedRebalancing(
        sortedEmployees, weekDays, filledPositions, requiredEmployees,
        formatDateKey, isTemporarilyFlexible, assignedWorkDays,
        existingShifts, workShifts, freeShifts
      );
    }
  }
}
