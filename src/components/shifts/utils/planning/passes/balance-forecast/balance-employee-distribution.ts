
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import {
  findAvailableUnderutilizedEmployees,
  assignUnderutilizedEmployeeToDay,
  sortEmployeesByAssignmentStatus,
  canMoveEmployeeBetweenDays,
  moveEmployeeBetweenDays
} from "./distribution-helpers";

// Helper function to balance employee distribution from overfilled to underfilled days
export function balanceEmployeeDistribution(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  overfilledDays: { dayIndex: number, excess: number }[],
  underfilledDays: { dayIndex: number, shortage: number }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[],
  underutilizedEmployees?: Employee[]
) {
  // Enhanced logging
  console.log("Starting employee distribution balancing");
  console.log(`Underfilled days: ${underfilledDays.map(d => `Day ${d.dayIndex} (shortage: ${d.shortage})`).join(', ')}`);
  console.log(`Overfilled days: ${overfilledDays.map(d => `Day ${d.dayIndex} (excess: ${d.excess})`).join(', ')}`);
  
  if (underutilizedEmployees && underutilizedEmployees.length > 0) {
    console.log(`Prioritizing ${underutilizedEmployees.length} underutilized employees for rebalancing`);
  }
  
  // Process each underfilled day
  processUnderfilledDays(
    underfilledDays,
    weekDays,
    filledPositions,
    requiredEmployees,
    overfilledDays,
    sortedEmployees,
    assignedWorkDays,
    formatDateKey,
    isTemporarilyFlexible,
    employeeAssignments,
    existingShifts,
    workShifts,
    freeShifts,
    underutilizedEmployees
  );
}

// Process all underfilled days
function processUnderfilledDays(
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
        employeeAssignments,
        assignedWorkDays,
        existingShifts
      );
      
      for (const employee of availableUnderutilized) {
        assignUnderutilizedEmployeeToDay(
          employee,
          underfilledDateKey,
          underfilledIndex,
          employeeAssignments,
          filledPositions,
          assignedWorkDays,
          workShifts
        );
        
        employeesMoved++;
        
        // Break if this underfilled day is now satisfied
        if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
          break;
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

// Process overfilled days for a specific underfilled day
function processOverfilledDays(
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
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[],
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
        moveEmployeeBetweenDays(
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
