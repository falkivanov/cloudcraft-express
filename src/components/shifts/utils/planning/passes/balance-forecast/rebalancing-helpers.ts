
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

/**
 * Determines if an employee should be considered for an extra day assignment
 */
export function shouldConsiderForExtraDay(
  employee: Employee,
  assignedDaysCount: number,
  totalShortage: number,
  totalExcessStaff: number,
  employeesScheduledForExtraDays: Set<string>
): boolean {
  // Only consider adding a 6th day if the employee wants it AND we have critical shortages
  // that exceed our excess staff
  return employee.workingDaysAWeek === 5 && 
         employee.wantsToWorkSixDays && 
         totalShortage > totalExcessStaff && 
         !employeesScheduledForExtraDays.has(employee.id);
}

/**
 * Moves an employee from one day to another
 */
export function moveEmployeeBetweenDays(
  employee: Employee,
  overstaffedDayIndex: number,
  overstaffedDateKey: string,
  understaffedDayIndex: number,
  understaffedDateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[],
  daysWithExtraStaff: { dayIndex: number, excess: number }[]
): void {
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
  
  // Update the excess for the overstaffed day
  for (const day of daysWithExtraStaff) {
    if (day.dayIndex === overstaffedDayIndex) {
      day.excess--;
      break;
    }
  }
}

/**
 * Adds an employee to a day without removing them from another day
 */
export function addEmployeeToDay(
  employee: Employee,
  understaffedDayIndex: number,
  understaffedDateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[],
  employeesScheduledForExtraDays: Set<string>
): void {
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
}

/**
 * Get employees available to be moved from an overstaffed day, sorted by priority
 */
export function getSortedEmployeesOnOverstaffedDay(
  employeesOnOverstaffedDay: Set<string>,
  sortedEmployees: Employee[],
  weekDays: Date[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string
): { employee: Employee, assignedDaysCount: number }[] {
  if (employeesOnOverstaffedDay.size === 0) return [];
  
  // Convert to array for iteration
  const employeeIds = Array.from(employeesOnOverstaffedDay);
  
  // Collect employees with their assigned days count
  const employeesWithInfo: { employee: Employee, assignedDaysCount: number }[] = [];
  
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
  
  return employeesWithInfo;
}

/**
 * Calculate the total staffing imbalance across all days
 */
export function calculateStaffingImbalance(
  daysWithExtraStaff: { dayIndex: number, excess: number }[],
  criticalUnderfilledDays: { dayIndex: number, shortage: number }[]
): { totalExcessStaff: number, totalShortage: number } {
  const totalExcessStaff = daysWithExtraStaff.reduce((sum, day) => sum + day.excess, 0);
  const totalShortage = criticalUnderfilledDays.reduce((sum, day) => sum + day.shortage, 0);
  
  return { totalExcessStaff, totalShortage };
}

/**
 * Check if an employee can be assigned to a specific day
 */
export function canAssignEmployeeToDay(
  employee: Employee,
  understaffedDay: Date,
  understaffedDateKey: string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>
): boolean {
  // Skip if this employee is already assigned to the understaffed day
  if (assignedWorkDays.get(understaffedDateKey)?.has(employee.id)) return false;
  
  // Skip if employee has a special shift on understaffed day
  if (hasSpecialShift(employee.id, understaffedDateKey, existingShifts)) return false;
  
  // Check if employee can work on the understaffed day
  if (!canEmployeeWorkOnDay(employee, understaffedDay, isTemporarilyFlexible)) return false;
  
  return true;
}
