
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

// Final aggressive rebalancing to address critical shortages
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
  // Track employees who have been scheduled for 6 days (exceeding their standard 5)
  // to avoid over-assigning when not necessary
  const employeesScheduledForExtraDays = new Set<string>();

  // Process underfilled days one by one, starting with the most critical
  for (const { dayIndex: understaffedDayIndex, shortage } of criticalUnderfilledDays) {
    if (shortage <= 0) continue; // Skip if actually not understaffed
    
    const understaffedDay = weekDays[understaffedDayIndex];
    const understaffedDateKey = formatDateKey(understaffedDay);
    
    // Handle the required staffing for this day
    let remainingNeeded = shortage;
    
    // Try to move employees from overstaffed days
    for (const { dayIndex: overstaffedDayIndex, excess } of daysWithExtraStaff) {
      if (remainingNeeded <= 0) break; // Stop if we've filled the day
      if (excess <= 0) continue; // Skip if not actually overstaffed
      
      const overstaffedDay = weekDays[overstaffedDayIndex];
      const overstaffedDateKey = formatDateKey(overstaffedDay);
      
      // Get all employees assigned to the overstaffed day
      const employeesOnOverstaffedDay = assignedWorkDays.get(overstaffedDateKey) || new Set<string>();
      
      // Skip empty sets
      if (employeesOnOverstaffedDay.size === 0) continue;
      
      // Convert to array for iteration
      const employeeIds = Array.from(employeesOnOverstaffedDay);
      
      // Sort employees by their scheduled days (prioritize those with more assigned days)
      // to avoid pushing employees to 6 days when not needed
      const employeesWithInfo = [];
      
      for (const employeeId of employeeIds) {
        const employee = sortedEmployees.find(e => e.id === employeeId);
        if (!employee) continue;
        
        let assignedDaysCount = 0;
        weekDays.forEach(day => {
          const dateKey = formatDateKey(day);
          if (assignedWorkDays.get(dateKey)?.has(employeeId)) {
            assignedDaysCount++;
          }
        });
        
        employeesWithInfo.push({
          employee,
          assignedDaysCount
        });
      }
      
      // Sort to prioritize employees with more assigned days first (to reduce from 6 to 5 if possible)
      // and then those who have fewer than their required days
      employeesWithInfo.sort((a, b) => {
        // First priority: employees who are over-scheduled (above 5 or their working days)
        const aIsOverScheduled = a.assignedDaysCount > a.employee.workingDaysAWeek;
        const bIsOverScheduled = b.assignedDaysCount > b.employee.workingDaysAWeek;
        
        if (aIsOverScheduled && !bIsOverScheduled) return -1;
        if (!aIsOverScheduled && bIsOverScheduled) return 1;
        
        // If both or neither are over-scheduled, prioritize those with more days
        return b.assignedDaysCount - a.assignedDaysCount;
      });
      
      // Now try to move employees one by one
      for (const { employee, assignedDaysCount } of employeesWithInfo) {
        if (remainingNeeded <= 0) break; // Stop if we've filled the day
        
        // Skip if this employee is already assigned to the understaffed day
        if (assignedWorkDays.get(understaffedDateKey)?.has(employee.id)) continue;
        
        // Skip if employee has a special shift on understaffed day
        if (hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) continue;
        
        // Check if employee can work on the understaffed day
        if (!canEmployeeWorkOnDay(employee, understaffedDay, isTemporarilyFlexible)) continue;
        
        // If employee is working exactly their required days, OR
        // If we already have enough employees with an extra day and this employee would go over their standard days,
        // then we need to move them instead of adding a day
        const standardWorkingDays = employee.workingDaysAWeek;
        const isAtStandardDays = assignedDaysCount === standardWorkingDays;
        const wouldExceedStandard = assignedDaysCount >= standardWorkingDays;
        const hasWantsToWorkSixDays = employee.workingDaysAWeek === 5 && employee.wantsToWorkSixDays;
        
        // Calculate total overstaffing across all days
        const totalExcessStaff = daysWithExtraStaff.reduce((sum, day) => sum + day.excess, 0);
        const totalShortage = criticalUnderfilledDays.reduce((sum, day) => sum + day.shortage, 0);
        
        // Only consider adding a 6th day if the employee wants it AND we have critical shortages
        // that exceed our excess staff
        const shouldConsiderExtraDay = hasWantsToWorkSixDays && 
                                       totalShortage > totalExcessStaff && 
                                       !employeesScheduledForExtraDays.has(employee.id);
        
        // If employee is already at or above their standard days and adding another day isn't justified,
        // we need to move them from one day to another instead of just adding
        if (wouldExceedStandard && !shouldConsiderExtraDay) {
          // Move from overstaffed to understaffed (remove from overstaffed, add to understaffed)
          
          // Remove from overstaffed day
          const overstaffedDayEmployees = assignedWorkDays.get(overstaffedDateKey);
          if (overstaffedDayEmployees) {
            overstaffedDayEmployees.delete(employee.id);
          }
          
          // Decrement filled positions for overstaffed day
          filledPositions[overstaffedDayIndex]--;
          
          // Find and remove the work shift
          const workShiftIndex = workShifts.findIndex(
            shift => shift.employeeId === employee.id && shift.date === overstaffedDateKey
          );
          
          if (workShiftIndex !== -1) {
            workShifts.splice(workShiftIndex, 1);
          }
          
          // Add to understaffed day
          const understaffedDayEmployees = assignedWorkDays.get(understaffedDateKey);
          if (understaffedDayEmployees) {
            understaffedDayEmployees.add(employee.id);
          }
          
          // Add new work shift for understaffed day
          workShifts.push({
            employeeId: employee.id,
            date: understaffedDateKey,
            shiftType: "Arbeit"
          });
          
          // Increment filled positions for understaffed day
          filledPositions[understaffedDayIndex]++;
          
          // Update remaining needed count
          remainingNeeded--;
          
          // Update the excess for the overstaffed day
          for (const day of daysWithExtraStaff) {
            if (day.dayIndex === overstaffedDayIndex) {
              day.excess--;
              break;
            }
          }
        } 
        // For employees who want to work 6 days and we have critical shortages
        else if (shouldConsiderExtraDay) {
          // Directly add to understaffed day without removing from overstaffed
          
          // Add to understaffed day
          const understaffedDayEmployees = assignedWorkDays.get(understaffedDateKey);
          if (understaffedDayEmployees) {
            understaffedDayEmployees.add(employee.id);
          }
          
          // Add new work shift for understaffed day
          workShifts.push({
            employeeId: employee.id,
            date: understaffedDateKey,
            shiftType: "Arbeit"
          });
          
          // Increment filled positions for understaffed day
          filledPositions[understaffedDayIndex]++;
          
          // Mark this employee as scheduled for an extra day
          employeesScheduledForExtraDays.add(employee.id);
          
          // Update remaining needed count
          remainingNeeded--;
        }
        
        // If we've addressed the shortage for this day, break out
        if (remainingNeeded <= 0) break;
      }
    }
  }
}
