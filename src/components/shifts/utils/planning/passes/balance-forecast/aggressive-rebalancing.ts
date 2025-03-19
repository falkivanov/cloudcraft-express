
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

// Helper function for critical understaffed days rebalancing
export function aggressiveRebalancing(
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
