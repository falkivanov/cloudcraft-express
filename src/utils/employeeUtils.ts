
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

/**
 * Gets a count of active employees by working days per week
 * @param employees List of employees
 * @returns Object with counts for each working days value
 */
export const getEmployeesByWorkingDays = (employees: Employee[]) => {
  // Initialize the result object with all possible working days (1-7)
  const result: { [key: number]: number } = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0
  };

  // Count only active employees
  employees.forEach(employee => {
    if (employee.endDate === null && employee.workingDaysAWeek >= 1 && employee.workingDaysAWeek <= 7) {
      result[employee.workingDaysAWeek]++;
    }
  });

  return result;
};
