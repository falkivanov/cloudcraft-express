
import { Employee } from "@/types/employee";
import { ShiftPlan } from "../../../types";

/**
 * Moves an employee from one day to another
 */
export function moveEmployeeBetweenDays(
  employee: Employee,
  overstaffedDayIndex: number,
  overstaffedDateKey: string,
  understaffedDayIndex: number,
  understaffedDateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[],
  daysWithExtraStaff: { dayIndex: number, excess: number }[]
): void {
  // Remove from overstaffed day
  const overstaffedDayEmployees = assignedWorkDays.get(overstaffedDateKey);
  if (overstaffedDayEmployees) {
    overstaffedDayEmployees.delete(employee.id);
  }
  
  // Decrement filled positions for overstaffed day
  filledPositions[overstaffedDayIndex]--;
  
  // Find and remove the work shift
  const workShiftIndex = workShifts.findIndex(
    shift => shift.employeeId === employee.id && shift.date === overstaffedDateKey
  );
  
  if (workShiftIndex !== -1) {
    workShifts.splice(workShiftIndex, 1);
  }
  
  // Add to understaffed day
  const understaffedDayEmployees = assignedWorkDays.get(understaffedDateKey);
  if (understaffedDayEmployees) {
    understaffedDayEmployees.add(employee.id);
  }
  
  // Add new work shift for understaffed day
  workShifts.push({
    employeeId: employee.id,
    date: understaffedDateKey,
    shiftType: "Arbeit"
  });
  
  // Increment filled positions for understaffed day
  filledPositions[understaffedDayIndex]++;
  
  // Update the excess for the overstaffed day
  for (const day of daysWithExtraStaff) {
    if (day.dayIndex === overstaffedDayIndex) {
      day.excess--;
      break;
    }
  }
}

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

/**
 * Prioritizes days for rebalancing based on staffing imbalance ratio
 * Returns days sorted by most understaffed first
 */
export function prioritizeDaysForRebalancing(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string
): { dayIndex: number, dateKey: string, imbalance: number }[] {
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
): { dayIndex: number, dateKey: string, excess: number }[] {
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

