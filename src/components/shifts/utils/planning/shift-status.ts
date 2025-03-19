
import { ShiftAssignment } from "@/types/shift";
import { ShiftType } from "../shift-utils";

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
