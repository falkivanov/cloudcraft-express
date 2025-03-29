
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";

// Common input parameters for balance functions
export interface BalanceParams {
  sortedEmployees: Employee[];
  weekDays: Date[];
  filledPositions: Record<number, number>;
  requiredEmployees: Record<number, number>;
  assignedWorkDays: Map<string, Set<string>>;
  formatDateKey: (date: Date) => string;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  employeeAssignments: Record<string, number>;
  existingShifts?: Map<string, ShiftAssignment>;
  workShifts?: ShiftPlan[];
  freeShifts?: ShiftPlan[];
}

// Results from identifying staffing imbalances
export interface StaffingImbalance {
  overfilledDays: { dayIndex: number, excess: number }[];
  underfilledDays: { dayIndex: number, shortage: number }[];
  totalRequired: number;
  totalFilled: number;
}

// Interface for critical underfilled days
export interface CriticalDay {
  dayIndex: number; 
  shortage: number;
  isCritical?: boolean;
}
