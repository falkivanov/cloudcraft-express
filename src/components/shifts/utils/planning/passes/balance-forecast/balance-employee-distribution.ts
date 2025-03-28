
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
  
  // Log total staffing imbalance
  const totalOverstaffed = overfilledDays.reduce((sum, day) => sum + day.excess, 0);
  const totalUnderstaffed = underfilledDays.reduce((sum, day) => sum + day.shortage, 0);
  console.log(`Staffing imbalance: ${totalOverstaffed} excess vs ${totalUnderstaffed} shortage`);
  
  console.log(`Underfilled days: ${underfilledDays.map(d => `Day ${d.dayIndex} (shortage: ${d.shortage})`).join(', ')}`);
  console.log(`Overfilled days: ${overfilledDays.map(d => `Day ${d.dayIndex} (excess: ${d.excess})`).join(', ')}`);
  
  // EXTREME PRIORITY: Give weekend days 5x priority (increased from 3x)
  // Prioritize weekend staffing first - give weekend days much higher priority
  const weekendDays = underfilledDays
    .filter(d => d.dayIndex >= 5)
    .map(day => ({...day, shortage: day.shortage * 5})); // Quintuple the perceived shortage for weekends
    
  const weekdayDays = underfilledDays.filter(d => d.dayIndex < 5);
  
  if (weekendDays.length > 0) {
    console.log(`Prioritizing ${weekendDays.length} weekend days for balancing with EXTREME PRIORITY`);
    console.log(`Weekend days after priority boost: ${weekendDays.map(d => `Day ${d.dayIndex} (boosted shortage: ${d.shortage})`).join(', ')}`);
  }
  
  if (underutilizedEmployees && underutilizedEmployees.length > 0) {
    console.log(`Prioritizing ${underutilizedEmployees.length} underutilized employees for rebalancing`);
  }
  
  // Sort underfilled days to process weekends first, then by severity of understaffing
  const prioritizedUnderfilledDays = [
    ...weekendDays.sort((a, b) => b.shortage - a.shortage),  // Weekend days first, most understaffed first
    ...weekdayDays.sort((a, b) => b.shortage - a.shortage)   // Then weekdays, most understaffed first
  ];
  
  // Process each underfilled day with the prioritized order
  processUnderfilledDays(
    prioritizedUnderfilledDays,
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
  
  // Log final staffing after balancing
  console.log("Staffing after balancing:");
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    const ratio = required > 0 ? (filled / required) * 100 : 100;
    console.log(`Day ${dayIndex}: ${filled}/${required} (${ratio.toFixed(1)}%)`);
  });
}
