
import { Employee } from "@/types/employee";

/**
 * Calculates total possible assignments based on employee working days
 */
export function calculatePossibleAssignments(sortedEmployees: Employee[]): number {
  let totalPossibleAssignments = 0;
  
  sortedEmployees.forEach(employee => {
    totalPossibleAssignments += employee.workingDaysAWeek;
    
    // Add potential extra day for employees who want to work 6 days
    if (employee.workingDaysAWeek === 5 && employee.wantsToWorkSixDays) {
      totalPossibleAssignments += 1;
    }
  });
  
  return totalPossibleAssignments;
}

/**
 * Identifies employees not working their full required days
 */
export function identifyUnderutilizedEmployees(
  sortedEmployees: Employee[],
  employeeAssignments: Record<string, number>
): Employee[] {
  return sortedEmployees.filter(employee => {
    const assigned = employeeAssignments[employee.id] || 0;
    return assigned < employee.workingDaysAWeek;
  });
}

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
