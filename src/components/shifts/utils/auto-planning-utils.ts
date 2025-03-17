
import { ShiftType } from "./shift-utils";
import { Employee } from "@/types/employee";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PlanningParams {
  employees: Employee[];
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  formatDateKey: (date: Date) => string;
  planningMode?: "forecast" | "maximum";
}

interface ShiftPlan {
  employeeId: string;
  date: string;
  shiftType: ShiftType;
}

// Returns day of week abbreviation (Mo, Di, etc.)
const getDayAbbreviation = (date: Date): string => {
  return format(date, "EEEEEE", { locale: de });
};

// Determines if an employee can work on a specific day based on preferences and flexibility
const canEmployeeWorkOnDay = (
  employee: Employee, 
  day: Date, 
  isTemporarilyFlexible: (employeeId: string) => boolean
): boolean => {
  const dayAbbr = getDayAbbreviation(day);
  return employee.isWorkingDaysFlexible || 
         isTemporarilyFlexible(employee.id) || 
         employee.preferredWorkingDays.includes(dayAbbr);
};

// Auto-assigns shifts based on employee preferences and requirements
export const createAutomaticPlan = ({
  employees,
  weekDays,
  requiredEmployees,
  isTemporarilyFlexible,
  formatDateKey,
  planningMode = "forecast"
}: PlanningParams): ShiftPlan[] => {
  const plan: ShiftPlan[] = [];
  
  // Create a copy of employees to work with and sort by preference:
  // 1. Non-flexible employees first (they have stricter constraints)
  // 2. Employees with fewer preferred days (harder to assign)
  const sortedEmployees = [...employees].sort((a, b) => {
    // Non-flexible employees have priority
    if (!a.isWorkingDaysFlexible && b.isWorkingDaysFlexible) return -1;
    if (a.isWorkingDaysFlexible && !b.isWorkingDaysFlexible) return 1;
    
    // Sort by number of preferred days (fewer days first)
    return a.preferredWorkingDays.length - b.preferredWorkingDays.length;
  });
  
  // Track number of assigned days per employee (to respect workingDaysAWeek)
  const employeeAssignments: Record<string, number> = {};
  sortedEmployees.forEach(employee => {
    employeeAssignments[employee.id] = 0;
  });
  
  // Track number of filled positions per day
  const filledPositions: Record<number, number> = {};
  weekDays.forEach((_, index) => {
    filledPositions[index] = 0;
  });
  
  // First pass: Assign non-flexible employees to their preferred days
  weekDays.forEach((day, dayIndex) => {
    const requiredCount = requiredEmployees[dayIndex] || 0;
    
    // Skip days with no requirements if in forecast mode
    if (planningMode === "forecast" && requiredCount === 0) return;
    
    // Assign non-flexible employees first
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Skip if day is already fully staffed (in forecast mode)
      if (planningMode === "forecast" && filledPositions[dayIndex] >= requiredCount) return;
      
      const dayAbbr = getDayAbbreviation(day);
      
      // For non-flexible employees, only assign on preferred days
      if (!employee.isWorkingDaysFlexible && 
          !isTemporarilyFlexible(employee.id) && 
          employee.preferredWorkingDays.includes(dayAbbr)) {
        
        plan.push({
          employeeId: employee.id,
          date: formatDateKey(day),
          shiftType: "Arbeit"
        });
        
        // Update tracking counters
        employeeAssignments[employee.id]++;
        filledPositions[dayIndex]++;
      }
    });
  });
  
  // Second pass: Fill remaining positions prioritizing preferred days for ALL employees
  // First, assign employees to their preferred days
  weekDays.forEach((day, dayIndex) => {
    const requiredCount = planningMode === "forecast" 
      ? requiredEmployees[dayIndex] || 0 
      : Number.MAX_SAFE_INTEGER;
      
    if (requiredCount <= 0) return;
    
    const dayAbbr = getDayAbbreviation(day);
    
    // For all employees, first try to assign on preferred days
    // This ensures that even flexible employees get their preferred days first
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Skip if day is already fully staffed
      if (filledPositions[dayIndex] >= requiredCount) return;
      
      // Skip non-flexible employees already handled in first pass
      if (!employee.isWorkingDaysFlexible && !isTemporarilyFlexible(employee.id)) return;
      
      // Only assign if it's a preferred day
      if (employee.preferredWorkingDays.includes(dayAbbr)) {
        plan.push({
          employeeId: employee.id,
          date: formatDateKey(day),
          shiftType: "Arbeit"
        });
        
        // Update tracking counters
        employeeAssignments[employee.id]++;
        filledPositions[dayIndex]++;
      }
    });
  });
  
  // Third pass: Only in maximum mode, assign flexible employees to non-preferred days
  // to maximize schedules, but only after all preferred days have been assigned
  if (planningMode === "maximum") {
    weekDays.forEach((day, dayIndex) => {
      const requiredCount = Number.MAX_SAFE_INTEGER; // Try to maximize in this mode
      
      if (filledPositions[dayIndex] >= requiredCount) return;
      
      const dayAbbr = getDayAbbreviation(day);
      
      // Only truly flexible employees can be assigned to non-preferred days
      sortedEmployees.forEach(employee => {
        // Skip if already fully assigned
        if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
        
        // Only assign flexible employees to non-preferred days
        if ((employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)) && 
            !employee.preferredWorkingDays.includes(dayAbbr)) {
          
          plan.push({
            employeeId: employee.id,
            date: formatDateKey(day),
            shiftType: "Arbeit"
          });
          
          // Update tracking counters
          employeeAssignments[employee.id]++;
          filledPositions[dayIndex]++;
        }
      });
    });
  }
  
  // Return the complete assignment plan
  return plan;
};

// Check if automatic planning is possible (all days have forecast values)
export const canAutoPlan = (requiredEmployees: Record<number, number>, dayCount: number): boolean => {
  // Now we can auto-plan even if forecast isn't set
  return true;
};
