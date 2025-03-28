
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";

/**
 * Calculates average filled ratio across all days
 */
export function calculateAverageFilledRatio(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): number {
  let totalRatio = 0;
  let daysWithRequirements = 0;
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    if (required > 0) {
      const filled = filledPositions[dayIndex];
      totalRatio += filled / required;
      daysWithRequirements++;
    }
  });
  
  return daysWithRequirements > 0 ? totalRatio / daysWithRequirements : 1;
}

/**
 * Checks if an employee has a special shift
 */
export function hasSpecialShift(
  employeeId: string,
  dateKey: string,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  if (!existingShifts) return false;
  
  const shiftKey = `${employeeId}-${dateKey}`;
  const shift = existingShifts.get(shiftKey);
  
  return shift !== undefined && 
    (shift.shiftType === "Termin" || 
     shift.shiftType === "Urlaub" || 
     shift.shiftType === "Krank");
}

/**
 * Gets the assigned days count for an employee
 */
export function getAssignedDaysCount(
  employeeId: string,
  weekDays: Date[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string
): number {
  let count = 0;
  weekDays.forEach(day => {
    const dateKey = formatDateKey(day);
    if (assignedWorkDays.get(dateKey)?.has(employeeId)) {
      count++;
    }
  });
  return count;
}

/**
 * Creates a mapping of employees to their assigned day counts
 */
export function createEmployeeAssignmentsMap(
  sortedEmployees: Employee[],
  weekDays: Date[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string
): Record<string, number> {
  const employeeAssignments: Record<string, number> = {};
  
  sortedEmployees.forEach(employee => {
    employeeAssignments[employee.id] = getAssignedDaysCount(
      employee.id, 
      weekDays, 
      assignedWorkDays, 
      formatDateKey
    );
  });
  
  return employeeAssignments;
}
