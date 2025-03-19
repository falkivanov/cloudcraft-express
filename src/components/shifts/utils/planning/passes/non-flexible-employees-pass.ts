
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { PlanningParams, ShiftPlan } from "../types";
import { getDayAbbreviation } from "../date-utils";
import { hasSpecialShift } from "../shift-status";

// Assigns non-flexible employees to their preferred days
export function runNonFlexibleEmployeesPass(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  employeeAssignments: Record<string, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  planningMode: "forecast" | "maximum" = "forecast"
) {
  weekDays.forEach((day, dayIndex) => {
    const requiredCount = requiredEmployees[dayIndex] || 0;
    const dateKey = formatDateKey(day);
    
    // Skip days with no requirements if in forecast mode
    if (planningMode === "forecast" && requiredCount === 0) return;
    
    // Assign non-flexible employees first
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Skip if day is already fully staffed (in forecast mode)
      if (planningMode === "forecast" && filledPositions[dayIndex] >= requiredCount) return;
      
      // Check if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) {
        // Special shift already accounted for in initialization
        return;
      }
      
      const dayAbbr = getDayAbbreviation(day);
      
      // For non-flexible employees, only assign on preferred days
      if (!employee.isWorkingDaysFlexible && 
          !isTemporarilyFlexible(employee.id) && 
          employee.preferredWorkingDays.includes(dayAbbr)) {
        
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
