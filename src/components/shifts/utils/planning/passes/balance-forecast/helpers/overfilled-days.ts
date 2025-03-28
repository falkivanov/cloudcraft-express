
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";
import {
  sortEmployeesByAssignmentStatus,
  canMoveEmployeeBetweenDays,
  reassignEmployeeBetweenDays
} from "../distribution-helpers";

/**
 * Process overfilled days for a specific underfilled day
 */
export function processOverfilledDays(
  overfilledDays: { dayIndex: number, excess: number }[],
  underfilledDay: Date,
  underfilledDateKey: string,
  underfilledIndex: number,
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  sortedEmployees: Employee[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts: Map<string, ShiftAssignment> | undefined,
  workShifts: ShiftPlan[] | undefined,
  freeShifts: ShiftPlan[] | undefined,
  employeesMoved: number,
  shortage: number
) {
  // Try each overfilled day in order (most overfilled first)
  for (const { dayIndex: overfilledIndex } of overfilledDays) {
    // Skip if this day doesn't have enough excess anymore
    if (filledPositions[overfilledIndex] <= (requiredEmployees[overfilledIndex] || 0)) {
      continue;
    }
    
    const overfilledDay = weekDays[overfilledIndex];
    const overfilledDateKey = formatDateKey(overfilledDay);
    
    console.log(`Trying to move employees from overfilled day ${overfilledIndex} (${overfilledDateKey})`);
    
    // Get all employees assigned to the overfilled day
    const overfilledEmployees = Array.from(assignedWorkDays.get(overfilledDateKey) || []);
    
    // Sort employees by assignment status
    const sortedByAssignment = sortEmployeesByAssignmentStatus(
      overfilledEmployees,
      sortedEmployees,
      employeeAssignments
    );
    
    // Find employees who can be moved from overfilled to underfilled days
    for (const employeeId of sortedByAssignment) {
      const employee = sortedEmployees.find(e => e.id === employeeId);
      if (!employee) continue;
      
      if (canMoveEmployeeBetweenDays(
        employee,
        underfilledDay,
        underfilledDateKey,
        overfilledIndex,
        filledPositions,
        requiredEmployees,
        isTemporarilyFlexible,
        assignedWorkDays,
        existingShifts
      )) {
        reassignEmployeeBetweenDays(
          employee,
          overfilledDateKey,
          underfilledDateKey,
          overfilledIndex,
          underfilledIndex,
          employeeAssignments,
          filledPositions,
          assignedWorkDays,
          workShifts,
          freeShifts
        );
        
        employeesMoved++;
        
        // Break if this underfilled day is now satisfied
        if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
          break;
        }
      }
    }
    
    // If we've fixed this underfilled day, break out of the overfilled days loop
    if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
      break;
    }
  }
}
