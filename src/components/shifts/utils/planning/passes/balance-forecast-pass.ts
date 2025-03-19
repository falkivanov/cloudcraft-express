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
  const overfilledDays: { dayIndex: number, excess: number }[] = [];
  const underfilledDays: { dayIndex: number, shortage: number }[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled > required && required > 0) {
      overfilledDays.push({ dayIndex, excess: filled - required });
    } else if (filled < required) {
      underfilledDays.push({ dayIndex, shortage: required - filled });
    }
  });
  
  // Sort by most overfilled/underfilled first
  overfilledDays.sort((a, b) => b.excess - a.excess);
  underfilledDays.sort((a, b) => b.shortage - a.shortage);
  
  // PHASE 2: Aggressively balance forecast by moving employees from overfilled to underfilled days
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
  
  // PHASE 4: Final balancing pass - look for critical understaffed days again
  const criticalUnderfilledDays: { dayIndex: number, shortage: number }[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled < required) {
      criticalUnderfilledDays.push({ dayIndex, shortage: required - filled });
    }
  });
  
  if (criticalUnderfilledDays.length > 0) {
    // Sort by most understaffed first
    criticalUnderfilledDays.sort((a, b) => b.shortage - a.shortage);
    
    // Now look through all days that have staffing above the required level
    const daysWithExtraStaff: { dayIndex: number, excess: number }[] = [];
    
    weekDays.forEach((_, dayIndex) => {
      const required = requiredEmployees[dayIndex] || 0;
      const filled = filledPositions[dayIndex];
      
      // Only consider days with at least 1 extra person after meeting requirements
      if (filled > required && filled > 1) {
        daysWithExtraStaff.push({ dayIndex, excess: filled - required });
      }
    });
    
    // Sort by least critical excess first (to keep days with many extra staff stable if possible)
    daysWithExtraStaff.sort((a, b) => a.excess - b.excess);
    
    // Try to move employees from any day with extra staff to critically understaffed days
    if (daysWithExtraStaff.length > 0) {
      aggressiveRebalancing(
        sortedEmployees, weekDays, filledPositions, requiredEmployees,
        daysWithExtraStaff, criticalUnderfilledDays, assignedWorkDays, formatDateKey,
        isTemporarilyFlexible, existingShifts, workShifts, freeShifts
      );
    }
  }
}

// Helper function to balance employee distribution
function balanceEmployeeDistribution(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  overfilledDays: { dayIndex: number, excess: number }[],
  underfilledDays: { dayIndex: number, shortage: number }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  // For each underfilled day, try to move employees from overfilled days
  for (const { dayIndex: underfilledIndex, shortage } of underfilledDays) {
    // Skip if we've already reached the target for this underfilled day
    if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0)) {
      continue;
    }
    
    const underfilledDay = weekDays[underfilledIndex];
    const underfilledDateKey = formatDateKey(underfilledDay);
    
    let employeesMoved = 0;
    
    // Try each overfilled day in order (most overfilled first)
    for (const { dayIndex: overfilledIndex } of overfilledDays) {
      // Skip if this day doesn't have enough excess anymore
      if (filledPositions[overfilledIndex] <= (requiredEmployees[overfilledIndex] || 0)) {
        continue;
      }
      
      const overfilledDay = weekDays[overfilledIndex];
      const overfilledDateKey = formatDateKey(overfilledDay);
      
      // Get all employees assigned to the overfilled day
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
          
          // Make sure removing from the overfilled day won't drop it below requirements
          if (filledPositions[overfilledIndex] - 1 < (requiredEmployees[overfilledIndex] || 0)) {
            continue;
          }
          
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
            filledPositions[overfilledIndex]--;
            
            // Add to underfilled day
            workShifts.push({
              employeeId,
              date: underfilledDateKey,
              shiftType: "Arbeit"
            });
            
            // Add to assigned employees for underfilled day
            const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
            if (underfilledDayEmployees) {
              underfilledDayEmployees.add(employee.id);
            }
            
            // Update counter for underfilled day
            filledPositions[underfilledIndex]++;
            employeesMoved++;
            
            // Break if this underfilled day is now satisfied
            if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
              break;
            }
          }
        }
      }
      
      // If we've fixed this underfilled day, break out of the overfilled days loop
      if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
        break;
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

// New aggressive rebalancing function for critical understaffed days
function aggressiveRebalancing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  daysWithExtraStaff: { dayIndex: number, excess: number }[],
  criticalUnderfilledDays: { dayIndex: number, shortage: number }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  // For each critically underfilled day, try to find employees from any day with extra staff
  for (const { dayIndex: underfilledIndex, shortage } of criticalUnderfilledDays) {
    // Skip if this day is now sufficiently staffed
    if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0)) {
      continue;
    }
    
    const underfilledDay = weekDays[underfilledIndex];
    const underfilledDateKey = formatDateKey(underfilledDay);
    
    let employeesMoved = 0;
    
    // Try each day with extra staff
    for (const { dayIndex: extraStaffIndex } of daysWithExtraStaff) {
      // Don't take from days that are now at or below their requirement
      if (filledPositions[extraStaffIndex] <= (requiredEmployees[extraStaffIndex] || 0)) {
        continue;
      }
      
      const extraStaffDay = weekDays[extraStaffIndex];
      const extraStaffDateKey = formatDateKey(extraStaffDay);
      
      // Get all employees assigned to this day
      const dayEmployees = Array.from(assignedWorkDays.get(extraStaffDateKey) || []);
      
      // Check each employee to see if they can be moved
      for (const employeeId of dayEmployees) {
        // Skip if this would bring the day below required staffing
        if (filledPositions[extraStaffIndex] - 1 < (requiredEmployees[extraStaffIndex] || 0)) {
          break;
        }
        
        const employee = sortedEmployees.find(e => e.id === employeeId);
        if (!employee) continue;
        
        // Check if employee can work on the underfilled day
        if (canEmployeeWorkOnDay(employee, underfilledDay, isTemporarilyFlexible)) {
          // Skip if already assigned to underfilled day
          const isAlreadyAssignedToUnderfilledDay = assignedWorkDays.get(underfilledDateKey)?.has(employeeId);
          if (isAlreadyAssignedToUnderfilledDay) continue;
          
          // Skip if has special shift on either day
          const hasSpecialShiftOnUnderfilledDay = hasSpecialShift(employeeId, underfilledDateKey, existingShifts);
          if (hasSpecialShiftOnUnderfilledDay) continue;
          
          // Find the work shift entry for the day with extra staff
          const workShiftIndex = workShifts.findIndex(
            shift => shift.employeeId === employeeId && shift.date === extraStaffDateKey && shift.shiftType === "Arbeit"
          );
          
          if (workShiftIndex !== -1) {
            // Remove from day with extra staff
            workShifts.splice(workShiftIndex, 1);
            
            // Add free shift for the original day
            freeShifts.push({
              employeeId,
              date: extraStaffDateKey,
              shiftType: "Frei"
            });
            
            // Remove from assigned employees for original day
            const extraDayEmployees = assignedWorkDays.get(extraStaffDateKey);
            if (extraDayEmployees) {
              extraDayEmployees.delete(employeeId);
            }
            
            // Update counter for day with extra staff
            filledPositions[extraStaffIndex]--;
            
            // Add to underfilled day
            workShifts.push({
              employeeId,
              date: underfilledDateKey,
              shiftType: "Arbeit"
            });
            
            // Add to assigned employees for underfilled day
            const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
            if (underfilledDayEmployees) {
              underfilledDayEmployees.add(employee.id);
            }
            
            // Update counter for underfilled day
            filledPositions[underfilledIndex]++;
            employeesMoved++;
            
            // Break if this underfilled day is now satisfied
            if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
              break;
            }
          }
        }
      }
      
      // If we've fixed this underfilled day, move to the next critical day
      if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
        break;
      }
    }
  }
}
