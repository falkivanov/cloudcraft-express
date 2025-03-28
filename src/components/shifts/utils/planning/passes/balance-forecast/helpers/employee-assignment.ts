
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";
import { hasSpecialShift } from "../../../shift-status";
import { canEmployeeWorkOnDay } from "../../../employee-availability";

/**
 * Determines if an employee should be considered for an extra day assignment
 */
export function shouldConsiderForExtraDay(
  employee: Employee,
  assignedDaysCount: number,
  totalShortage: number,
  totalExcessStaff: number,
  employeesScheduledForExtraDays: Set<string>
): boolean {
  // Only consider adding a 6th day if the employee wants it AND we have critical shortages
  // that exceed our excess staff
  return employee.workingDaysAWeek === 5 && 
         employee.wantsToWorkSixDays && 
         totalShortage > totalExcessStaff && 
         !employeesScheduledForExtraDays.has(employee.id);
}

/**
 * Adds an employee to a day without removing them from another day
 */
export function addEmployeeToDay(
  employee: Employee,
  understaffedDayIndex: number,
  understaffedDateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[],
  employeesScheduledForExtraDays: Set<string>
): void {
  // Add to understaffed day
  const understaffedDayEmployees = assignedWorkDays.get(understaffedDateKey);
  if (understaffedDayEmployees) {
    understaffedDayEmployees.add(employee.id);
  }
  
  // Add new work shift for understaffed day
  workShifts.push({
    employeeId: employee.id,
    date: understaffedDateKey,
    shiftType: "Arbeit"
  });
  
  // Increment filled positions for understaffed day
  filledPositions[understaffedDayIndex]++;
  
  // Mark this employee as scheduled for an extra day
  employeesScheduledForExtraDays.add(employee.id);
}

/**
 * Check if an employee can be assigned to a specific day
 */
export function canAssignEmployeeToDay(
  employee: Employee,
  understaffedDay: Date,
  understaffedDateKey: string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  // Skip if this employee is already assigned to the understaffed day
  if (assignedWorkDays.get(understaffedDateKey)?.has(employee.id)) return false;
  
  // Skip if employee has a special shift on understaffed day
  if (hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) return false;
  
  // Check if employee can work on the understaffed day
  if (!canEmployeeWorkOnDay(employee, understaffedDay, isTemporarilyFlexible)) return false;
  
  return true;
}
