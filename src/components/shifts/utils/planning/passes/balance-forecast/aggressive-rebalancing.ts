
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
  isAvailableForWeekendDay,
  prioritizeForWeekendAssignment
} from "./helpers/employee-utilization";

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
    
    // For weekend days, log more detailed info
    if (isWeekendDay) {
      console.log(`Processing WEEKEND day ${understaffedDayIndex} (${understaffedDay.toDateString()}) with shortage ${shortage}`);
      console.log(`Current staffing: ${filledPositions[understaffedDayIndex]}/${requiredEmployees[understaffedDayIndex] || 0}`);
    } else {
      console.log(`Processing day ${understaffedDayIndex} with shortage ${shortage}`);
    }
    
    // For weekend days especially, be more aggressive in rebalancing
    let remainingNeeded = shortage;
    
    // Sort overstaffed days - prefer taking from most overstaffed first
    const sortedOverstaffedDays = [...daysWithExtraStaff]
      .sort((a, b) => {
        // Higher excess first
        return b.excess - a.excess;
      });
    
    // SPECIAL HANDLING FOR WEEKEND DAYS
    if (isWeekendDay) {
      // First approach: Try using underutilized employees or employees who prefer/can work weekends
      if (remainingNeeded > 0) {
        // Create a simple employeeAssignments object to track assigned days per employee
        const employeeAssignments: Record<string, number> = {};
        
        // Calculate how many days each employee is assigned
        sortedEmployees.forEach(employee => {
          let count = 0;
          weekDays.forEach(day => {
            const dateKey = formatDateKey(day);
            if (assignedWorkDays.get(dateKey)?.has(employee.id)) {
              count++;
            }
          });
          employeeAssignments[employee.id] = count;
        });
        
        // Prioritize employees based on weekend suitability
        const prioritizedEmployees = prioritizeForWeekendAssignment(
          sortedEmployees,
          assignedWorkDays,
          employeeAssignments,
          formatDateKey,
          weekDays
        );
        
        console.log(`Prioritized ${prioritizedEmployees.length} employees for weekend assignment`);
        
        // Try to assign from prioritized list
        for (const employee of prioritizedEmployees) {
          // Skip if already assigned to this day or has a special shift
          if (assignedWorkDays.get(understaffedDateKey)?.has(employee.id) ||
              hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) {
            continue;
          }
          
          // Check if ready for weekend assignment
          const assignedDaysCount = getAssignedDaysCount(employee.id, weekDays, assignedWorkDays, formatDateKey);
          
          if (isAvailableForWeekendDay(employee, understaffedDayIndex, assignedDaysCount, isTemporarilyFlexible)) {
            // Try to reassign from a weekday if needed
            let addedToWeekend = false;
            
            // If already working all weekdays, we need to move from a weekday
            if (assignedDaysCount >= 5 && !employee.wantsToWorkSixDays) {
              // Try to find a weekday to remove from
              for (const { dayIndex: weekdayIndex } of sortedOverstaffedDays) {
                if (weekdayIndex < 5) { // Only check weekdays
                  const weekdayDateKey = formatDateKey(weekDays[weekdayIndex]);
                  if (assignedWorkDays.get(weekdayDateKey)?.has(employee.id)) {
                    moveEmployeeBetweenDays(
                      employee,
                      weekdayIndex,
                      weekdayDateKey,
                      understaffedDayIndex,
                      understaffedDateKey,
                      filledPositions,
                      assignedWorkDays,
                      workShifts,
                      daysWithExtraStaff
                    );
                    addedToWeekend = true;
                    console.log(`Moved ${employee.name} from weekday ${weekdayIndex} to weekend day ${understaffedDayIndex}`);
                    break;
                  }
                }
              }
            } 
            // If not at capacity or wants to work 6 days, directly add
            else if (assignedDaysCount < employee.workingDaysAWeek || 
                    (employee.wantsToWorkSixDays && assignedDaysCount < 6)) {
              addEmployeeToDay(
                employee,
                understaffedDayIndex,
                understaffedDateKey,
                filledPositions,
                assignedWorkDays,
                workShifts,
                employeesScheduledForExtraDays
              );
              addedToWeekend = true;
              console.log(`Added ${employee.name} to weekend day ${understaffedDayIndex}`);
            }
            
            if (addedToWeekend) {
              remainingNeeded--;
              if (remainingNeeded <= 0) break;
            }
          }
        }
      }
    }
    
    // If we still need more employees (especially for weekend days), try from overstaffed days
    if (remainingNeeded > 0) {
      console.log(`Still need ${remainingNeeded} more employees for day ${understaffedDayIndex}`);
      
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
          
          // For weekend days with critical shortages, use more aggressive approach
          if (isWeekendDay && !canAssign) {
            // For Saturday specifically, be even more aggressive
            const isSaturday = understaffedDayIndex === 5;
            const severeShortage = (isSaturday && shortage > 0) || 
                                  (shortage > (requiredEmployees[understaffedDayIndex] || 0) * 0.2);
            
            if (severeShortage && !hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) {
              // For flexible employees, always consider for weekend
              if (employee.isWorkingDaysFlexible) {
                canAssign = true;
                console.log(`Aggressively scheduling flexible employee ${employee.name} for weekend day ${understaffedDayIndex}`);
              } 
              // For 6-day employees not at max, also consider
              else if (employee.wantsToWorkSixDays && assignedDaysCount < 6) {
                canAssign = true;
                console.log(`Scheduling 6-day employee ${employee.name} for weekend day ${understaffedDayIndex}`);
              }
            }
          }
          
          if (!canAssign) {
            continue;
          }
          
          // Determine if employee would exceed standard days
          const standardWorkingDays = employee.workingDaysAWeek;
          const wouldExceedStandard = assignedDaysCount >= standardWorkingDays;
          
          // For weekend days, if employee already at standard days, prefer moving
          if (isWeekendDay && wouldExceedStandard && !employee.wantsToWorkSixDays) {
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
            console.log(`Moved ${employee.name} from day ${overstaffedDayIndex} to weekend day ${understaffedDayIndex}`);
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
            console.log(`Added extra day for ${employee.name} on weekend day ${understaffedDayIndex}`);
          }
          
          // If we've addressed the shortage for this day, break out
          if (remainingNeeded <= 0) break;
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
