import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

// Helper function to ensure all employees are assigned their full working days
export function ensureFullWorkingDays(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  // First, prioritize days that are still underfilled
  const underfilledDays: { dayIndex: number, dateKey: string, day: Date }[] = [];
  
  weekDays.forEach((day, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    const dateKey = formatDateKey(day);
    
    if (filled < required) {
      underfilledDays.push({ dayIndex, dateKey, day });
    }
  });
  
  // Sort underfilled days by most understaffed first (largest gap between required and filled)
  underfilledDays.sort((a, b) => {
    const aGap = (requiredEmployees[a.dayIndex] || 0) - filledPositions[a.dayIndex];
    const bGap = (requiredEmployees[b.dayIndex] || 0) - filledPositions[b.dayIndex];
    return bGap - aGap;
  });
  
  // Process each employee who isn't assigned their full working days
  for (const employee of sortedEmployees) {
    const assignedDays = employeeAssignments[employee.id] || 0;
    const targetDays = employee.workingDaysAWeek;
    
    // Special case for employees who want to work 6 days but are set to 5
    const actualTargetDays = employee.workingDaysAWeek === 5 && employee.wantsToWorkSixDays ? 6 : targetDays;
    
    // Skip if already fully assigned or over-assigned
    if (assignedDays >= actualTargetDays) continue;
    
    // Try to assign to underfilled days first
    let remainingDaysToAssign = actualTargetDays - assignedDays;
    
    // First pass: try to fill underfilled days
    if (remainingDaysToAssign > 0 && underfilledDays.length > 0) {
      for (const { dayIndex, dateKey, day } of underfilledDays) {
        // Skip if already assigned to this day
        if (assignedWorkDays.get(dateKey)?.has(employee.id)) continue;
        
        // Skip if has special shift
        if (hasSpecialShift(employee.id, dateKey, existingShifts)) continue;
        
        // Check if employee can work on this day
        if (canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible)) {
          // Assign to this day
          workShifts.push({
            employeeId: employee.id,
            date: dateKey,
            shiftType: "Arbeit"
          });
          
          // Update tracking
          employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
          filledPositions[dayIndex]++;
          
          // Add to assigned employees for this day
          const dayEmployees = assignedWorkDays.get(dateKey);
          if (dayEmployees) {
            dayEmployees.add(employee.id);
          }
          
          remainingDaysToAssign--;
          
          // Stop if fully assigned or this day is now filled
          if (remainingDaysToAssign <= 0 || filledPositions[dayIndex] >= (requiredEmployees[dayIndex] || 0)) {
            break;
          }
        }
      }
    }
    
    // Second pass: if still not fully assigned, try all days (preferring Saturday which is often understaffed)
    if (remainingDaysToAssign > 0) {
      // Reorder days to prioritize Saturday (assuming index 5 is Saturday) and then other days with required staffing
      const orderedDayIndices = [...Array(weekDays.length).keys()].sort((a, b) => {
        // First priority is Saturday (index 5)
        if (a === 5) return -1;
        if (b === 5) return 1;
        
        // Second priority is days with required staffing, most required first
        const aRequired = requiredEmployees[a] || 0;
        const bRequired = requiredEmployees[b] || 0;
        
        if (aRequired > 0 && bRequired > 0) {
          return bRequired - aRequired;
        }
        
        if (aRequired > 0) return -1;
        if (bRequired > 0) return 1;
        
        // Otherwise maintain original order
        return a - b;
      });
      
      for (const dayIndex of orderedDayIndices) {
        const day = weekDays[dayIndex];
        const dateKey = formatDateKey(day);
        
        // Skip if already assigned to this day
        if (assignedWorkDays.get(dateKey)?.has(employee.id)) continue;
        
        // Skip if has special shift
        if (hasSpecialShift(employee.id, dateKey, existingShifts)) continue;
        
        // Check if employee can work on this day
        if (canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible)) {
          // Assign to this day
          workShifts.push({
            employeeId: employee.id,
            date: dateKey,
            shiftType: "Arbeit"
          });
          
          // Update tracking
          employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
          filledPositions[dayIndex]++;
          
          // Add to assigned employees for this day
          const dayEmployees = assignedWorkDays.get(dateKey);
          if (dayEmployees) {
            dayEmployees.add(employee.id);
          }
          
          remainingDaysToAssign--;
          
          // Stop if fully assigned
          if (remainingDaysToAssign <= 0) {
            break;
          }
        }
      }
    }
  }
}
