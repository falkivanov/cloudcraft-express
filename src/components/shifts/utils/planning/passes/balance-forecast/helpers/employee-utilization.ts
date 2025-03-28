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
