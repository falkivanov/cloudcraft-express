import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { balanceEmployeeDistribution } from "./balance-employee-distribution";
import { ensureFullWorkingDays } from "./ensure-full-working-days";
import { aggressiveRebalancing } from "./aggressive-rebalancing";
import { prioritizeWeekendStaffing } from './helpers/employee-assignment';
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
  // PHASE 1: Identify staffing imbalances
  const { 
    overfilledDays, 
    underfilledDays, 
    totalRequired, 
    totalFilled 
  } = identifyStaffingImbalances(weekDays, filledPositions, requiredEmployees);
  
  // Calculate total possible assignments
  const totalPossibleAssignments = calculatePossibleAssignments(sortedEmployees);
  
  // Log staffing situation
  console.log(`Total required: ${totalRequired}, Total possible: ${totalPossibleAssignments}`);
  console.log(`Overfilled days: ${overfilledDays.length}, Underfilled days: ${underfilledDays.length}`);
  
  // Handle weekend days first
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

  // PHASE 2: Identify underutilized employees
  const underutilizedEmployees = identifyUnderutilizedEmployees(sortedEmployees, employeeAssignments);
  
  // PHASE 3: Balance employee distribution
  if (underfilledDays.length > 0 && overfilledDays.length > 0) {
    balanceEmployeeDistribution(
      sortedEmployees, weekDays, filledPositions, requiredEmployees,
      overfilledDays, underfilledDays, assignedWorkDays, formatDateKey,
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
  
  // PHASE 5: Critical inspection - focus especially on weekend days
  // Weekend days get special treatment in our staffing algorithms
  const weekendDays = weekDays.slice(5);
  const criticalWeekendDays = weekendDays.map((day, index) => {
    const dayIndex = index + 5; // 5 = Saturday, 6 = Sunday
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled < required) {
      const shortage = required - filled;
      // Flag as critical even with small shortages on weekends
      return { dayIndex, shortage, isCritical: true };
    }
    return null;
  }).filter(Boolean);
  
  // Find all critical underfilled days across the whole week
  const criticalUnderfilledDays = identifyCriticalUnderfilledDays(
    weekDays, filledPositions, requiredEmployees
  );
  
  // Combine weekend and other critical days, ensuring weekend days appear first
  const allCriticalDays = [
    ...criticalWeekendDays,
    ...criticalUnderfilledDays.filter(day => day.dayIndex < 5)
  ];
  
  // If we have any critical days, run the aggressive rebalancing
  if (allCriticalDays.length > 0) {
    // Look through all days that have staffing above the required level
    const daysWithExtraStaff = identifyDaysWithExtraStaff(
      weekDays, filledPositions, requiredEmployees
    );
    
    // Log what we're attempting to fix
    console.log(`Running aggressive rebalancing for ${allCriticalDays.length} critical days, including ${criticalWeekendDays.length} weekend days`);
    console.log(`Days with extra staff available: ${daysWithExtraStaff.length}`);
    
    // Try to move employees from days with extra staff to critically understaffed days
    if (daysWithExtraStaff.length > 0) {
      aggressiveRebalancing(
        sortedEmployees, weekDays, filledPositions, requiredEmployees,
        daysWithExtraStaff, allCriticalDays, assignedWorkDays, formatDateKey,
        isTemporarilyFlexible, existingShifts, workShifts, freeShifts
      );
    }
  }
  
  // PHASE 6: Advanced rebalancing - only if we still have significant imbalances
  const weekendShortage = weekendDays.reduce((total, day, index) => {
    const dayIndex = index + 5;
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    return total + (required > filled ? required - filled : 0);
  }, 0);
  
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
    const weekendRatios = staffingImbalances.slice(5).map(day => day.ratio);
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
  
  // PHASE 7: Verify and log results
  logFinalStaffingStats(
    sortedEmployees, employeeAssignments, weekDays, filledPositions, requiredEmployees
  );
}
