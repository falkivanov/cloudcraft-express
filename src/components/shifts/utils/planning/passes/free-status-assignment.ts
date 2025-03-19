
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../types";
import { hasSpecialShift, canEmployeeWorkOnDay } from "../helper-functions";

// Sets "Frei" status for all available employees who weren't assigned to work
export function setFreeStatusForAvailableEmployees(
  sortedEmployees: Employee[],
  weekDays: Date[],
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  freeShifts?: ShiftPlan[]
) {
  weekDays.forEach((day) => {
    const dateKey = formatDateKey(day);
    const assignedEmployees = assignedWorkDays.get(dateKey) || new Set<string>();
    
    // For each employee, check if they're available but not assigned
    sortedEmployees.forEach(employee => {
      // Skip if the employee is already assigned for this day
      if (assignedEmployees.has(employee.id)) return;
      
      // Skip if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) return;
      
      // Check if the employee can work on this day (is available)
      const canWork = canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible);
      
      // If they can work but aren't assigned, mark as "Frei"
      if (canWork) {
        freeShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Frei"
        });
      }
    });
  });
}
