import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";

/**
 * Determines if an employee can be assigned to a specific day
 */
export function canAssignEmployeeToDay(
  employee: Employee,
  day: Date,
  dateKey: string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  // Check if the employee is temporarily flexible or if the day is a preferred day
  const isFlexible = isTemporarilyFlexible(employee.id) || employee.preferredDays.includes(day.getDay());
  
  // Check if the employee is already assigned to work on this day
  if (assignedWorkDays.get(dateKey)?.has(employee.id)) {
    return false;
  }
  
  // Check if the employee has a special shift (Termin, Urlaub, Krank) on this day
  if (existingShifts) {
    const shiftKey = `${employee.id}-${dateKey}`;
    const shift = existingShifts.get(shiftKey);
    if (shift && (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank")) {
      return false;
    }
  }
  
  // If none of the above conditions are met, the employee can be assigned to the day
  return isFlexible;
}

/**
 * Adds an employee to a specific day and updates all tracking variables
 */
export function addEmployeeToDay(
  employee: Employee,
  dayIndex: number,
  dateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts?: ShiftPlan[],
  employeesScheduledForExtraDays?: Set<string>
): void {
  // Add employee to the assigned work days map
  let dateEmployees = assignedWorkDays.get(dateKey);
  if (!dateEmployees) {
    dateEmployees = new Set<string>();
    assignedWorkDays.set(dateKey, dateEmployees);
  }
  dateEmployees.add(employee.id);
  
  // Increment the filled positions counter for the day
  filledPositions[dayIndex]++;
  
  // Add the shift to the work shifts array
  if (workShifts) {
    workShifts.push({
      employeeId: employee.id,
      date: dateKey,
      shiftType: "Arbeit"
    });
  }
  
  // Optionally track that this employee has been scheduled for an extra day
  if (employeesScheduledForExtraDays) {
    employeesScheduledForExtraDays.add(employee.id);
  }
  
  console.log(`Assigned employee ${employee.name} to day ${dayIndex}`);
}

/**
 * Checks if an employee should be considered for an extra work day
 */
export function shouldConsiderForExtraDay(
  employee: Employee,
  assignedCount: number
): boolean {
  // Consider for extra day if they want to work six days and haven't reached that limit
  return employee.wantsToWorkSixDays && assignedCount < 6;
}

/**
 * Finds available underutilized employees that can be assigned to a day
 */
export function findAvailableUnderutilizedEmployees(
  underutilizedEmployees: Employee[] | undefined,
  dayIndex: number,
  day: Date,
  dateKey: string,
  assignedWorkDays: Map<string, Set<string>>,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  existingShifts?: Map<string, ShiftAssignment>
): Employee[] {
  if (!underutilizedEmployees || underutilizedEmployees.length === 0) {
    return [];
  }
  
  return underutilizedEmployees.filter(employee => 
    canAssignEmployeeToDay(
      employee,
      day,
      dateKey,
      isTemporarilyFlexible,
      assignedWorkDays,
      existingShifts
    )
  );
}

/**
 * Assigns an underutilized employee to a specific day
 */
export function assignUnderutilizedEmployeeToDay(
  employee: Employee,
  dayIndex: number,
  dateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  employeeAssignments: Record<string, number>,
  workShifts?: ShiftPlan[]
): void {
  // Add employee to the day
  addEmployeeToDay(
    employee,
    dayIndex,
    dateKey,
    filledPositions,
    assignedWorkDays,
    workShifts
  );
  
  // Update employee assignment count
  employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
  
  console.log(`Assigned underutilized employee ${employee.name} to day ${dayIndex}`);
}
