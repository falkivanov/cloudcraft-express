
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import {
  shouldConsiderForExtraDay,
  canAssignEmployeeToDay,
  addEmployeeToDay,
} from "./helpers/employee-assignment";
import {
  moveEmployeeBetweenDays
} from "./helpers/employee-reassignment";
import {
  getSortedEmployeesOnOverstaffedDay,
  calculateStaffingImbalance
} from "./helpers/staffing-analysis";

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
  
  // Calculate total staffing imbalance
  const { totalExcessStaff, totalShortage } = calculateStaffingImbalance(
    daysWithExtraStaff,
    criticalUnderfilledDays
  );
  
  // Calculate average staffing ratio per day to detect severe imbalances
  const avgFilledRatio = calculateAverageFilledRatio(weekDays, filledPositions, requiredEmployees);
  console.log(`Average filled ratio across week: ${avgFilledRatio.toFixed(2)}`);
  
  // Sort understaffed days by most critical first (weekend days with significant shortage get higher priority)
  const prioritizedUnderfilledDays = [...criticalUnderfilledDays].sort((a, b) => {
    // First, prioritize weekend days (dayIndex 5 = Saturday, 6 = Sunday)
    const aIsWeekend = a.dayIndex >= 5;
    const bIsWeekend = b.dayIndex >= 5;
    
    if (aIsWeekend && !bIsWeekend) return -1;
    if (!aIsWeekend && bIsWeekend) return 1;
    
    // Then sort by severity of shortage (shortage / required)
    const aRequired = requiredEmployees[a.dayIndex] || 1;
    const bRequired = requiredEmployees[b.dayIndex] || 1;
    
    const aRatio = a.shortage / aRequired;
    const bRatio = b.shortage / bRequired;
    
    return bRatio - aRatio; // Higher ratio (more understaffed) first
  });
  
  console.log("Prioritized underfilled days:", prioritizedUnderfilledDays.map(d => 
    `Day ${d.dayIndex}: shortage ${d.shortage}, required ${requiredEmployees[d.dayIndex]}`));
    
  // Process underfilled days one by one, starting with the most critical
  for (const { dayIndex: understaffedDayIndex, shortage } of prioritizedUnderfilledDays) {
    if (shortage <= 0) continue; // Skip if actually not understaffed
    
    const understaffedDay = weekDays[understaffedDayIndex];
    const understaffedDateKey = formatDateKey(understaffedDay);
    const isWeekendDay = understaffedDayIndex >= 5;
    
    // Handle the required staffing for this day
    let remainingNeeded = shortage;
    
    console.log(`Processing day ${understaffedDayIndex} with shortage ${shortage}, remaining: ${remainingNeeded}`);
    
    // For weekend days especially, be more aggressive in rebalancing
    // Sort overstaffed days to prefer taking from the most overstaffed first
    const sortedOverstaffedDays = [...daysWithExtraStaff]
      .sort((a, b) => {
        // Higher excess first
        if (b.excess !== a.excess) return b.excess - a.excess;
        
        // For same excess, prefer weekdays over weekend
        const aIsWeekend = a.dayIndex >= 5;
        const bIsWeekend = b.dayIndex >= 5;
        
        if (aIsWeekend && !bIsWeekend) return 1;
        if (!aIsWeekend && bIsWeekend) return -1;
        
        return 0;
      });
    
    // Try to move employees from overstaffed days
    for (const { dayIndex: overstaffedDayIndex, excess } of sortedOverstaffedDays) {
      if (remainingNeeded <= 0) break; // Stop if we've filled the day
      if (excess <= 0) continue; // Skip if not actually overstaffed
      
      const overstaffedDay = weekDays[overstaffedDayIndex];
      const overstaffedDateKey = formatDateKey(overstaffedDay);
      
      // Get all employees assigned to the overstaffed day
      const employeesOnOverstaffedDay = assignedWorkDays.get(overstaffedDateKey) || new Set<string>();
      
      // Get sorted employees from overstaffed day - prioritizing those who'd be better suited for movement
      const employeesWithInfo = getSortedEmployeesOnOverstaffedDay(
        employeesOnOverstaffedDay,
        sortedEmployees,
        weekDays,
        assignedWorkDays,
        formatDateKey
      );
      
      // Now try to move employees one by one
      for (const { employee, assignedDaysCount } of employeesWithInfo) {
        if (remainingNeeded <= 0) break; // Stop if we've filled the day
        
        // Special case for weekend days: be more lenient with reassignments
        let canAssign = canAssignEmployeeToDay(
          employee,
          understaffedDay,
          understaffedDateKey,
          isTemporarilyFlexible,
          assignedWorkDays,
          existingShifts
        );
        
        // For weekend days with critical shortages, consider forcing flexible scheduling
        // even for employees who normally wouldn't work that day
        if (isWeekendDay && !canAssign && employee.isWorkingDaysFlexible) {
          // For weekend days, be more aggressive - try to move even less-flexible employees
          // but only if we have a severe shortage (>25% below required)
          const severeShortage = shortage > (requiredEmployees[understaffedDayIndex] || 0) * 0.25;
          if (severeShortage) {
            // Check if employee has no conflicts that day (e.g., special shifts)
            const hasNoConflicts = !assignedWorkDays.get(understaffedDateKey)?.has(employee.id);
            if (hasNoConflicts) {
              canAssign = true;
              console.log(`Aggressively scheduling ${employee.name} for weekend day ${understaffedDayIndex} due to critical shortage`);
            }
          }
        }
        
        if (!canAssign) {
          continue;
        }
        
        // If employee is working exactly their required days, OR
        // If we already have enough employees with an extra day and this employee would go over their standard days,
        // then we need to move them instead of adding a day
        const standardWorkingDays = employee.workingDaysAWeek;
        const wouldExceedStandard = assignedDaysCount >= standardWorkingDays;
        
        // Determine if employee should be considered for an extra day assignment
        const shouldConsiderExtraDay = shouldConsiderForExtraDay(
          employee,
          assignedDaysCount,
          totalShortage,
          totalExcessStaff,
          employeesScheduledForExtraDays
        );
        
        // If employee is already at or above their standard days and adding another day isn't justified,
        // we need to move them from one day to another instead of just adding
        if (wouldExceedStandard && !shouldConsiderExtraDay) {
          // Move from overstaffed to understaffed
          moveEmployeeBetweenDays(
            employee,
            overstaffedDayIndex,
            overstaffedDateKey,
            understaffedDayIndex,
            understaffedDateKey,
            filledPositions,
            assignedWorkDays,
            workShifts,
            daysWithExtraStaff
          );
          
          // Update remaining needed count
          remainingNeeded--;
          console.log(`Moved ${employee.name} from day ${overstaffedDayIndex} to day ${understaffedDayIndex}`);
        } 
        // For employees who want to work 6 days and we have critical shortages
        else if (shouldConsiderExtraDay) {
          // Directly add to understaffed day without removing from overstaffed
          addEmployeeToDay(
            employee,
            understaffedDayIndex,
            understaffedDateKey,
            filledPositions,
            assignedWorkDays,
            workShifts,
            employeesScheduledForExtraDays
          );
          
          // Update remaining needed count
          remainingNeeded--;
          console.log(`Added extra day for ${employee.name} on day ${understaffedDayIndex}`);
        }
        
        // If we've addressed the shortage for this day, break out
        if (remainingNeeded <= 0) break;
      }
    }
    
    // Log final status for this day
    console.log(`After processing, day ${understaffedDayIndex} has ${filledPositions[understaffedDayIndex]}/${requiredEmployees[understaffedDayIndex] || 0} employees (shortage was ${shortage})`);
  }
}

// Helper function to calculate average filled ratio across all days
function calculateAverageFilledRatio(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): number {
  let totalRatio = 0;
  let daysWithRequirements = 0;
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    if (required > 0) {
      const filled = filledPositions[dayIndex];
      totalRatio += filled / required;
      daysWithRequirements++;
    }
  });
  
  return daysWithRequirements > 0 ? totalRatio / daysWithRequirements : 1;
}
