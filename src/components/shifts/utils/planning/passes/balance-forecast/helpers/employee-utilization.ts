
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

/**
 * Check if an employee is available for a weekend day assignment
 * This is more permissive for weekend days to improve weekend coverage
 */
export function isAvailableForWeekendDay(
  employee: Employee,
  weekendDayIndex: number, // 5 for Saturday, 6 for Sunday
  assignedDaysCount: number,
  isTemporarilyFlexible: (employeeId: string) => boolean
): boolean {
  // Skip employees who are already working more than their required days
  if (assignedDaysCount > employee.workingDaysAWeek) {
    // If they want to work 6 days we might still consider them
    if (!(employee.wantsToWorkSixDays && assignedDaysCount <= 6)) {
      return false;
    }
  }
  
  // Special handling for Saturday (index 5)
  if (weekendDayIndex === 5) {
    // Be more permissive for employees with flexible schedules
    if (employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)) {
      return true;
    }
    
    // Check if they already have Saturday in their preferred days
    const hasSaturdayPreference = employee.preferredWorkingDays.includes("Sa");
    if (hasSaturdayPreference) {
      return true;
    }
    
    // For employees willing to work 6 days who aren't at their limit yet
    if (employee.wantsToWorkSixDays && assignedDaysCount < 6) {
      return true;
    }
  }
  
  return false;
}

/**
 * Prioritize employees for weekend assignment based on various factors
 */
export function prioritizeForWeekendAssignment(
  employees: Employee[],
  assignedWorkDays: Map<string, Set<string>>,
  employeeAssignments: Record<string, number>,
  formatDateKey: (date: Date) => string,
  weekDays: Date[]
): Employee[] {
  // Clone the employees array to avoid modifying the original
  const prioritized = [...employees];
  
  // Calculate metrics for each employee
  const employeeMetrics = prioritized.map(employee => {
    const assigned = employeeAssignments[employee.id] || 0;
    const workingDaysRemaining = employee.workingDaysAWeek - assigned;
    const hasSaturdayPreference = employee.preferredWorkingDays.includes("Sa");
    const isFlexible = employee.isWorkingDaysFlexible;
    const wantsSixDays = employee.wantsToWorkSixDays;
    
    // Count how many weekday assignments they already have
    let weekdayAssignments = 0;
    weekDays.slice(0, 5).forEach((day, index) => {
      const dateKey = formatDateKey(day);
      if (assignedWorkDays.get(dateKey)?.has(employee.id)) {
        weekdayAssignments++;
      }
    });
    
    return {
      employee,
      workingDaysRemaining,
      hasSaturdayPreference,
      isFlexible,
      wantsSixDays,
      weekdayAssignments,
      // Calculate a score for sorting (higher = higher priority)
      priorityScore: 
        (workingDaysRemaining * 5) + // Prioritize by days still to be assigned
        (hasSaturdayPreference ? 10 : 0) + // Big bonus for Saturday preference
        (isFlexible ? 3 : 0) + // Smaller bonus for general flexibility
        (wantsSixDays ? 5 : 0) + // Good bonus for wanting 6 days
        (weekdayAssignments) // Slight bonus for each weekday already assigned
    };
  });
  
  // Sort by priority score (highest first)
  employeeMetrics.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Return just the employee objects in the new order
  return employeeMetrics.map(m => m.employee);
}
