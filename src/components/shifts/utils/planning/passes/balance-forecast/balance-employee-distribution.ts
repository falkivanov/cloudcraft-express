
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

// Helper function to balance employee distribution from overfilled to underfilled days
export function balanceEmployeeDistribution(
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
