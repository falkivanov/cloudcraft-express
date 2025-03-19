import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { balanceEmployeeDistribution } from "./balance-employee-distribution";
import { ensureFullWorkingDays } from "./ensure-full-working-days";
import { aggressiveRebalancing } from "./aggressive-rebalancing";

// Improves the distribution of employees to better match forecast requirements and ensures all employees are assigned their full working days
export function runBalanceForecastPass(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  employeeAssignments: Record<string, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  // PHASE 1: Identify overfilled and underfilled days
  const overfilledDays: { dayIndex: number, excess: number }[] = [];
  const underfilledDays: { dayIndex: number, shortage: number }[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled > required && required > 0) {
      overfilledDays.push({ dayIndex, excess: filled - required });
    } else if (filled < required) {
      underfilledDays.push({ dayIndex, shortage: required - filled });
    }
  });
  
  // Sort by most overfilled/underfilled first
  overfilledDays.sort((a, b) => b.excess - a.excess);
  underfilledDays.sort((a, b) => b.shortage - a.shortage);
  
  // PHASE 2: Aggressively balance forecast by moving employees from overfilled to underfilled days
  if (underfilledDays.length > 0 && overfilledDays.length > 0) {
    balanceEmployeeDistribution(
      sortedEmployees, weekDays, filledPositions, requiredEmployees,
      overfilledDays, underfilledDays, assignedWorkDays, formatDateKey,
      isTemporarilyFlexible, employeeAssignments, existingShifts, workShifts, freeShifts
    );
  }
  
  // PHASE 3: Ensure all employees are working their specified number of days
  ensureFullWorkingDays(
    sortedEmployees, weekDays, filledPositions, requiredEmployees,
    assignedWorkDays, formatDateKey, isTemporarilyFlexible, employeeAssignments,
    existingShifts, workShifts, freeShifts
  );
  
  // PHASE 4: Final balancing pass - look for critical understaffed days again
  const criticalUnderfilledDays: { dayIndex: number, shortage: number }[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled < required) {
      criticalUnderfilledDays.push({ dayIndex, shortage: required - filled });
    }
  });
  
  if (criticalUnderfilledDays.length > 0) {
    // Sort by most understaffed first
    criticalUnderfilledDays.sort((a, b) => b.shortage - a.shortage);
    
    // Now look through all days that have staffing above the required level
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
    
    // Try to move employees from any day with extra staff to critically understaffed days
    if (daysWithExtraStaff.length > 0) {
      aggressiveRebalancing(
        sortedEmployees, weekDays, filledPositions, requiredEmployees,
        daysWithExtraStaff, criticalUnderfilledDays, assignedWorkDays, formatDateKey,
        isTemporarilyFlexible, existingShifts, workShifts, freeShifts
      );
    }
  }
}
