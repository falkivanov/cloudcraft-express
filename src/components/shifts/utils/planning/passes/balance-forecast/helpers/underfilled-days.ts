
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";
import {
  findAvailableUnderutilizedEmployees,
  assignUnderutilizedEmployeeToDay,
  canAssignEmployeeToDay,
  prioritizeWeekendStaffing
} from "./employee-assignment";
import {
  sortEmployeesByAssignmentStatus
} from "../distribution-helpers";
import { processOverfilledDays } from "./overfilled-days";

/**
 * Process all underfilled days
 */
export function processUnderfilledDays(
  underfilledDays: { dayIndex: number, shortage: number }[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  overfilledDays: { dayIndex: number, excess: number }[],
  sortedEmployees: Employee[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[],
  underutilizedEmployees?: Employee[]
) {
  // First, prioritize weekend days for staffing
  for (let dayIndex = 5; dayIndex < 7 && dayIndex < weekDays.length; dayIndex++) {
    const day = weekDays[dayIndex];
    const dateKey = formatDateKey(day);
    
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
  
  // For each underfilled day, try to move employees from overfilled days
  for (const { dayIndex: underfilledIndex, shortage } of underfilledDays) {
    // Skip if we've already reached the target for this underfilled day
    if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0)) {
      continue;
    }
    
    const underfilledDay = weekDays[underfilledIndex];
    const underfilledDateKey = formatDateKey(underfilledDay);
    
    console.log(`Processing underfilled day ${underfilledIndex} (${underfilledDateKey}), shortage: ${shortage}`);
    
    let employeesMoved = 0;
    
    // PRIORITY 1: First try with underutilized employees - employees who aren't working their full days
    if (underutilizedEmployees && underutilizedEmployees.length > 0) {
      const availableUnderutilized = findAvailableUnderutilizedEmployees(
        underutilizedEmployees,
        underfilledDay,
        underfilledDateKey,
        isTemporarilyFlexible,
        assignedWorkDays,
        existingShifts
      );
      
      for (const employee of availableUnderutilized) {
        if (canAssignEmployeeToDay(
          employee,
          underfilledDay,
          underfilledDateKey,
          isTemporarilyFlexible,
          assignedWorkDays,
          existingShifts
        )) {
          assignUnderutilizedEmployeeToDay(
            employee,
            underfilledIndex,
            underfilledDateKey,
            filledPositions,
            assignedWorkDays,
            employeeAssignments,
            workShifts
          );
          
          employeesMoved++;
          
          // Break if this underfilled day is now satisfied
          if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
            break;
          }
        }
      }
    }
    
    // If we still need more employees, try moving from overfilled days
    if (filledPositions[underfilledIndex] < (requiredEmployees[underfilledIndex] || 0)) {
      processOverfilledDays(
        overfilledDays,
        underfilledDay,
        underfilledDateKey,
        underfilledIndex,
        weekDays,
        filledPositions,
        requiredEmployees,
        sortedEmployees,
        assignedWorkDays,
        formatDateKey,
        isTemporarilyFlexible,
        employeeAssignments,
        existingShifts,
        workShifts,
        freeShifts,
        employeesMoved,
        shortage
      );
    }
    
    console.log(`After processing, day ${underfilledIndex} has ${filledPositions[underfilledIndex]}/${requiredEmployees[underfilledIndex] || 0} employees`);
  }
}
