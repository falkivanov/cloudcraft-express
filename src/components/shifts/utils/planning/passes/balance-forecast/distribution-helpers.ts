
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

/**
 * Finds underutilized employees who can work on a specific day
 */
export function findAvailableUnderutilizedEmployees(
  underutilizedEmployees: Employee[],
  underfilledDay: Date,
  underfilledDateKey: string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): Employee[] {
  if (!underutilizedEmployees || underutilizedEmployees.length === 0) {
    return [];
  }

  return underutilizedEmployees.filter(employee => {
    // Skip if already fully assigned
    if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return false;
    
    // Skip if already assigned to this day
    if (assignedWorkDays.get(underfilledDateKey)?.has(employee.id)) return false;
    
    // Skip if has special shift on this day
    if (hasSpecialShift(employee.id, underfilledDateKey, existingShifts)) return false;
    
    // Check if employee can work on the underfilled day
    return canEmployeeWorkOnDay(employee, underfilledDay, isTemporarilyFlexible);
  });
}

/**
 * Assign an underutilized employee to an underfilled day
 */
export function assignUnderutilizedEmployeeToDay(
  employee: Employee,
  underfilledDateKey: string,
  underfilledIndex: number,
  employeeAssignments: Record<string, number>,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[]
): void {
  // Assign directly to this underfilled day without removing from another day
  workShifts.push({
    employeeId: employee.id,
    date: underfilledDateKey,
    shiftType: "Arbeit"
  });
  
  // Update tracking
  employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
  filledPositions[underfilledIndex]++;
  
  // Add to assigned employees for this day
  const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
  if (underfilledDayEmployees) {
    underfilledDayEmployees.add(employee.id);
  }
  
  console.log(`Assigned underutilized employee ${employee.name} to underfilled day ${underfilledIndex}`);
}

/**
 * Sort employees by their assignment status (prioritizing those working more than their minimum required days)
 */
export function sortEmployeesByAssignmentStatus(
  employeeIds: string[],
  sortedEmployees: Employee[],
  employeeAssignments: Record<string, number>
): string[] {
  return [...employeeIds].sort((a, b) => {
    const aAssigned = employeeAssignments[a] || 0;
    const bAssigned = employeeAssignments[b] || 0;
    
    const aTarget = sortedEmployees.find(e => e.id === a)?.workingDaysAWeek || 5;
    const bTarget = sortedEmployees.find(e => e.id === b)?.workingDaysAWeek || 5;
    
    // Calculate how far over their minimum each employee is
    const aOver = aAssigned - aTarget;
    const bOver = bAssigned - bTarget;
    
    // Prioritize those who are over their minimum first
    if (aOver > 0 && bOver <= 0) return -1;
    if (aOver <= 0 && bOver > 0) return 1;
    
    // If both or neither are over, prioritize those with more assigned days
    return bAssigned - aAssigned;
  });
}

/**
 * Check if an employee can be moved from an overfilled day to an underfilled day
 */
export function canMoveEmployeeBetweenDays(
  employee: Employee,
  underfilledDay: Date,
  underfilledDateKey: string,
  overfilledIndex: number,
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  // Check if employee can work on the underfilled day
  if (!canEmployeeWorkOnDay(employee, underfilledDay, isTemporarilyFlexible)) {
    return false;
  }
  
  // Skip if already assigned to underfilled day
  const isAlreadyAssignedToUnderfilledDay = assignedWorkDays.get(underfilledDateKey)?.has(employee.id);
  if (isAlreadyAssignedToUnderfilledDay) return false;
  
  // Skip if has special shift
  const hasSpecialShiftOnUnderfilledDay = hasSpecialShift(employee.id, underfilledDateKey, existingShifts);
  if (hasSpecialShiftOnUnderfilledDay) return false;
  
  // Make sure removing from the overfilled day won't drop it below requirements
  if (filledPositions[overfilledIndex] - 1 < (requiredEmployees[overfilledIndex] || 0)) {
    return false;
  }
  
  return true;
}

/**
 * Move an employee from an overfilled day to an underfilled day
 */
export function moveEmployeeBetweenDays(
  employee: Employee,
  overfilledDateKey: string,
  underfilledDateKey: string,
  overfilledIndex: number,
  underfilledIndex: number,
  employeeAssignments: Record<string, number>,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[],
  freeShifts: ShiftPlan[]
): void {
  // Find the work shift entry for the overfilled day
  const workShiftIndex = workShifts.findIndex(
    shift => shift.employeeId === employee.id && shift.date === overfilledDateKey && shift.shiftType === "Arbeit"
  );
  
  if (workShiftIndex !== -1) {
    // Remove from overfilled day
    workShifts.splice(workShiftIndex, 1);
    
    // Add free shift for the overfilled day
    freeShifts.push({
      employeeId: employee.id,
      date: overfilledDateKey,
      shiftType: "Frei"
    });
    
    // Remove from assigned employees for overfilled day
    const overfilledDayEmployees = assignedWorkDays.get(overfilledDateKey);
    if (overfilledDayEmployees) {
      overfilledDayEmployees.delete(employee.id);
    }
    
    // Update counter for overfilled day
    filledPositions[overfilledIndex]--;
    
    // Add to underfilled day
    workShifts.push({
      employeeId: employee.id,
      date: underfilledDateKey,
      shiftType: "Arbeit"
    });
    
    // Add to assigned employees for underfilled day
    const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
    if (underfilledDayEmployees) {
      underfilledDayEmployees.add(employee.id);
    }
    
    // Update counter for underfilled day
    filledPositions[underfilledIndex]++;
    
    console.log(`Moved employee ${employee.name} from day ${overfilledIndex} to day ${underfilledIndex}`);
  }
}
