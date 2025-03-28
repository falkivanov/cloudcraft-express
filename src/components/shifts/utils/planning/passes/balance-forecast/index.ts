
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

/**
 * Identifies overfilled and underfilled days based on required and filled positions
 */
function identifyStaffingImbalances(
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
 * Calculates total possible assignments based on employee working days
 */
function calculatePossibleAssignments(sortedEmployees: Employee[]): number {
  let totalPossibleAssignments = 0;
  
  sortedEmployees.forEach(employee => {
    totalPossibleAssignments += employee.workingDaysAWeek;
    
    // Add potential extra day for employees who want to work 6 days
    if (employee.workingDaysAWeek === 5 && employee.wantsToWorkSixDays) {
      totalPossibleAssignments += 1;
    }
  });
  
  return totalPossibleAssignments;
}

/**
 * Identifies employees not working their full required days
 */
function identifyUnderutilizedEmployees(
  sortedEmployees: Employee[],
  employeeAssignments: Record<string, number>
): Employee[] {
  return sortedEmployees.filter(employee => {
    const assigned = employeeAssignments[employee.id] || 0;
    return assigned < employee.workingDaysAWeek;
  });
}

/**
 * Identifies critically understaffed days after initial balancing
 */
function identifyCriticalUnderfilledDays(
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

/**
 * Identifies days with extra staff that could potentially be rebalanced
 */
function identifyDaysWithExtraStaff(
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
 * Performs advanced balancing for a significantly imbalanced schedule
 * Prioritizes evening out the distribution when total capacity is insufficient
 */
function performAdvancedRebalancing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
): void {
  console.log("Performing advanced rebalancing for significantly imbalanced schedule");
  
  // Calculate overall staffing situation
  let totalRequired = 0;
  let totalFilled = 0;
  
  weekDays.forEach((_, dayIndex) => {
    totalRequired += requiredEmployees[dayIndex] || 0;
    totalFilled += filledPositions[dayIndex];
  });
  
  // If we're globally understaffed, prioritize evening out the distribution
  if (totalFilled < totalRequired) {
    console.log(`Global staffing shortage detected: ${totalFilled}/${totalRequired}`);
    
    // Find the most severely understaffed days first (using ratio-based prioritization)
    const prioritizedDays = prioritizeDaysForRebalancing(
      weekDays, filledPositions, requiredEmployees, formatDateKey
    );
    
    console.log("Days prioritized by staffing imbalance:", 
      prioritizedDays.map(d => `Day ${d.dayIndex}: ${d.filled}/${d.required} (${Math.round(d.imbalance * 100)}%)`));
    
    // Process each understaffed day, starting with the most severely understaffed
    for (const understaffedDay of prioritizedDays) {
      // Find optimal source days to take staff from
      const optimalSources = findOptimalSourceDays(
        weekDays, filledPositions, requiredEmployees, 
        understaffedDay.dayIndex, formatDateKey
      );
      
      console.log(`For day ${understaffedDay.dayIndex}, potential sources:`, 
        optimalSources.map(d => `Day ${d.dayIndex}: ${d.filled}/${d.required} (excess: ${d.excess})`));
      
      // Calculate target staffing to make the imbalance more equitable
      // Instead of trying to fully staff, aim for a balanced understaffing
      for (const sourceDay of optimalSources) {
        // Make progressive improvements without completely depleting source days
        aggressiveRebalancing(
          sortedEmployees, 
          weekDays, 
          filledPositions,
          requiredEmployees,
          [sourceDay], 
          [{ dayIndex: understaffedDay.dayIndex, shortage: 1 }],
          assignedWorkDays,
          formatDateKey,
          isTemporarilyFlexible,
          existingShifts,
          workShifts,
          freeShifts
        );
        
        // Check if we've made sufficient improvement
        const newImbalance = calculateStaffingImbalanceRatio(
          filledPositions[understaffedDay.dayIndex], 
          requiredEmployees[understaffedDay.dayIndex] || 0
        );
        
        // If imbalance is now below 25%, consider it good enough
        if (newImbalance < 0.25) {
          console.log(`Day ${understaffedDay.dayIndex} rebalanced to acceptable level: ${filledPositions[understaffedDay.dayIndex]}/${requiredEmployees[understaffedDay.dayIndex]}`);
          break;
        }
      }
    }
  }
}

/**
 * Logs final staffing statistics for verification
 */
function logFinalStaffingStats(
  sortedEmployees: Employee[],
  employeeAssignments: Record<string, number>,
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): void {
  // Count how many employees are scheduled for fewer than their working days
  let underScheduledCount = 0;
  let overScheduledCount = 0;
  
  sortedEmployees.forEach(employee => {
    const assigned = employeeAssignments[employee.id] || 0;
    const expected = employee.workingDaysAWeek;
    
    if (assigned < expected) {
      underScheduledCount++;
      console.log(`Employee ${employee.name} is under-scheduled: ${assigned}/${expected} days`);
    } else if (assigned > expected) {
      overScheduledCount++;
      console.log(`Employee ${employee.name} is scheduled for extra days: ${assigned}/${expected}`);
    }
  });
  
  console.log(`Final stats: ${underScheduledCount} employees under-scheduled, ${overScheduledCount} scheduled for extra days`);
  
  // Check if we achieved the required staffing for each day
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled < required) {
      console.log(`Day ${dayIndex} is still understaffed: ${filled}/${required}`);
    } else if (filled > required) {
      console.log(`Day ${dayIndex} is overstaffed: ${filled}/${required} (+${filled - required})`);
    } else if (required > 0) {
      console.log(`Day ${dayIndex} is perfectly staffed: ${filled}/${required}`);
    }
  });
}

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
