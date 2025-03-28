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
import {
  balanceWeekendDay,
  aggressiveWeekendBalancing
} from "./helpers/weekend-prioritization";
import {
  hasSpecialShift,
  calculateAverageFilledRatio
} from "./helpers/weekend-balancing";

/**
 * Final aggressive rebalancing to address critical shortages
 */
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
    // HIGHEST PRIORITY: Weekend days (prioritize Saturday above all)
    if (a.dayIndex === 5 && b.dayIndex !== 5) return -1; // Saturday is highest priority
    if (a.dayIndex !== 5 && b.dayIndex === 5) return 1;
    if (a.dayIndex === 6 && b.dayIndex !== 6) return -1; // Sunday is next
    if (a.dayIndex !== 6 && b.dayIndex === 6) return 1;
    
    // Calculate shortage severity as a percentage of required
    const aRequired = requiredEmployees[a.dayIndex] || 1;
    const bRequired = requiredEmployees[b.dayIndex] || 1;
    
    const aShortageRatio = a.shortage / aRequired;
    const bShortageRatio = b.shortage / bRequired;
    
    // For same severity, prioritize by absolute shortage
    if (Math.abs(aShortageRatio - bShortageRatio) < 0.1) {
      return b.shortage - a.shortage; // Higher absolute shortage first
    }
    
    // Otherwise sort by severity ratio
    return bShortageRatio - aShortageRatio;
  });
  
  // Log prioritized days for debugging
  console.log("Prioritized underfilled days:", prioritizedUnderfilledDays.map(d => 
    `Day ${d.dayIndex} (${weekDays[d.dayIndex].toDateString()}): shortage ${d.shortage}, required ${requiredEmployees[d.dayIndex]}`));
    
  // Process each understaffed day, prioritizing weekend days
  for (const { dayIndex: understaffedDayIndex, shortage } of prioritizedUnderfilledDays) {
    if (shortage <= 0) continue;
    
    const understaffedDay = weekDays[understaffedDayIndex];
    const understaffedDateKey = formatDateKey(understaffedDay);
    const isWeekendDay = understaffedDayIndex >= 5;
    
    // For weekdays, just log brief info
    if (!isWeekendDay) {
      console.log(`Processing day ${understaffedDayIndex} with shortage ${shortage}`);
    }
    
    let remainingNeeded = shortage;
    
    // SPECIAL HANDLING FOR WEEKEND DAYS
    if (isWeekendDay) {
      // Use specialized weekend balancing function
      remainingNeeded = balanceWeekendDay(
        understaffedDayIndex,
        understaffedDay,
        understaffedDateKey,
        shortage,
        isWeekendDay,
        sortedEmployees,
        weekDays,
        filledPositions,
        requiredEmployees,
        daysWithExtraStaff,
        assignedWorkDays,
        formatDateKey,
        isTemporarilyFlexible,
        totalShortage,
        totalExcessStaff,
        employeesScheduledForExtraDays,
        existingShifts,
        workShifts,
        freeShifts
      );
    }
    
    // If we still need more employees, try from overstaffed days
    if (remainingNeeded > 0) {
      console.log(`Still need ${remainingNeeded} more employees for day ${understaffedDayIndex}`);
      
      // For weekend days, try more aggressive rebalancing
      if (isWeekendDay) {
        remainingNeeded = aggressiveWeekendBalancing(
          sortedEmployees,
          weekDays,
          filledPositions,
          requiredEmployees,
          daysWithExtraStaff,
          understaffedDayIndex,
          understaffedDateKey,
          remainingNeeded,
          assignedWorkDays,
          formatDateKey,
          isTemporarilyFlexible,
          existingShifts,
          workShifts
        );
      }
      
      // General rebalancing for any remaining needs
      if (remainingNeeded > 0) {
        // Sort overstaffed days - prefer taking from most overstaffed first
        const sortedOverstaffedDays = [...daysWithExtraStaff]
          .sort((a, b) => b.excess - a.excess);
          
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
            
            // Check if employee can be assigned to the understaffed day
            let canAssign = canAssignEmployeeToDay(
              employee,
              understaffedDay,
              understaffedDateKey,
              isTemporarilyFlexible,
              assignedWorkDays,
              existingShifts
            );
            
            if (!canAssign) {
              continue;
            }
            
            // Determine if employee would exceed standard days
            const standardWorkingDays = employee.workingDaysAWeek;
            const wouldExceedStandard = assignedDaysCount >= standardWorkingDays;
            
            // Move the employee between days (standard rebalancing)
            if (wouldExceedStandard && !employee.wantsToWorkSixDays) {
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
              remainingNeeded--;
              console.log(`Moved ${employee.name} from day ${overstaffedDayIndex} to day ${understaffedDayIndex}`);
            } 
            // For employees who want to work 6 days and we have critical shortages
            else if (shouldConsiderForExtraDay(
              employee,
              assignedDaysCount,
              totalShortage,
              totalExcessStaff,
              employeesScheduledForExtraDays
            )) {
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
              remainingNeeded--;
              console.log(`Added extra day for ${employee.name} on day ${understaffedDayIndex}`);
            }
            
            // If we've addressed the shortage for this day, break out
            if (remainingNeeded <= 0) break;
          }
        }
      }
    }
    
    // Log final status for this day
    const finalStatus = `After processing, day ${understaffedDayIndex} has ${filledPositions[understaffedDayIndex]}/${requiredEmployees[understaffedDayIndex] || 0} employees (shortage was ${shortage})`;
    if (isWeekendDay) {
      console.log(`WEEKEND DAY STATUS: ${finalStatus}`);
    } else {
      console.log(finalStatus);
    }
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

// Helper function to check if an employee has a special shift
function hasSpecialShift(
  employeeId: string,
  dateKey: string,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  if (!existingShifts) return false;
  
  const shiftKey = `${employeeId}-${dateKey}`;
  const shift = existingShifts.get(shiftKey);
  
  return shift !== undefined && 
    (shift.shiftType === "Termin" || 
     shift.shiftType === "Urlaub" || 
     shift.shiftType === "Krank");
}

// Helper to get the assigned days count for an employee
function getAssignedDaysCount(
  employeeId: string,
  weekDays: Date[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string
): number {
  let count = 0;
  weekDays.forEach(day => {
    const dateKey = formatDateKey(day);
    if (assignedWorkDays.get(dateKey)?.has(employeeId)) {
      count++;
    }
  });
  return count;
}
