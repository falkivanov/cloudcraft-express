
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
  
  // Second pass: Fill remaining positions with respect to preferred days
  weekDays.forEach((day, dayIndex) => {
    // In maximum mode, try to assign everyone up to their capacity
    // In forecast mode, only fill up to the required count
    const requiredCount = planningMode === "forecast" 
      ? requiredEmployees[dayIndex] || 0
      : Number.MAX_SAFE_INTEGER; // In maximum mode, try to assign as many as possible
      
    const remaining = requiredCount - filledPositions[dayIndex];
    
    // Skip if no more positions to fill
    if (remaining <= 0) return;
    
    const dayAbbr = getDayAbbreviation(day);
    
    // First, try to assign flexible employees based on their preferred days
    // This ensures that even flexible employees' preferences are considered
    let eligibleEmployees = sortedEmployees.filter(employee => 
      employeeAssignments[employee.id] < employee.workingDaysAWeek &&
      (employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)) &&
      employee.preferredWorkingDays.includes(dayAbbr)
    );
    
    // Sort by number of assignments (prefer those with fewer assignments first)
    eligibleEmployees.sort((a, b) => 
      employeeAssignments[a.id] - employeeAssignments[b.id]
    );
    
    // Assign preferred employees first
    for (let i = 0; i < remaining && i < eligibleEmployees.length; i++) {
      const employee = eligibleEmployees[i];
      
      plan.push({
        employeeId: employee.id,
        date: formatDateKey(day),
        shiftType: "Arbeit"
      });
      
      // Update tracking counter
      employeeAssignments[employee.id]++;
      filledPositions[dayIndex]++;
    }
    
    // If still positions to fill and in maximum mode, add any flexible employees
    // who haven't reached their max days, regardless of preference
    if (planningMode === "maximum" && filledPositions[dayIndex] < requiredCount) {
      const updatedRemaining = requiredCount - filledPositions[dayIndex];
      
      // Only truly flexible employees can be assigned to non-preferred days
      const remainingEligibleEmployees = sortedEmployees.filter(employee => 
        employeeAssignments[employee.id] < employee.workingDaysAWeek &&
        employee.isWorkingDaysFlexible &&
        !employee.preferredWorkingDays.includes(dayAbbr) // Specifically on non-preferred days
      );
      
      // Sort by number of assignments (prefer those with fewer assignments first)
      remainingEligibleEmployees.sort((a, b) => 
        employeeAssignments[a.id] - employeeAssignments[b.id]
      );
      
      // Assign up to the required number or maximum possible in maximum mode
      for (let i = 0; i < updatedRemaining && i < remainingEligibleEmployees.length; i++) {
        const employee = remainingEligibleEmployees[i];
        
        plan.push({
          employeeId: employee.id,
          date: formatDateKey(day),
          shiftType: "Arbeit"
        });
        
        // Update tracking counter
        employeeAssignments[employee.id]++;
        filledPositions[dayIndex]++;
      }
    }
  });
  
  // Return the complete assignment plan
  return plan;
};

// Check if automatic planning is possible (all days have forecast values)
export const canAutoPlan = (requiredEmployees: Record<number, number>, dayCount: number): boolean => {
  // Now we can auto-plan even if forecast isn't set
  return true;
};
