
import { Employee } from "@/types/employee";

/**
 * Logs final staffing statistics for verification
 */
export function logFinalStaffingStats(
  sortedEmployees: Employee[],
  employeeAssignments: Record<string, number>,
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): void {
  // Count how many employees are scheduled for fewer than their working days
  let underScheduledCount = 0;
  let overScheduledCount = 0;
  
  sortedEmployees.forEach(employee => {
    const assigned = employeeAssignments[employee.id] || 0;
    const expected = employee.workingDaysAWeek;
    
    if (assigned < expected) {
      underScheduledCount++;
      console.log(`Employee ${employee.name} is under-scheduled: ${assigned}/${expected} days`);
    } else if (assigned > expected) {
      overScheduledCount++;
      console.log(`Employee ${employee.name} is scheduled for extra days: ${assigned}/${expected}`);
    }
  });
  
  console.log(`Final stats: ${underScheduledCount} employees under-scheduled, ${overScheduledCount} scheduled for extra days`);
  
  // Check if we achieved the required staffing for each day
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled < required) {
      console.log(`Day ${dayIndex} is still understaffed: ${filled}/${required}`);
    } else if (filled > required) {
      console.log(`Day ${dayIndex} is overstaffed: ${filled}/${required} (+${filled - required})`);
    } else if (required > 0) {
      console.log(`Day ${dayIndex} is perfectly staffed: ${filled}/${required}`);
    }
  });
}
