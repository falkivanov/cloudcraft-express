import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";
import { addEmployeeToDay, canAssignEmployeeToDay } from "./employee-assignment";
import { moveEmployeeBetweenDays } from "./employee-reassignment";
import { isAvailableForWeekendDay } from "./employee-utilization";
import { hasSpecialShift, getAssignedDaysCount, createEmployeeAssignmentsMap } from "./weekend-balancing";
import { shouldConsiderForExtraDay } from "./employee-assignment";

/**
 * Prioritizes employees for weekend assignment based on various criteria
 */
export function prioritizeForWeekendAssignment(
  sortedEmployees: Employee[],
  assignedWorkDays: Map<string, Set<string>>,
  employeeAssignments: Record<string, number>,
  formatDateKey: (date: Date) => string,
  weekDays: Date[]
): Employee[] {
  // Prioritize employees for weekend assignments based on several factors:
  // 1. Employees who have fewer assigned days compared to their workingDaysAWeek
  // 2. Employees who are flexible in their working days
  // 3. Employees who want to work six days
  
  return sortedEmployees
    .filter(employee => {
      const assignedCount = employeeAssignments[employee.id] || 0;
      return assignedCount < employee.workingDaysAWeek || 
             (employee.wantsToWorkSixDays && assignedCount < 6);
    })
    .sort((a, b) => {
      // Prioritize employees who have more days to fill
      const aDaysLeft = a.workingDaysAWeek - (employeeAssignments[a.id] || 0);
      const bDaysLeft = b.workingDaysAWeek - (employeeAssignments[b.id] || 0);
      
      if (aDaysLeft !== bDaysLeft) return bDaysLeft - aDaysLeft;
      
      // Then prioritize flexible employees
      if (a.isWorkingDaysFlexible !== b.isWorkingDaysFlexible) {
        return a.isWorkingDaysFlexible ? -1 : 1;
      }
      
      // Then employees who want to work six days
      if (a.wantsToWorkSixDays !== b.wantsToWorkSixDays) {
        return a.wantsToWorkSixDays ? -1 : 1;
      }
      
      return 0;
    });
}

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
  
  // First, try to find ANY employee who can work this weekend day
  // Even if they're already at their target days
  for (const employee of sortedEmployees) {
    if (stillNeeded <= 0) break;
    
    // Skip if already assigned
    if (assignedWorkDays.get(understaffedDateKey)?.has(employee.id)) continue;
    
    // Skip if has special shift
    const understaffedDay = weekDays[understaffedDayIndex];
    if (hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) continue;
    
    // Check if employee is available for this day (weekend specific)
    const dayOfWeek = understaffedDay.getDay();
    const dayName = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek];
    
    // EXTREMELY AGGRESSIVE: If this is a weekend day and employee is flexible,
    // schedule them even beyond their normal limits
    const isFlexible = isTemporarilyFlexible(employee.id) || employee.isWorkingDaysFlexible;
    const canWorkOnWeekend = employee.preferredWorkingDays.includes(dayName) || isFlexible;
    
    if (canWorkOnWeekend) {
      const assignedDaysCount = getAssignedDaysCount(employee.id, weekDays, assignedWorkDays, formatDateKey);
      
      // Allow scheduling 6 days for anyone who's flexible on weekend days,
      // not just those who explicitly want 6 days
      const canTakeExtraDay = (employee.wantsToWorkSixDays || isFlexible) && assignedDaysCount < 6;
      
      if (canTakeExtraDay) {
        // Add to weekend directly without removing from weekday
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
        
        console.log(`EXTREME PRIORITY: Added extra weekend day for ${employee.name} (day ${understaffedDayIndex})`);
        stillNeeded--;
        
        if (stillNeeded <= 0) break;
      }
    }
  }
  
  // For each overstaffed day, try to move employees to the weekend
  if (stillNeeded > 0) {
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
        
        // For weekend days, use extremely aggressive criteria - almost any employee is a candidate
        const minWeekdayStaffing = Math.floor((requiredEmployees[overstaffedDayIndex] || 0) * 0.7);
        const isCriticalWeekendStaffing = understaffedDayIndex >= 5 && 
                                          (filledPositions[understaffedDayIndex] < requiredEmployees[understaffedDayIndex] * 0.8);
        
        // If this is a critical weekend staffing situation, be extremely aggressive
        if (isCriticalWeekendStaffing && filledPositions[overstaffedDayIndex] - 1 >= minWeekdayStaffing) {
          // Try to move the employee
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
          
          console.log(`EXTREME PRIORITY: Moved ${employee.name} from day ${overstaffedDayIndex} to weekend day ${understaffedDayIndex}`);
          stillNeeded--;
        }
      }
    }
  }
  
  return stillNeeded;
}
