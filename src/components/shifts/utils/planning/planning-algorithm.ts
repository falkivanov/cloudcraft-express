
import { PlanningParams, PlanningResult } from "./types";
import { sortEmployeesByPriority } from "./employee-sorting";
import { initializePlanningTrackers } from "./tracking-initialization";
import { 
  runNonFlexibleEmployeesPass, 
  runPreferredDaysPass, 
  runMaximumModePass, 
  setFreeStatusForAvailableEmployees,
  runBalanceForecastPass
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
  
  // In Forecast mode, try to balance employee distribution to better match requirements
  // and ensure all employees are assigned their full working days
  if (planningMode === "forecast") {
    runBalanceForecastPass(
      sortedEmployees, weekDays, filledPositions, employeeAssignments,
      requiredEmployees, formatDateKey, isTemporarilyFlexible, assignedWorkDays,
      existingShifts, workShifts, freeShifts
    );
  }
  
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
