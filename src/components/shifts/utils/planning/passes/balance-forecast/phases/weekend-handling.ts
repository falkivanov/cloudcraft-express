
import { BalanceParams } from "../types";
import { prioritizeWeekendStaffing } from "../helpers/employee-assignment";

/**
 * Special handling for weekend days which have higher priority
 */
export function handleWeekendDays(params: BalanceParams): void {
  const { 
    sortedEmployees, 
    weekDays, 
    filledPositions, 
    requiredEmployees,
    assignedWorkDays,
    formatDateKey,
    isTemporarilyFlexible,
    employeeAssignments,
    existingShifts,
    workShifts
  } = params;
  
  // Weekend indices
  const saturdayIndex = 5;
  const sundayIndex = 6;
  const weekendIndices = [saturdayIndex, sundayIndex];
  
  // Process each weekend day
  weekendIndices.forEach(dayIndex => {
    if (dayIndex < weekDays.length) {
      const day = weekDays[dayIndex];
      const dateKey = formatDateKey(day);
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      const ratio = required > 0 ? (filled / required) * 100 : 100;
      
      if (filled < required) {
        prioritizeWeekendStaffing(
          dayIndex,
          dateKey,
          day,
          requiredEmployees,
          filledPositions,
          weekDays,
          sortedEmployees,
          assignedWorkDays,
          employeeAssignments,
          isTemporarilyFlexible,
          existingShifts,
          workShifts
        );
      }
    }
  });
}

/**
 * Calculates weekend staffing shortage
 */
export function calculateWeekendShortage(
  weekDays: Date[],
  requiredEmployees: Record<number, number>,
  filledPositions: Record<number, number>
): number {
  const weekendIndices = [5, 6]; // Saturday and Sunday
  
  return weekendIndices.reduce((total, dayIndex) => {
    if (dayIndex < weekDays.length) {
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      return total + (required > filled ? required - filled : 0);
    }
    return total;
  }, 0);
}
