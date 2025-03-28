
import { Employee } from "@/types/employee";

/**
 * Calculates total possible assignments based on employee working days
 */
export function calculatePossibleAssignments(employees: Employee[]): number {
  return employees.reduce((total, employee) => {
    // Count standard days (5 days for full-time)
    let assignableDays = employee.workingDaysAWeek;
    
    // Add an extra day for employees willing to work 6 days if needed
    if (employee.wantsToWorkSixDays && employee.workingDaysAWeek === 5) {
      assignableDays += 1;
    }
    
    return total + assignableDays;
  }, 0);
}

/**
 * Identifies employees who are not working their full schedule
 */
export function identifyUnderutilizedEmployees(
  employees: Employee[],
  employeeAssignments: Record<string, number>
): Employee[] {
  return employees.filter(employee => {
    const assigned = employeeAssignments[employee.id] || 0;
    return assigned < employee.workingDaysAWeek;
  });
}
