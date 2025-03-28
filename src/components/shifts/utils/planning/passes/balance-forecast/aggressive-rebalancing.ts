import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { 
  calculateStaffingImbalance, 
  getSortedEmployeesOnOverstaffedDay 
} from "./helpers/staffing-analysis";
import { addEmployeeToDay, canAssignEmployeeToDay } from "./helpers/employee-assignment";
import { 
  calculateStaffingImbalanceRatio 
} from "./helpers/staffing-calculations";
import { moveEmployeeBetweenDays } from "./helpers/employee-reassignment";
import { isAvailableForWeekendDay } from "./helpers/employee-utilization";
import { prioritizeForWeekendAssignment } from "./helpers/weekend-prioritization";
import { canEmployeeWorkOnDay } from "../../employee-availability";
// Import from shift-status module but alias to avoid conflicts
import { hasSpecialShift as hasShiftStatus } from "../../shift-status";
// Import directly from weekend-balancing to avoid the index.ts problems
import { calculateAverageFilledRatio } from "./helpers/weekend-balancing";

/**
 * More aggressive rebalancing algorithm to handle critical understaffing
 */
export function aggressiveRebalancing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  daysWithExtraStaff: { dayIndex: number, excess: number }[],
  criticalUnderfilledDays: { dayIndex: number, shortage: number, isCritical?: boolean }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  if (!workShifts || !freeShifts) return;
  
  // Calculate staffing imbalance
  const { totalExcessStaff, totalShortage } = calculateStaffingImbalance(
    daysWithExtraStaff, criticalUnderfilledDays
  );
  
  console.log(`Aggressive rebalancing - Total excess: ${totalExcessStaff}, Total shortage: ${totalShortage}`);
  
  // Track employees that have been scheduled for an extra day
  const employeesScheduledForExtraDays = new Set<string>();
  
  // Local tracking of employee assignments for this function
  const employeeAssignments: Record<string, number> = {};
  
  // Populate initial employee assignments
  sortedEmployees.forEach(employee => {
    let count = 0;
    weekDays.forEach(day => {
      const dateKey = formatDateKey(day);
      if (assignedWorkDays.get(dateKey)?.has(employee.id)) {
        count++;
      }
    });
    employeeAssignments[employee.id] = count;
  });
  
  // Handle each critical underfilled day in order of priority
  for (const { dayIndex: understaffedDayIndex, shortage } of criticalUnderfilledDays) {
    const understaffedDay = weekDays[understaffedDayIndex];
    const understaffedDateKey = formatDateKey(understaffedDay);
    
    console.log(`Processing critically understaffed day ${understaffedDayIndex} (${understaffedDay.toLocaleDateString()}), shortage: ${shortage}`);
    
    // Special handling for weekend days (Saturday = index 5, Sunday = index 6)
    const isWeekendDay = understaffedDayIndex >= 5;
    
    // For weekend days, we consider even more aggressive strategies
    if (isWeekendDay) {
      handleWeekendDay(
        understaffedDayIndex,
        understaffedDay,
        understaffedDateKey,
        weekDays,
        sortedEmployees,
        filledPositions,
        requiredEmployees,
        assignedWorkDays,
        formatDateKey,
        isTemporarilyFlexible,
        employeeAssignments,
        employeesScheduledForExtraDays,
        existingShifts,
        workShifts,
        freeShifts
      );
      
      // If we've fixed this day, continue to the next one
      if (filledPositions[understaffedDayIndex] >= requiredEmployees[understaffedDayIndex]) {
        continue;
      }
    }
    
    // Try to move from days with extra staff first
    for (const { dayIndex: overstaffedDayIndex } of daysWithExtraStaff) {
      if (overstaffedDayIndex === understaffedDayIndex) continue;
      
      if (daysWithExtraStaff.find(d => d.dayIndex === overstaffedDayIndex)?.excess <= 0) {
        continue;
      }
      
      const overstaffedDay = weekDays[overstaffedDayIndex];
      const overstaffedDateKey = formatDateKey(overstaffedDay);
      
      // Get employees working on the overstaffed day
      const employeesOnOverstaffedDay = assignedWorkDays.get(overstaffedDateKey) || new Set<string>();
      
      // Sort employees to prioritize those who can be moved
      const sortedEmployeesOnDay = getSortedEmployeesOnOverstaffedDay(
        employeesOnOverstaffedDay,
        sortedEmployees,
        weekDays,
        assignedWorkDays,
        formatDateKey
      );
      
      // Try to move employees to the understaffed day
      for (const { employee } of sortedEmployeesOnDay) {
        // Only move if we need more employees on the understaffed day
        if (filledPositions[understaffedDayIndex] >= (requiredEmployees[understaffedDayIndex] || 0)) {
          break;
        }
        
        // Check if this employee can work on the understaffed day
        if (canAssignEmployeeToDay(
          employee,
          understaffedDay,
          understaffedDateKey,
          isTemporarilyFlexible,
          assignedWorkDays,
          existingShifts
        )) {
          // Move employee from overstaffed to understaffed day
          moveEmployeeBetweenDays(
            employee,
            overstaffedDayIndex,
            overstaffedDateKey,
            understaffedDayIndex,
            understaffedDateKey,
            filledPositions,
            assignedWorkDays,
            workShifts,
            daysWithExtraStaff
          );
          
          console.log(`Moved employee ${employee.name} from day ${overstaffedDayIndex} to critical day ${understaffedDayIndex}`);
          
          // If we've fixed this day, break out early
          if (filledPositions[understaffedDayIndex] >= (requiredEmployees[understaffedDayIndex] || 0)) {
            break;
          }
        }
      }
      
      // If we've fixed this day, break out of the overstaffed days loop
      if (filledPositions[understaffedDayIndex] >= (requiredEmployees[understaffedDayIndex] || 0)) {
        break;
      }
    }
  }
}

/**
 * Handle a critically understaffed weekend day with special strategies
 */
function handleWeekendDay(
  understaffedDayIndex: number,
  understaffedDay: Date,
  understaffedDateKey: string,
  weekDays: Date[],
  sortedEmployees: Employee[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  employeesScheduledForExtraDays: Set<string>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  console.log(`Special handling for weekend day ${understaffedDayIndex} (${understaffedDay.toLocaleDateString()})`);
  
  // First, check if we're already sufficiently staffed
  if (filledPositions[understaffedDayIndex] >= (requiredEmployees[understaffedDayIndex] || 0)) {
    return;
  }
  
  // Calculate the current average filled ratio across all days
  const averageFilledRatio = calculateAverageFilledRatio(
    weekDays, filledPositions, requiredEmployees
  );
  
  // Calculate the current filled ratio for this weekend day
  const weekendRequired = requiredEmployees[understaffedDayIndex] || 0;
  const weekendFilled = filledPositions[understaffedDayIndex];
  const weekendFilledRatio = weekendRequired > 0 ? weekendFilled / weekendRequired : 1;
  
  console.log(`Weekend day ${understaffedDayIndex} filled ratio: ${weekendFilledRatio.toFixed(2)}, average: ${averageFilledRatio.toFixed(2)}`);
  
  // If weekend coverage is significantly worse than average, prioritize filling it
  const isSignificantlyWorse = weekendFilledRatio < (averageFilledRatio * 0.8);
  
  if (isSignificantlyWorse) {
    console.log(`Weekend day ${understaffedDayIndex} is significantly understaffed compared to average`);
    
    // Prioritize employees for weekend assignments
    const prioritizedEmployees = prioritizeForWeekendAssignment(
      sortedEmployees,
      assignedWorkDays,
      employeeAssignments,
      formatDateKey,
      weekDays
    );
    
    // Try to assign employees who are good candidates for weekend work
    for (const employee of prioritizedEmployees) {
      // Check if this employee can be assigned to the weekend day
      if (isAvailableForWeekendDay(
        employee, 
        understaffedDayIndex, 
        employeeAssignments[employee.id] || 0,
        isTemporarilyFlexible
      )) {
        // Check if employee is not already assigned to this day and doesn't have a special shift
        if (!assignedWorkDays.get(understaffedDateKey)?.has(employee.id) &&
            !hasShiftStatus(employee.id, understaffedDateKey, existingShifts)) {
          
          // Check if employee can work on this day
          if (canEmployeeWorkOnDay(employee, understaffedDay, isTemporarilyFlexible)) {
            // Only add as extra day if they don't exceed 6 days or if they've asked for 6 days
            const currentAssignedDays = employeeAssignments[employee.id] || 0;
            const canWorkExtraDay = employee.wantsToWorkSixDays && currentAssignedDays < 6;
            
            if (currentAssignedDays < employee.workingDaysAWeek || canWorkExtraDay) {
              // Add employee to the weekend day
              if (workShifts) {
                addEmployeeToDay(
                  employee,
                  understaffedDayIndex,
                  understaffedDateKey,
                  filledPositions,
                  assignedWorkDays,
                  workShifts,
                  employeesScheduledForExtraDays
                );
                
                // Update local tracking of assignments
                employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
                
                console.log(`Assigned employee ${employee.name} to weekend day ${understaffedDayIndex}`);
                
                // If we've reached the target, break out
                if (filledPositions[understaffedDayIndex] >= (requiredEmployees[understaffedDayIndex] || 0)) {
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
}
