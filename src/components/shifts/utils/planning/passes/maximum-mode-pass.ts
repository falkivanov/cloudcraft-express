
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { PlanningParams, ShiftPlan } from "../types";
import { getDayAbbreviation } from "../date-utils";
import { hasSpecialShift } from "../shift-status";

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
    
    // In maximum mode, we process employees in two passes:
    // 1. First, assign all employees with flexible schedules to non-preferred days
    // 2. Then, plan 5-day employees for a 6th day
    
    // PASS 1: Assign flexible employees to non-preferred days
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned (based on normal working days)
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
    
    // PASS 2: Assign 5-day employees to a 6th day in maximum mode
    sortedEmployees.forEach(employee => {
      // Only consider employees who work exactly 5 days and aren't already assigned to 6 days
      if (employee.workingDaysAWeek !== 5 || employeeAssignments[employee.id] >= 6) return;
      
      // Check if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) return;
      
      // Check if employee is already assigned to this day
      const dateEmployees = assignedWorkDays.get(dateKey);
      if (dateEmployees && dateEmployees.has(employee.id)) return;
      
      // Since we're in maximum mode, assign a 6th day to employees with 5 working days
      workShifts.push({
        employeeId: employee.id,
        date: dateKey,
        shiftType: "Arbeit"
      });
      
      // Update tracking counters
      employeeAssignments[employee.id]++;
      filledPositions[dayIndex]++;
      
      // Mark this employee as assigned for this day
      if (dateEmployees) {
        dateEmployees.add(employee.id);
      }
    });
  });
}
