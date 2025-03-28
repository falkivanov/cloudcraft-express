import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";
import { addEmployeeToDay, canAssignEmployeeToDay } from "./employee-assignment";
import { moveEmployeeBetweenDays } from "./employee-reassignment";
import { isAvailableForWeekendDay, prioritizeForWeekendAssignment } from "./employee-utilization";
import { hasSpecialShift, getAssignedDaysCount, createEmployeeAssignmentsMap } from "./weekend-balancing";
import { shouldConsiderForExtraDay } from "./employee-assignment";

/**
 * Handles weekend day staffing with specialized approach
 */
export function balanceWeekendDay(
  understaffedDayIndex: number,
  understaffedDay: Date,
  understaffedDateKey: string,
  shortage: number,
  isWeekendDay: boolean,
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  daysWithExtraStaff: { dayIndex: number, excess: number }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  totalShortage: number,
  totalExcessStaff: number,
  employeesScheduledForExtraDays: Set<string>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
): number {
  // Only proceed with special handling for weekend days
  if (!isWeekendDay) return shortage;
  
  // Create a map of employee assignments
  const employeeAssignments = createEmployeeAssignmentsMap(
    sortedEmployees, weekDays, assignedWorkDays, formatDateKey
  );

  let remainingNeeded = shortage;
  
  // Log weekend day processing
  console.log(`Processing WEEKEND day ${understaffedDayIndex} (${understaffedDay.toDateString()}) with shortage ${shortage}`);
  console.log(`Current staffing: ${filledPositions[understaffedDayIndex]}/${requiredEmployees[understaffedDayIndex] || 0}`);
  
  // Prioritize employees for weekend assignment
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
        for (const { dayIndex: weekdayIndex } of daysWithExtraStaff) {
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
  
  return remainingNeeded;
}

/**
 * Handles aggressive balancing specifically for weekend days
 */
export function aggressiveWeekendBalancing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  daysWithExtraStaff: { dayIndex: number, excess: number }[],
  understaffedDayIndex: number,
  understaffedDateKey: string,
  remainingNeeded: number,
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[]
): number {
  // Only continue if we still need more staff
  if (remainingNeeded <= 0) return 0;
  
  console.log(`Starting aggressive weekend balancing for day ${understaffedDayIndex}. Remaining needed: ${remainingNeeded}`);
  
  // Sort overstaffed days by excess staff
  const sortedOverstaffedDays = [...daysWithExtraStaff]
    .sort((a, b) => b.excess - a.excess);
  
  let stillNeeded = remainingNeeded;
  
  // For each overstaffed day, try to move employees to the weekend
  for (const { dayIndex: overstaffedDayIndex, excess } of sortedOverstaffedDays) {
    if (stillNeeded <= 0) break;
    if (excess <= 0) continue;
    
    const overstaffedDay = weekDays[overstaffedDayIndex];
    const overstaffedDateKey = formatDateKey(overstaffedDay);
    
    // Get all employees on the overstaffed day
    const employeesIds = assignedWorkDays.get(overstaffedDateKey) || new Set<string>();
    
    // Find employees on this day that can potentially work weekends
    for (const employeeId of employeesIds) {
      if (stillNeeded <= 0) break;
      
      const employee = sortedEmployees.find(e => e.id === employeeId);
      if (!employee) continue;
      
      const understaffedDay = weekDays[understaffedDayIndex];
      
      // Check if employee is already assigned to the weekend day
      if (assignedWorkDays.get(understaffedDateKey)?.has(employee.id)) {
        continue;
      }
      
      // Check if employee has a special shift
      if (hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) {
        continue;
      }
      
      // For weekend days, use more aggressive criteria
      const isSaturday = understaffedDayIndex === 5;
      const severeShortage = isSaturday || requiredEmployees[understaffedDayIndex] > 0;
      
      if (severeShortage && (employee.isWorkingDaysFlexible || employee.wantsToWorkSixDays)) {
        console.log(`Aggressively trying to move ${employee.name} to weekend day ${understaffedDayIndex}`);
        
        // Calculate days assigned
        const assignedDaysCount = getAssignedDaysCount(employee.id, weekDays, assignedWorkDays, formatDateKey);
        
        // If they're under their working days or want to work 6 days
        if (assignedDaysCount < employee.workingDaysAWeek || 
            (employee.wantsToWorkSixDays && assignedDaysCount < 6)) {
          // Try to clone, not move (add to weekend without removing from weekday)
          const canAddExtraDay = employee.wantsToWorkSixDays && assignedDaysCount < 6;
          
          if (canAddExtraDay) {
            // Add extra day
            const understaffedDayEmployees = assignedWorkDays.get(understaffedDateKey);
            if (understaffedDayEmployees) {
              understaffedDayEmployees.add(employee.id);
            }
            
            // Add work shift
            if (workShifts) {
              workShifts.push({
                employeeId: employee.id,
                date: understaffedDateKey,
                shiftType: "Arbeit"
              });
            }
            
            // Update filled positions
            filledPositions[understaffedDayIndex]++;
            
            console.log(`Added extra weekend day for ${employee.name} (day ${understaffedDayIndex})`);
            stillNeeded--;
          } 
          // Otherwise try to move them
          else {
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
            console.log(`Moved ${employee.name} from day ${overstaffedDayIndex} to weekend day ${understaffedDayIndex}`);
            stillNeeded--;
          }
          
          if (stillNeeded <= 0) break;
        }
      }
    }
  }
  
  return stillNeeded;
}
