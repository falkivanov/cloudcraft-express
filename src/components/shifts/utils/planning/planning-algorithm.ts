
import { PlanningParams, PlanningResult } from "./types";
import { sortEmployeesByPriority } from "./employee-sorting";
import { initializePlanningTrackers } from "./tracking-initialization";
import { 
  runNonFlexibleEmployeesPass, 
  runPreferredDaysPass, 
  runMaximumModePass, 
  setFreeStatusForAvailableEmployees 
} from "./passes";

// Auto-assigns shifts based on employee preferences and requirements
export const createAutomaticPlan = ({
  employees,
  weekDays,
  requiredEmployees,
  isTemporarilyFlexible,
  formatDateKey,
  planningMode = "forecast",
  existingShifts
}: PlanningParams): PlanningResult => {
  // Initialize planning trackers
  const {
    workShifts,
    freeShifts,
    assignedWorkDays,
    employeeAssignments,
    filledPositions
  } = initializePlanningTrackers(employees, weekDays, formatDateKey, existingShifts);
  
  // Sort employees by priority
  const sortedEmployees = sortEmployeesByPriority(employees);
  
  // Execute the planning passes
  runNonFlexibleEmployeesPass(
    sortedEmployees, weekDays, filledPositions, employeeAssignments, 
    requiredEmployees, formatDateKey, isTemporarilyFlexible, assignedWorkDays, 
    existingShifts, workShifts, planningMode
  );
  
  runPreferredDaysPass(
    sortedEmployees, weekDays, filledPositions, employeeAssignments, 
    requiredEmployees, formatDateKey, isTemporarilyFlexible, assignedWorkDays, 
    existingShifts, workShifts, planningMode
  );
  
  // Only in maximum mode, assign flexible employees to non-preferred days
  if (planningMode === "maximum") {
    runMaximumModePass(
      sortedEmployees, weekDays, filledPositions, employeeAssignments, 
      formatDateKey, isTemporarilyFlexible, assignedWorkDays, 
      existingShifts, workShifts
    );
  }
  
  // Set "Frei" status for all available employees who weren't assigned to work
  setFreeStatusForAvailableEmployees(
    sortedEmployees, weekDays, formatDateKey, isTemporarilyFlexible, 
    assignedWorkDays, existingShifts, freeShifts
  );
  
  // Return both work shifts and free shifts
  return {
    workShifts,
    freeShifts
  };
};
