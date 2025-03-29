
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { BalanceParams } from "./types";
import { identifyUnderutilizedEmployees } from "./helpers/employee-utilization";
import { logFinalStaffingStats } from "./helpers/logging";
import { balanceEmployeeDistribution } from "./balance-employee-distribution";
import { ensureFullWorkingDays } from "./ensure-full-working-days";

// Import the phases
import { analyzeStaffing } from "./phases/analyze-staffing";
import { handleWeekendDays, calculateWeekendShortage } from "./phases/weekend-handling";
import { handleCriticalDays, prioritizeWeekendCriticalDays } from "./phases/critical-handling";
import { applyAdvancedBalancing } from "./phases/advanced-balancing";

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
  // Create a params object to pass to all phases
  const balanceParams: BalanceParams = {
    sortedEmployees,
    weekDays,
    filledPositions,
    requiredEmployees,
    assignedWorkDays,
    formatDateKey,
    isTemporarilyFlexible,
    employeeAssignments,
    existingShifts,
    workShifts,
    freeShifts
  };
  
  // PHASE 1: Analyze staffing situation and identify imbalances
  const { staffingData, criticalUnderfilledDays } = analyzeStaffing(
    sortedEmployees, weekDays, filledPositions, requiredEmployees
  );
  
  // Handle weekend days first
  handleWeekendDays(balanceParams);
  
  // PHASE 2: Identify underutilized employees
  const underutilizedEmployees = identifyUnderutilizedEmployees(sortedEmployees, employeeAssignments);
  
  // PHASE 3: Balance employee distribution
  if (staffingData.underfilledDays.length > 0 && staffingData.overfilledDays.length > 0) {
    balanceEmployeeDistribution(
      sortedEmployees, weekDays, filledPositions, requiredEmployees,
      staffingData.overfilledDays, staffingData.underfilledDays, assignedWorkDays, formatDateKey,
      isTemporarilyFlexible, employeeAssignments, existingShifts, workShifts, 
      freeShifts, underutilizedEmployees
    );
  }
  
  // PHASE 4: Ensure all employees are working their specified number of days
  ensureFullWorkingDays(
    sortedEmployees, weekDays, filledPositions, requiredEmployees,
    assignedWorkDays, formatDateKey, isTemporarilyFlexible, employeeAssignments,
    existingShifts, workShifts, freeShifts
  );
  
  // PHASE 5: Critical inspection - prioritize weekend days
  const allCriticalDays = prioritizeWeekendCriticalDays(
    weekDays, filledPositions, requiredEmployees, criticalUnderfilledDays
  );
  
  // Handle critical days if we have any
  if (allCriticalDays.length > 0) {
    handleCriticalDays(allCriticalDays, balanceParams);
  }
  
  // PHASE 6: Advanced rebalancing for remaining imbalances
  const weekendShortage = calculateWeekendShortage(weekDays, requiredEmployees, filledPositions);
  applyAdvancedBalancing(weekendShortage, balanceParams);
  
  // PHASE 7: Verify and log results
  logFinalStaffingStats(
    sortedEmployees, employeeAssignments, weekDays, filledPositions, requiredEmployees
  );
}
