
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
  freeShifts?: ShiftPlan[],
  underutilizedEmployees?: Employee[]
) {
  // Enhanced logging
  console.log("Starting employee distribution balancing");
  console.log(`Underfilled days: ${underfilledDays.map(d => `Day ${d.dayIndex} (shortage: ${d.shortage})`).join(', ')}`);
  console.log(`Overfilled days: ${overfilledDays.map(d => `Day ${d.dayIndex} (excess: ${d.excess})`).join(', ')}`);
  
  if (underutilizedEmployees && underutilizedEmployees.length > 0) {
    console.log(`Prioritizing ${underutilizedEmployees.length} underutilized employees for rebalancing`);
  }
  
  // For each underfilled day, try to move employees from overfilled days
  for (const { dayIndex: underfilledIndex, shortage } of underfilledDays) {
    // Skip if we've already reached the target for this underfilled day
    if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0)) {
      continue;
    }
    
    const underfilledDay = weekDays[underfilledIndex];
    const underfilledDateKey = formatDateKey(underfilledDay);
    
    console.log(`Processing underfilled day ${underfilledIndex} (${underfilledDateKey}), shortage: ${shortage}`);
    
    let employeesMoved = 0;
    
    // PRIORITY 1: First try with underutilized employees - employees who aren't working their full days
    if (underutilizedEmployees && underutilizedEmployees.length > 0) {
      for (const employee of underutilizedEmployees) {
        // Skip if already fully assigned
        if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) continue;
        
        // Skip if already assigned to this day
        if (assignedWorkDays.get(underfilledDateKey)?.has(employee.id)) continue;
        
        // Skip if has special shift on this day
        if (hasSpecialShift(employee.id, underfilledDateKey, existingShifts)) continue;
        
        // Check if employee can work on the underfilled day
        if (canEmployeeWorkOnDay(employee, underfilledDay, isTemporarilyFlexible)) {
          // Assign directly to this underfilled day without removing from another day
          workShifts.push({
            employeeId: employee.id,
            date: underfilledDateKey,
            shiftType: "Arbeit"
          });
          
          // Update tracking
          employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
          filledPositions[underfilledIndex]++;
          
          // Add to assigned employees for this day
          const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
          if (underfilledDayEmployees) {
            underfilledDayEmployees.add(employee.id);
          }
          
          console.log(`Assigned underutilized employee ${employee.name} to underfilled day ${underfilledIndex}`);
          
          employeesMoved++;
          
          // Break if this underfilled day is now satisfied
          if (filledPositions[underfilledIndex] >= (requiredEmployees[underfilledIndex] || 0) || employeesMoved >= shortage) {
            break;
          }
        }
      }
    }
    
    // If we still need more employees, try moving from overfilled days
    if (filledPositions[underfilledIndex] < (requiredEmployees[underfilledIndex] || 0)) {
      // PRIORITY 2: Try with employees who are already scheduled on overfilled days
      // Try each overfilled day in order (most overfilled first)
      for (const { dayIndex: overfilledIndex } of overfilledDays) {
        // Skip if this day doesn't have enough excess anymore
        if (filledPositions[overfilledIndex] <= (requiredEmployees[overfilledIndex] || 0)) {
          continue;
        }
        
        const overfilledDay = weekDays[overfilledIndex];
        const overfilledDateKey = formatDateKey(overfilledDay);
        
        console.log(`Trying to move employees from overfilled day ${overfilledIndex} (${overfilledDateKey})`);
        
        // Get all employees assigned to the overfilled day
        const overfilledEmployees = Array.from(assignedWorkDays.get(overfilledDateKey) || []);
        
        // First, prioritize employees who are working more than their minimum required days
        // Sort employees by the number of days they're scheduled for (highest first)
        const sortedByAssignment = [...overfilledEmployees].sort((a, b) => {
          const aAssigned = employeeAssignments[a] || 0;
          const bAssigned = employeeAssignments[b] || 0;
          
          const aTarget = sortedEmployees.find(e => e.id === a)?.workingDaysAWeek || 5;
          const bTarget = sortedEmployees.find(e => e.id === b)?.workingDaysAWeek || 5;
          
          // Calculate how far over their minimum each employee is
          const aOver = aAssigned - aTarget;
          const bOver = bAssigned - bTarget;
          
          // Prioritize those who are over their minimum first
          if (aOver > 0 && bOver <= 0) return -1;
          if (aOver <= 0 && bOver > 0) return 1;
          
          // If both or neither are over, prioritize those with more assigned days
          return bAssigned - aAssigned;
        });
        
        // Find employees who can be moved from overfilled to underfilled days
        for (const employeeId of sortedByAssignment) {
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
              
              // Update employee's assignment count
              employeeAssignments[employeeId]--;
              
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
              
              // Update employee's assignment count
              employeeAssignments[employeeId]++;
              
              console.log(`Moved employee ${employee.name} from day ${overfilledIndex} to day ${underfilledIndex}`);
              
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
    
    console.log(`After processing, day ${underfilledIndex} has ${filledPositions[underfilledIndex]}/${requiredEmployees[underfilledIndex] || 0} employees`);
  }
}
