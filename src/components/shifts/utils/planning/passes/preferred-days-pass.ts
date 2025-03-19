
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { PlanningParams, ShiftPlan } from "../types";
import { getDayAbbreviation, hasSpecialShift } from "../helper-functions";

// Assigns all employees to their preferred working days
export function runPreferredDaysPass(
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
    const requiredCount = planningMode === "forecast" 
      ? requiredEmployees[dayIndex] || 0 
      : Number.MAX_SAFE_INTEGER;
    
    const dateKey = formatDateKey(day);
      
    if (requiredCount <= 0) return;
    
    const dayAbbr = getDayAbbreviation(day);
    
    // For all employees, first try to assign on preferred days
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Skip if day is already fully staffed
      if (filledPositions[dayIndex] >= requiredCount) return;
      
      // Check if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) {
        // Special shift already accounted for in initialization
        return;
      }
      
      // Skip non-flexible employees already handled in first pass
      if (!employee.isWorkingDaysFlexible && !isTemporarilyFlexible(employee.id)) return;
      
      // Only assign if it's a preferred day
      if (employee.preferredWorkingDays.includes(dayAbbr)) {
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
