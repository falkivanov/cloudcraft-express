
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import {
  shouldConsiderForExtraDay,
  moveEmployeeBetweenDays,
  addEmployeeToDay,
  getSortedEmployeesOnOverstaffedDay,
  calculateStaffingImbalance,
  canAssignEmployeeToDay
} from "./rebalancing-helpers";

// Final aggressive rebalancing to address critical shortages
export function aggressiveRebalancing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  daysWithExtraStaff: { dayIndex: number, excess: number }[],
  criticalUnderfilledDays: { dayIndex: number, shortage: number }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  // Track employees who have been scheduled for 6 days (exceeding their standard 5)
  // to avoid over-assigning when not necessary
  const employeesScheduledForExtraDays = new Set<string>();
  
  // Calculate total staffing imbalance
  const { totalExcessStaff, totalShortage } = calculateStaffingImbalance(
    daysWithExtraStaff,
    criticalUnderfilledDays
  );

  // Process underfilled days one by one, starting with the most critical
  for (const { dayIndex: understaffedDayIndex, shortage } of criticalUnderfilledDays) {
    if (shortage <= 0) continue; // Skip if actually not understaffed
    
    const understaffedDay = weekDays[understaffedDayIndex];
    const understaffedDateKey = formatDateKey(understaffedDay);
    
    // Handle the required staffing for this day
    let remainingNeeded = shortage;
    
    // Try to move employees from overstaffed days
    for (const { dayIndex: overstaffedDayIndex, excess } of daysWithExtraStaff) {
      if (remainingNeeded <= 0) break; // Stop if we've filled the day
      if (excess <= 0) continue; // Skip if not actually overstaffed
      
      const overstaffedDay = weekDays[overstaffedDayIndex];
      const overstaffedDateKey = formatDateKey(overstaffedDay);
      
      // Get all employees assigned to the overstaffed day
      const employeesOnOverstaffedDay = assignedWorkDays.get(overstaffedDateKey) || new Set<string>();
      
      // Get sorted employees from overstaffed day
      const employeesWithInfo = getSortedEmployeesOnOverstaffedDay(
        employeesOnOverstaffedDay,
        sortedEmployees,
        weekDays,
        assignedWorkDays,
        formatDateKey
      );
      
      // Now try to move employees one by one
      for (const { employee, assignedDaysCount } of employeesWithInfo) {
        if (remainingNeeded <= 0) break; // Stop if we've filled the day
        
        // Check if employee can be assigned to this day
        if (!canAssignEmployeeToDay(
          employee,
          understaffedDay,
          understaffedDateKey,
          isTemporarilyFlexible,
          assignedWorkDays,
          existingShifts
        )) {
          continue;
        }
        
        // If employee is working exactly their required days, OR
        // If we already have enough employees with an extra day and this employee would go over their standard days,
        // then we need to move them instead of adding a day
        const standardWorkingDays = employee.workingDaysAWeek;
        const wouldExceedStandard = assignedDaysCount >= standardWorkingDays;
        
        // Determine if employee should be considered for an extra day assignment
        const shouldConsiderExtraDay = shouldConsiderForExtraDay(
          employee,
          assignedDaysCount,
          totalShortage,
          totalExcessStaff,
          employeesScheduledForExtraDays
        );
        
        // If employee is already at or above their standard days and adding another day isn't justified,
        // we need to move them from one day to another instead of just adding
        if (wouldExceedStandard && !shouldConsiderExtraDay) {
          // Move from overstaffed to understaffed
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
          
          // Update remaining needed count
          remainingNeeded--;
        } 
        // For employees who want to work 6 days and we have critical shortages
        else if (shouldConsiderExtraDay) {
          // Directly add to understaffed day without removing from overstaffed
          addEmployeeToDay(
            employee,
            understaffedDayIndex,
            understaffedDateKey,
            filledPositions,
            assignedWorkDays,
            workShifts,
            employeesScheduledForExtraDays
          );
          
          // Update remaining needed count
          remainingNeeded--;
        }
        
        // If we've addressed the shortage for this day, break out
        if (remainingNeeded <= 0) break;
      }
    }
  }
}
