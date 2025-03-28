
import { Employee } from "@/types/employee";

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
