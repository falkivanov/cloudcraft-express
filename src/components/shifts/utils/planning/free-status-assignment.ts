
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "./types";
import { hasSpecialShift } from "./shift-status";
import { canEmployeeWorkOnDay } from "./employee-availability";
import { isWorkday, isPublicHoliday } from "./date-utils";

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
    const isHoliday = isPublicHoliday(day);
    
    // For each employee, check if they're available but not assigned
    sortedEmployees.forEach(employee => {
      // Skip if the employee is already assigned for this day
      if (assignedEmployees.has(employee.id)) return;
      
      // Skip if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) return;
      
      // On holidays, always mark employees as "Frei" regardless of availability
      if (isHoliday) {
        freeShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Frei"
        });
        return;
      }
      
      // For non-holidays, use normal availability logic
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
