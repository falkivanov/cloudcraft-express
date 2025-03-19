
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { PlanningParams, ShiftPlan } from "../types";
import { getDayAbbreviation, hasSpecialShift } from "../helper-functions";

// Assigns flexible employees to non-preferred days (only in maximum mode)
export function runMaximumModePass(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  employeeAssignments: Record<string, number>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[]
) {
  weekDays.forEach((day, dayIndex) => {
    const requiredCount = Number.MAX_SAFE_INTEGER; // Try to maximize in this mode
    
    if (filledPositions[dayIndex] >= requiredCount) return;
    
    const dateKey = formatDateKey(day);
    const dayAbbr = getDayAbbreviation(day);
    
    // Only truly flexible employees can be assigned to non-preferred days
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Check if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) {
        // Special shift already accounted for in initialization
        return;
      }
      
      // Only assign flexible employees to non-preferred days
      if ((employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)) && 
          !employee.preferredWorkingDays.includes(dayAbbr)) {
        
        workShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Arbeit"
        });
        
        // Update tracking counters
        employeeAssignments[employee.id]++;
        filledPositions[dayIndex]++;
        
        // Mark this employee as assigned for this day
        const dateEmployees = assignedWorkDays.get(dateKey);
        if (dateEmployees) {
          dateEmployees.add(employee.id);
        }
      }
    });
  });
}
