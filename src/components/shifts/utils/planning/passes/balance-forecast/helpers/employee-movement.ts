
import { Employee } from "@/types/employee";
import { ShiftPlan } from "../../../types";

/**
 * Moves an employee from one day to another
 */
export function moveEmployeeBetweenDays(
  employee: Employee,
  overstaffedDayIndex: number,
  overstaffedDateKey: string,
  understaffedDayIndex: number,
  understaffedDateKey: string,
  filledPositions: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  workShifts: ShiftPlan[],
  daysWithExtraStaff: { dayIndex: number, excess: number }[]
): void {
  // Remove from overstaffed day
  const overstaffedDayEmployees = assignedWorkDays.get(overstaffedDateKey);
  if (overstaffedDayEmployees) {
    overstaffedDayEmployees.delete(employee.id);
  }
  
  // Decrement filled positions for overstaffed day
  filledPositions[overstaffedDayIndex]--;
  
  // Find and remove the work shift
  const workShiftIndex = workShifts.findIndex(
    shift => shift.employeeId === employee.id && shift.date === overstaffedDateKey
  );
  
  if (workShiftIndex !== -1) {
    workShifts.splice(workShiftIndex, 1);
  }
  
  // Add to understaffed day
  const understaffedDayEmployees = assignedWorkDays.get(understaffedDateKey);
  if (understaffedDayEmployees) {
    understaffedDayEmployees.add(employee.id);
  }
  
  // Add new work shift for understaffed day
  workShifts.push({
    employeeId: employee.id,
    date: understaffedDateKey,
    shiftType: "Arbeit"
  });
  
  // Increment filled positions for understaffed day
  filledPositions[understaffedDayIndex]++;
  
  // Update the excess for the overstaffed day
  for (const day of daysWithExtraStaff) {
    if (day.dayIndex === overstaffedDayIndex) {
      day.excess--;
      break;
    }
  }
}
