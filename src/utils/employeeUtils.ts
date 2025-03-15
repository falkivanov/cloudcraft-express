
import { Employee } from "@/types/employee";

/**
 * Calculates the Full-Time Equivalent (FTE) for employees
 * @param employees List of employees
 * @param workingDaysForFullTime Number of working days considered as full time (default: 5)
 * @returns The calculated FTE value
 */
export const calculateFTE = (
  employees: Employee[],
  workingDaysForFullTime: number = 5
): number => {
  if (!employees.length) return 0;
  
  // Sum up the FTE contribution of each employee
  const totalFTE = employees.reduce((sum, employee) => {
    // Skip inactive employees
    if (employee.endDate !== null) return sum;
    
    // Calculate individual FTE (capped at 1.0)
    const individualFTE = Math.min(employee.workingDaysAWeek / workingDaysForFullTime, 1);
    return sum + individualFTE;
  }, 0);
  
  return Number(totalFTE.toFixed(1));
};

/**
 * Gets a count of employees by status
 * @param employees List of employees
 * @returns Object with counts for active and inactive employees
 */
export const getEmployeeStatusCounts = (employees: Employee[]) => {
  const result = {
    active: 0,
    inactive: 0
  };

  employees.forEach(employee => {
    if (employee.endDate !== null) {
      result.inactive++;
    } else {
      result.active++;
    }
  });

  return result;
};
