
import { Employee } from "@/types/employee";
import { getDayAbbreviation } from "./date-utils";

// Determines if an employee can work on a specific day based on preferences and flexibility
export const canEmployeeWorkOnDay = (
  employee: Employee, 
  day: Date, 
  isTemporarilyFlexible: (employeeId: string) => boolean
): boolean => {
  const dayAbbr = getDayAbbreviation(day);
  return employee.isWorkingDaysFlexible || 
         isTemporarilyFlexible(employee.id) || 
         employee.preferredWorkingDays.includes(dayAbbr);
};
