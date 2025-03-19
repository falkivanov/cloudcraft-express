
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../types";
import { getDayAbbreviation } from "../date-utils";
import { hasSpecialShift } from "../shift-status";
import { canEmployeeWorkOnDay } from "../employee-availability";

// Improves the distribution of employees to better match forecast requirements and ensures all employees are assigned their full working days
export function runBalanceForecastPass(
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
  freeShifts?: ShiftPlan[]
) {
  // PHASE 1: Identify overfilled and underfilled days
  const overfilledDays: number[] = [];
  const underfilledDays: number[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled > required && required > 0) {
      overfilledDays.push(dayIndex);
    } else if (filled < required) {
      underfilledDays.push(dayIndex);
    }
  });
  
  // PHASE 2: Balance forecast by moving employees from overfilled to underfilled days
  if (underfilledDays.length > 0 && overfilledDays.length > 0) {
    balanceEmployeeDistribution(
      sortedEmployees, weekDays, filledPositions, requiredEmployees,
      overfilledDays, underfilledDays, assignedWorkDays, formatDateKey,
      isTemporarilyFlexible, employeeAssignments, existingShifts, workShifts, freeShifts
    );
  }
  
  // PHASE 3: Ensure all employees are working their specified number of days
  ensureFullWorkingDays(
    sortedEmployees, weekDays, filledPositions, requiredEmployees,
    assignedWorkDays, formatDateKey, isTemporarilyFlexible, employeeAssignments,
    existingShifts, workShifts, freeShifts
  );
}

// Helper function to balance employee distribution
function balanceEmployeeDistribution(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  overfilledDays: number[],
  underfilledDays: number[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  for (const overfilledDayIndex of overfilledDays) {
    for (const underfilledDayIndex of underfilledDays) {
      // Skip if we've already reached the target for this underfilled day
      if (filledPositions[underfilledDayIndex] >= (requiredEmployees[underfilledDayIndex] || 0)) {
        continue;
      }
      
      const overfilledDay = weekDays[overfilledDayIndex];
      const underfilledDay = weekDays[underfilledDayIndex];
      const overfilledDateKey = formatDateKey(overfilledDay);
      const underfilledDateKey = formatDateKey(underfilledDay);
      
      const overfilledEmployees = Array.from(assignedWorkDays.get(overfilledDateKey) || []);
      
      // Find employees who can be moved from overfilled to underfilled days
      for (const employeeId of overfilledEmployees) {
        const employee = sortedEmployees.find(e => e.id === employeeId);
        if (!employee) continue;
        
        // Check if employee can work on the underfilled day
        if (canEmployeeWorkOnDay(employee, underfilledDay, isTemporarilyFlexible)) {
          // Skip if already assigned to underfilled day
          const isAlreadyAssignedToUnderfilledDay = assignedWorkDays.get(underfilledDateKey)?.has(employeeId);
          if (isAlreadyAssignedToUnderfilledDay) continue;
          
          // Skip if has special shift
          const hasSpecialShiftOnUnderfilledDay = hasSpecialShift(employeeId, underfilledDateKey, existingShifts);
          if (hasSpecialShiftOnUnderfilledDay) continue;
          
          // Find the work shift entry for the overfilled day
          const workShiftIndex = workShifts.findIndex(
            shift => shift.employeeId === employeeId && shift.date === overfilledDateKey && shift.shiftType === "Arbeit"
          );
          
          if (workShiftIndex !== -1) {
            // Remove from overfilled day
            workShifts.splice(workShiftIndex, 1);
            
            // Add free shift for the overfilled day
            freeShifts.push({
              employeeId,
              date: overfilledDateKey,
              shiftType: "Frei"
            });
            
            // Remove from assigned employees for overfilled day
            const overfilledDayEmployees = assignedWorkDays.get(overfilledDateKey);
            if (overfilledDayEmployees) {
              overfilledDayEmployees.delete(employeeId);
            }
            
            // Update counter for overfilled day
            filledPositions[overfilledDayIndex]--;
            
            // Add to underfilled day
            workShifts.push({
              employeeId,
              date: underfilledDateKey,
              shiftType: "Arbeit"
            });
            
            // Add to assigned employees for underfilled day
            const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
            if (underfilledDayEmployees) {
              underfilledDayEmployees.add(employeeId);
            }
            
            // Update counter for underfilled day
            filledPositions[underfilledDayIndex]++;
            
            // Break if this underfilled day is now satisfied
            if (filledPositions[underfilledDayIndex] >= (requiredEmployees[underfilledDayIndex] || 0)) {
              break;
            }
          }
        }
      }
    }
  }
}

// New helper function to ensure all employees are assigned their full working days
function ensureFullWorkingDays(
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
      // Reorder days to prioritize Saturday (assuming index 5 is Saturday)
      const orderedDayIndices = [...Array(weekDays.length).keys()];
      // Move Saturday (index 5) to the front if it exists
      if (orderedDayIndices.includes(5)) {
        orderedDayIndices.sort((a, b) => {
          if (a === 5) return -1;
          if (b === 5) return 1;
          return 0;
        });
      }
      
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
