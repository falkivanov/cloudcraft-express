
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";

/**
 * Determines if an employee can be assigned to a specific day
 */
export function canAssignEmployeeToDay(
  employee: Employee,
  day: Date,
  dateKey: string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  // Check if the employee is temporarily flexible or if the day is a preferred day
  const dayOfWeek = day.getDay();
  const isFlexible = isTemporarilyFlexible(employee.id) || employee.preferredWorkingDays.includes(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek]);
  
  // Check if the employee is already assigned to work on this day
  if (assignedWorkDays.get(dateKey)?.has(employee.id)) {
    return false;
  }
  
  // Check if the employee has a special shift (Termin, Urlaub, Krank) on this day
  if (existingShifts) {
    const shiftKey = `${employee.id}-${dateKey}`;
    const shift = existingShifts.get(shiftKey);
    if (shift && (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank")) {
      return false;
    }
  }
  
  // If none of the above conditions are met, the employee can be assigned to the day
  return isFlexible;
}

/**
 * Adds an employee to a specific day and updates all tracking variables
 */
export function addEmployeeToDay(
  employee: Employee,
  dayIndex: number,
  dateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts?: ShiftPlan[],
  employeesScheduledForExtraDays?: Set<string>
): void {
  // Add employee to the assigned work days map
  let dateEmployees = assignedWorkDays.get(dateKey);
  if (!dateEmployees) {
    dateEmployees = new Set<string>();
    assignedWorkDays.set(dateKey, dateEmployees);
  }
  dateEmployees.add(employee.id);
  
  // Increment the filled positions counter for the day
  filledPositions[dayIndex]++;
  
  // Add the shift to the work shifts array
  if (workShifts) {
    workShifts.push({
      employeeId: employee.id,
      date: dateKey,
      shiftType: "Arbeit"
    });
  }
  
  // Optionally track that this employee has been scheduled for an extra day
  if (employeesScheduledForExtraDays) {
    employeesScheduledForExtraDays.add(employee.id);
  }
  
  console.log(`Assigned employee ${employee.name} to day ${dayIndex}`);
}

/**
 * Checks if an employee should be considered for an extra work day
 */
export function shouldConsiderForExtraDay(
  employee: Employee,
  assignedCount: number
): boolean {
  // Consider for extra day if they want to work six days and haven't reached that limit
  return employee.wantsToWorkSixDays && assignedCount < 6;
}

/**
 * Finds available underutilized employees that can be assigned to a day
 */
export function findAvailableUnderutilizedEmployees(
  underutilizedEmployees: Employee[] | undefined,
  day: Date,
  dateKey: string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): Employee[] {
  if (!underutilizedEmployees || underutilizedEmployees.length === 0) {
    return [];
  }
  
  return underutilizedEmployees.filter(employee => 
    canAssignEmployeeToDay(
      employee,
      day,
      dateKey,
      isTemporarilyFlexible,
      assignedWorkDays,
      existingShifts
    )
  );
}

/**
 * Assigns an underutilized employee to a specific day
 */
export function assignUnderutilizedEmployeeToDay(
  employee: Employee,
  dayIndex: number,
  dateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  employeeAssignments: Record<string, number>,
  workShifts?: ShiftPlan[]
): void {
  // Add employee to the day
  addEmployeeToDay(
    employee,
    dayIndex,
    dateKey,
    filledPositions,
    assignedWorkDays,
    workShifts
  );
  
  // Update employee assignment count
  employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
  
  console.log(`Assigned underutilized employee ${employee.name} to day ${dayIndex}`);
}

/**
 * Prioritizes weekend days in employee assignment
 */
export function prioritizeWeekendStaffing(
  weekendDayIndex: number,
  weekendDateKey: string,
  weekendDay: Date,
  requiredEmployees: Record<number, number>,
  filledPositions: Record<number, number>,
  weekDays: Date[],
  sortedEmployees: Employee[],
  assignedWorkDays: Map<string, Set<string>>,
  employeeAssignments: Record<string, number>,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[]
): void {
  // Only apply to Saturday (index 5) and Sunday (index 6)
  if (weekendDayIndex < 5) return;
  
  const shortage = Math.max(0, (requiredEmployees[weekendDayIndex] || 0) - filledPositions[weekendDayIndex]);
  if (shortage <= 0) return;
  
  console.log(`Prioritizing weekend staffing for day ${weekendDayIndex} (${weekendDay.toDateString()}), shortage: ${shortage}`);
  
  // First, look for employees who are working under their target days
  const underutilizedEmployees = sortedEmployees.filter(employee => {
    const assignedCount = employeeAssignments[employee.id] || 0;
    return assignedCount < employee.workingDaysAWeek;
  });
  
  for (const employee of underutilizedEmployees) {
    if (canAssignEmployeeToDay(
      employee, 
      weekendDay, 
      weekendDateKey, 
      isTemporarilyFlexible, 
      assignedWorkDays, 
      existingShifts
    )) {
      addEmployeeToDay(
        employee,
        weekendDayIndex,
        weekendDateKey,
        filledPositions,
        assignedWorkDays,
        workShifts
      );
      
      employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
      console.log(`Added underutilized employee ${employee.name} to weekend day ${weekendDayIndex}`);
      
      if (filledPositions[weekendDayIndex] >= (requiredEmployees[weekendDayIndex] || 0)) {
        break;
      }
    }
  }
  
  // If still understaffed, try to move employees from overstaffed weekdays
  if (filledPositions[weekendDayIndex] < (requiredEmployees[weekendDayIndex] || 0)) {
    // Find overstaffed weekdays
    const overstaffedWeekdays = weekDays
      .slice(0, 5) // Monday to Friday
      .map((day, idx) => ({
        dayIndex: idx,
        day,
        dateKey: formatDateKey(day),
        excess: filledPositions[idx] - (requiredEmployees[idx] || 0)
      }))
      .filter(d => d.excess > 0)
      .sort((a, b) => b.excess - a.excess); // Sort by most overstaffed first
    
    if (overstaffedWeekdays.length > 0) {
      console.log(`Found ${overstaffedWeekdays.length} overstaffed weekdays to pull employees from`);
      
      // For each overstaffed weekday, try to move employees to the weekend
      for (const { dayIndex: weekdayIndex, dateKey: weekdayDateKey } of overstaffedWeekdays) {
        // Get employees working on this weekday
        const employeesOnWeekday = Array.from(assignedWorkDays.get(weekdayDateKey) || [])
          .map(id => sortedEmployees.find(e => e.id === id))
          .filter(e => e !== undefined) as Employee[];
        
        // Prioritize employees who are flexible or specifically available for weekends
        const prioritizedEmployees = employeesOnWeekday.sort((a, b) => {
          // Prioritize flexible employees
          if (a.isWorkingDaysFlexible !== b.isWorkingDaysFlexible) {
            return a.isWorkingDaysFlexible ? -1 : 1;
          }
          
          // Then prioritize those who want to work 6 days
          if (a.wantsToWorkSixDays !== b.wantsToWorkSixDays) {
            return a.wantsToWorkSixDays ? -1 : 1;
          }
          
          // Then prioritize those who are assigned to more days than their minimum
          const aExcess = (employeeAssignments[a.id] || 0) - a.workingDaysAWeek;
          const bExcess = (employeeAssignments[b.id] || 0) - b.workingDaysAWeek;
          return bExcess - aExcess;
        });
        
        // Try to move each employee
        for (const employee of prioritizedEmployees) {
          if (canAssignEmployeeToDay(
            employee, 
            weekendDay, 
            weekendDateKey, 
            isTemporarilyFlexible, 
            assignedWorkDays, 
            existingShifts
          )) {
            // Check if moving this employee would cause a staffing shortage on the weekday
            if (filledPositions[weekdayIndex] - 1 >= (requiredEmployees[weekdayIndex] || 0)) {
              // Remove from weekday
              const weekdayEmployees = assignedWorkDays.get(weekdayDateKey);
              if (weekdayEmployees) {
                weekdayEmployees.delete(employee.id);
              }
              filledPositions[weekdayIndex]--;
              
              // Update work shifts
              if (workShifts) {
                const shiftIndex = workShifts.findIndex(s => 
                  s.employeeId === employee.id && s.date === weekdayDateKey);
                if (shiftIndex !== -1) {
                  workShifts.splice(shiftIndex, 1);
                }
              }
              
              // Add to weekend
              addEmployeeToDay(
                employee,
                weekendDayIndex,
                weekendDateKey,
                filledPositions,
                assignedWorkDays,
                workShifts
              );
              
              console.log(`Moved employee ${employee.name} from weekday ${weekdayIndex} to weekend day ${weekendDayIndex}`);
              
              // Check if weekend is now sufficiently staffed
              if (filledPositions[weekendDayIndex] >= (requiredEmployees[weekendDayIndex] || 0)) {
                return;
              }
            }
          }
        }
      }
    }
  }
}

// Helper function to format date key (since this is used internally)
function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
