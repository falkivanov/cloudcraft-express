
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../../types";
import { 
  prioritizeDaysForRebalancing,
  findOptimalSourceDays,
  calculateStaffingImbalanceRatio
} from "./employee-movement";
import { aggressiveRebalancing } from "../aggressive-rebalancing";

/**
 * Performs advanced balancing for a significantly imbalanced schedule
 * Prioritizes evening out the distribution when total capacity is insufficient
 */
export function performAdvancedRebalancing(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
): void {
  console.log("Performing advanced rebalancing for significantly imbalanced schedule");
  
  // Calculate overall staffing situation
  let totalRequired = 0;
  let totalFilled = 0;
  
  weekDays.forEach((_, dayIndex) => {
    totalRequired += requiredEmployees[dayIndex] || 0;
    totalFilled += filledPositions[dayIndex];
  });
  
  // If we're globally understaffed, prioritize evening out the distribution
  if (totalFilled < totalRequired) {
    console.log(`Global staffing shortage detected: ${totalFilled}/${totalRequired}`);
    
    // Find the most severely understaffed days first (using ratio-based prioritization)
    const prioritizedDays = prioritizeDaysForRebalancing(
      weekDays, filledPositions, requiredEmployees, formatDateKey
    );
    
    console.log("Days prioritized by staffing imbalance:", 
      prioritizedDays.map(d => `Day ${d.dayIndex}: ${d.filled}/${d.required} (${Math.round(d.imbalance * 100)}%)`));
    
    // Process each understaffed day, starting with the most severely understaffed
    for (const understaffedDay of prioritizedDays) {
      // Find optimal source days to take staff from
      const optimalSources = findOptimalSourceDays(
        weekDays, filledPositions, requiredEmployees, 
        understaffedDay.dayIndex, formatDateKey
      );
      
      console.log(`For day ${understaffedDay.dayIndex}, potential sources:`, 
        optimalSources.map(d => `Day ${d.dayIndex}: ${d.filled}/${d.required} (excess: ${d.excess})`));
      
      // Calculate target staffing to make the imbalance more equitable
      // Instead of trying to fully staff, aim for a balanced understaffing
      for (const sourceDay of optimalSources) {
        // Make progressive improvements without completely depleting source days
        aggressiveRebalancing(
          sortedEmployees, 
          weekDays, 
          filledPositions,
          requiredEmployees,
          [sourceDay], 
          [{ dayIndex: understaffedDay.dayIndex, shortage: 1 }],
          assignedWorkDays,
          formatDateKey,
          isTemporarilyFlexible,
          existingShifts,
          workShifts,
          freeShifts
        );
        
        // Check if we've made sufficient improvement
        const newImbalance = calculateStaffingImbalanceRatio(
          filledPositions[understaffedDay.dayIndex], 
          requiredEmployees[understaffedDay.dayIndex] || 0
        );
        
        // If imbalance is now below 25%, consider it good enough
        if (newImbalance < 0.25) {
          console.log(`Day ${understaffedDay.dayIndex} rebalanced to acceptable level: ${filledPositions[understaffedDay.dayIndex]}/${requiredEmployees[understaffedDay.dayIndex]}`);
          break;
        }
      }
    }
  }
}
