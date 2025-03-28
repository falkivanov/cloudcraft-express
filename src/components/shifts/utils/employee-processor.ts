
import { Employee } from "@/types/employee";

/**
 * Processes employee data to ensure full-time employees have correct settings
 * (no preferred days and set as flexible)
 */
export const processEmployees = (employees: Employee[]): Employee[] => {
  return employees.map(emp => {
    // For full-time employees (5+ days), clear preferred days and set as flexible
    if (emp.workingDaysAWeek >= 5) {
      return {
        ...emp,
        preferredWorkingDays: [],
        isWorkingDaysFlexible: true
      };
    }
    return emp;
  });
};

/**
 * Filters employees to get only active ones and processes them
 */
export const filterAndProcessEmployees = (employees: Employee[]): Employee[] => {
  return processEmployees(
    employees.filter(emp => emp.status === "Aktiv")
  );
};
