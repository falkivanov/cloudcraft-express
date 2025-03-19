
import { Employee } from "@/types/employee";

// Sorts employees by flexibility and preferred working days count
export function sortEmployeesByPriority(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    // Non-flexible employees have priority
    if (!a.isWorkingDaysFlexible && b.isWorkingDaysFlexible) return -1;
    if (a.isWorkingDaysFlexible && !b.isWorkingDaysFlexible) return 1;
    
    // Sort by number of preferred days (fewer days first)
    return a.preferredWorkingDays.length - b.preferredWorkingDays.length;
  });
}
