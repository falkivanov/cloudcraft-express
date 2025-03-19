
import { ShiftType } from "../shift-utils";
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";

export interface PlanningParams {
  employees: Employee[];
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  formatDateKey: (date: Date) => string;
  planningMode?: "forecast" | "maximum";
  existingShifts?: Map<string, ShiftAssignment>;
}

export interface ShiftPlan {
  employeeId: string;
  date: string;
  shiftType: ShiftType;
}

export interface PlanningResult {
  workShifts: ShiftPlan[];
  freeShifts: ShiftPlan[];
}
