
import { ShiftPlan } from "./types";
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { hasSpecialShift } from "./helper-functions";

// Initializes tracking maps and counters for the planning algorithm
export function initializePlanningTrackers(
  employees: Employee[],
  weekDays: Date[],
  formatDateKey: (date: Date) => string,
  existingShifts?: Map<string, ShiftAssignment>
) {
  const workShifts: ShiftPlan[] = [];
  const freeShifts: ShiftPlan[] = [];
  
  // Create a map to track which employees are assigned to work on which days
  const assignedWorkDays = new Map<string, Set<string>>();
  weekDays.forEach(day => {
    assignedWorkDays.set(formatDateKey(day), new Set<string>());
  });
  
  // First, preserve all special shifts (Termin, Urlaub, Krank)
  if (existingShifts) {
    existingShifts.forEach((shift, key) => {
      if (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank") {
        workShifts.push({
          employeeId: shift.employeeId,
          date: shift.date,
          shiftType: shift.shiftType
        });
        
        // Mark this employee as assigned for this day
        const dateEmployees = assignedWorkDays.get(shift.date);
        if (dateEmployees) {
          dateEmployees.add(shift.employeeId);
        }
      }
    });
  }
  
  // Track number of assigned days per employee (to respect workingDaysAWeek)
  const employeeAssignments: Record<string, number> = {};
  employees.forEach(employee => {
    employeeAssignments[employee.id] = 0;
    
    // Count existing special shifts toward employee's assignments
    if (existingShifts) {
      weekDays.forEach(day => {
        const dateKey = formatDateKey(day);
        const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
        if (specialShift) {
          employeeAssignments[employee.id]++;
        }
      });
    }
  });
  
  // Track number of filled positions per day
  const filledPositions: Record<number, number> = {};
  weekDays.forEach((day, index) => {
    filledPositions[index] = 0;
    
    // Count existing work shifts for this day
    if (existingShifts) {
      const dateKey = formatDateKey(day);
      employees.forEach(employee => {
        const key = `${employee.id}-${dateKey}`;
        const shift = existingShifts.get(key);
        if (shift && shift.shiftType === "Arbeit") {
          filledPositions[index]++;
        }
      });
    }
  });
  
  return {
    workShifts,
    freeShifts,
    assignedWorkDays,
    employeeAssignments,
    filledPositions
  };
}
