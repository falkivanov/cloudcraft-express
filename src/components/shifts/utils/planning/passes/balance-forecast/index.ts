
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { balanceEmployeeDistribution } from "./balance-employee-distribution";
import { ensureFullWorkingDays } from "./ensure-full-working-days";
import { aggressiveRebalancing } from "./aggressive-rebalancing";
import { 
  prioritizeDaysForRebalancing,
  findOptimalSourceDays,
  calculateStaffingImbalanceRatio
} from "./helpers/employee-movement";
import {
  identifyStaffingImbalances,
  identifyDaysWithExtraStaff,
  identifyCriticalUnderfilledDays
} from "./helpers/staffing-imbalance";
import {
  calculatePossibleAssignments,
  identifyUnderutilizedEmployees
} from "./helpers/employee-utilization";
import {
  performAdvancedRebalancing
} from "./helpers/advanced-rebalancing";
import {
  logFinalStaffingStats
} from "./helpers/logging";

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
  const { 
    overfilledDays, 
    underfilledDays, 
    totalRequired, 
    totalFilled 
  } = identifyStaffingImbalances(weekDays, filledPositions, requiredEmployees);
  
  // Calculate total possible assignments based on employee working days
  const totalPossibleAssignments = calculatePossibleAssignments(sortedEmployees);
  
  // Log staffing situation for debugging
  console.log(`Total required: ${totalRequired}, Total possible: ${totalPossibleAssignments}`);
  console.log(`Overfilled days: ${overfilledDays.length}, Underfilled days: ${underfilledDays.length}`);
  
  // ENHANCED PHASE 2: Identify employees not working their full days
  const underutilizedEmployees = identifyUnderutilizedEmployees(sortedEmployees, employeeAssignments);
  
  console.log(`Found ${underutilizedEmployees.length} employees not working their full schedule`);
  
  // PHASE 3: Balance employee distribution by moving employees from overfilled to underfilled days
  // Prioritize rebalancing with underutilized employees first
  if (underfilledDays.length > 0) {
    if (overfilledDays.length > 0) {
      balanceEmployeeDistribution(
        sortedEmployees, weekDays, filledPositions, requiredEmployees,
        overfilledDays, underfilledDays, assignedWorkDays, formatDateKey,
        isTemporarilyFlexible, employeeAssignments, existingShifts, workShifts, freeShifts,
        underutilizedEmployees
      );
    }
    
    // If there are still underfilled days after balancing, try to handle them with underutilized employees
    const remainingUnderfilled = weekDays.map((_, dayIndex) => {
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      
      if (filled < required) {
        return { dayIndex, shortage: required - filled };
      }
      return null;
    }).filter(Boolean);
    
    if (remainingUnderfilled.length > 0 && underutilizedEmployees.length > 0) {
      console.log(`Still have ${remainingUnderfilled.length} underfilled days, attempting to assign underutilized employees`);
    }
  }
  
  // PHASE 4: Ensure all employees are working their specified number of days
  ensureFullWorkingDays(
    sortedEmployees, weekDays, filledPositions, requiredEmployees,
    assignedWorkDays, formatDateKey, isTemporarilyFlexible, employeeAssignments,
    existingShifts, workShifts, freeShifts
  );
  
  // PHASE 5: Critical inspection - if we have days that are significantly understaffed
  // compared to others, perform advanced rebalancing
  const criticalUnderfilledDays = identifyCriticalUnderfilledDays(
    weekDays, filledPositions, requiredEmployees
  );
  
  if (criticalUnderfilledDays.length > 0) {
    // Check if we have days with very different staffing levels relative to requirements
    const staffingImbalances = weekDays.map((_, dayIndex) => {
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      return { dayIndex, ratio: required > 0 ? filled / required : 1 };
    });
    
    // Calculate the variance in staffing ratios
    const ratios = staffingImbalances.map(day => day.ratio).filter(r => !isNaN(r) && isFinite(r));
    const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    const hasSignificantImbalance = ratios.some(r => Math.abs(r - avgRatio) > 0.2);
    
    if (totalFilled < totalRequired && hasSignificantImbalance) {
      // If we're globally understaffed with significant imbalance between days,
      // perform a more advanced rebalancing
      performAdvancedRebalancing(
        sortedEmployees, weekDays, filledPositions, requiredEmployees,
        formatDateKey, isTemporarilyFlexible, assignedWorkDays,
        existingShifts, workShifts, freeShifts
      );
    } else {
      // Now look through all days that have staffing above the required level
      const daysWithExtraStaff = identifyDaysWithExtraStaff(
        weekDays, filledPositions, requiredEmployees
      );
      
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
  
  // PHASE 6: Verify and log results
  logFinalStaffingStats(
    sortedEmployees, employeeAssignments, weekDays, filledPositions, requiredEmployees
  );
}
