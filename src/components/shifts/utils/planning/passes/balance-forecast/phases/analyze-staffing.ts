
import { StaffingImbalance } from "../types";
import { Employee } from "@/types/employee";
import { 
  identifyStaffingImbalances, 
  identifyDaysWithExtraStaff,
  identifyCriticalUnderfilledDays
} from "../helpers/staffing-imbalance";
import { calculatePossibleAssignments } from "../helpers/employee-utilization";

/**
 * Phase 1: Analyze staffing situation and identify imbalances
 */
export function analyzeStaffing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
): {
  staffingData: StaffingImbalance,
  totalPossibleAssignments: number,
  criticalUnderfilledDays: { dayIndex: number, shortage: number }[]
} {
  // Identify staffing imbalances
  const staffingData = identifyStaffingImbalances(
    weekDays, filledPositions, requiredEmployees
  );
  
  // Calculate total possible assignments
  const totalPossibleAssignments = calculatePossibleAssignments(sortedEmployees);
  
  // Log staffing situation for debugging
  console.log(`Total required: ${staffingData.totalRequired}, Total possible: ${totalPossibleAssignments}`);
  console.log(`Overfilled days: ${staffingData.overfilledDays.length}, Underfilled days: ${staffingData.underfilledDays.length}`);
  
  // Find all critical underfilled days across the whole week
  const criticalUnderfilledDays = identifyCriticalUnderfilledDays(
    weekDays, filledPositions, requiredEmployees
  );
  
  return {
    staffingData,
    totalPossibleAssignments,
    criticalUnderfilledDays
  };
}

/**
 * Identifies days that are good candidates for providing staff to understaffed days
 */
export function identifyStaffSources(
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>
) {
  return identifyDaysWithExtraStaff(weekDays, filledPositions, requiredEmployees);
}
