
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { processUnderfilledDays } from "./helpers/underfilled-days";

// Helper function to balance employee distribution from overfilled to underfilled days
export function balanceEmployeeDistribution(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  overfilledDays: { dayIndex: number, excess: number }[],
  underfilledDays: { dayIndex: number, shortage: number }[],
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[],
  underutilizedEmployees?: Employee[]
) {
  // Enhanced logging
  console.log("Starting employee distribution balancing");
  console.log(`Underfilled days: ${underfilledDays.map(d => `Day ${d.dayIndex} (shortage: ${d.shortage})`).join(', ')}`);
  console.log(`Overfilled days: ${overfilledDays.map(d => `Day ${d.dayIndex} (excess: ${d.excess})`).join(', ')}`);
  
  if (underutilizedEmployees && underutilizedEmployees.length > 0) {
    console.log(`Prioritizing ${underutilizedEmployees.length} underutilized employees for rebalancing`);
  }
  
  // Process each underfilled day
  processUnderfilledDays(
    underfilledDays,
    weekDays,
    filledPositions,
    requiredEmployees,
    overfilledDays,
    sortedEmployees,
    assignedWorkDays,
    formatDateKey,
    isTemporarilyFlexible,
    employeeAssignments,
    existingShifts,
    workShifts,
    freeShifts,
    underutilizedEmployees
  );
}
