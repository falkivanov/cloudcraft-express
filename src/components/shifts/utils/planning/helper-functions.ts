
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ShiftType } from "../shift-utils";
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";

// Returns day of week abbreviation (Mo, Di, etc.)
export const getDayAbbreviation = (date: Date): string => {
  return format(date, "EEEEEE", { locale: de });
};

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

// Checks if employee has a special shift (Termin, Urlaub, Krank) on a given day
export const hasSpecialShift = (
  employeeId: string,
  date: string,
  existingShifts?: Map<string, ShiftAssignment>
): ShiftType => {
  if (!existingShifts) return null;
  
  const key = `${employeeId}-${date}`;
  const shift = existingShifts.get(key);
  
  if (shift && (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank")) {
    return shift.shiftType;
  }
  
  return null;
};
