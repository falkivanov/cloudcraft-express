
import { ShiftType } from "./shift-utils";
import { Employee } from "@/types/employee";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ShiftAssignment } from "@/types/shift";

interface PlanningParams {
  employees: Employee[];
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  formatDateKey: (date: Date) => string;
  planningMode?: "forecast" | "maximum";
  existingShifts?: Map<string, ShiftAssignment>;
}

interface ShiftPlan {
  employeeId: string;
  date: string;
  shiftType: ShiftType;
}

interface PlanningResult {
  workShifts: ShiftPlan[];
  freeShifts: ShiftPlan[];
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

// Checks if employee has a special shift (Termin, Urlaub, Krank) on a given day
const hasSpecialShift = (
  employeeId: string,
  date: string,
  existingShifts?: Map<string, ShiftAssignment>
): ShiftType => {
  if (!existingShifts) return null;
  
  const key = `${employeeId}-${date}`;
  const shift = existingShifts.get(key);
  
  if (shift && (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank")) {
    return shift.shiftType;
  }
  
  return null;
};

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
  const workShifts: ShiftPlan[] = [];
  const freeShifts: ShiftPlan[] = [];
  
  // Create a map to track which employees are assigned to work on which days
  const assignedWorkDays = new Map<string, Set<string>>();
  weekDays.forEach(day => {
    assignedWorkDays.set(formatDateKey(day), new Set<string>());
  });
  
  // First, preserve all special shifts (Termin, Urlaub, Krank)
  if (existingShifts) {
    existingShifts.forEach((shift, key) => {
      if (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank") {
        workShifts.push({
          employeeId: shift.employeeId,
          date: shift.date,
          shiftType: shift.shiftType
        });
        
        // Mark this employee as assigned for this day
        const dateEmployees = assignedWorkDays.get(shift.date);
        if (dateEmployees) {
          dateEmployees.add(shift.employeeId);
        }
      }
    });
  }
  
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
    
    // Count existing special shifts toward employee's assignments
    if (existingShifts) {
      weekDays.forEach(day => {
        const dateKey = formatDateKey(day);
        const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
        if (specialShift) {
          employeeAssignments[employee.id]++;
        }
      });
    }
  });
  
  // Track number of filled positions per day
  const filledPositions: Record<number, number> = {};
  weekDays.forEach((day, index) => {
    filledPositions[index] = 0;
    
    // Count existing work shifts for this day
    if (existingShifts) {
      const dateKey = formatDateKey(day);
      employees.forEach(employee => {
        const key = `${employee.id}-${dateKey}`;
        const shift = existingShifts.get(key);
        if (shift && shift.shiftType === "Arbeit") {
          filledPositions[index]++;
        }
      });
    }
  });
  
  // First pass: Assign non-flexible employees to their preferred days
  weekDays.forEach((day, dayIndex) => {
    const requiredCount = requiredEmployees[dayIndex] || 0;
    const dateKey = formatDateKey(day);
    
    // Skip days with no requirements if in forecast mode
    if (planningMode === "forecast" && requiredCount === 0) return;
    
    // Assign non-flexible employees first
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Skip if day is already fully staffed (in forecast mode)
      if (planningMode === "forecast" && filledPositions[dayIndex] >= requiredCount) return;
      
      // Check if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) {
        // Special shift already accounted for in initialization
        return;
      }
      
      const dayAbbr = getDayAbbreviation(day);
      
      // For non-flexible employees, only assign on preferred days
      if (!employee.isWorkingDaysFlexible && 
          !isTemporarilyFlexible(employee.id) && 
          employee.preferredWorkingDays.includes(dayAbbr)) {
        
        workShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Arbeit"
        });
        
        // Update tracking counters
        employeeAssignments[employee.id]++;
        filledPositions[dayIndex]++;
        
        // Mark this employee as assigned for this day
        const dateEmployees = assignedWorkDays.get(dateKey);
        if (dateEmployees) {
          dateEmployees.add(employee.id);
        }
      }
    });
  });
  
  // Second pass: Fill remaining positions prioritizing preferred days for ALL employees
  // First, assign employees to their preferred days
  weekDays.forEach((day, dayIndex) => {
    const requiredCount = planningMode === "forecast" 
      ? requiredEmployees[dayIndex] || 0 
      : Number.MAX_SAFE_INTEGER;
    
    const dateKey = formatDateKey(day);
      
    if (requiredCount <= 0) return;
    
    const dayAbbr = getDayAbbreviation(day);
    
    // For all employees, first try to assign on preferred days
    // This ensures that even flexible employees get their preferred days first
    sortedEmployees.forEach(employee => {
      // Skip if already fully assigned
      if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
      
      // Skip if day is already fully staffed
      if (filledPositions[dayIndex] >= requiredCount) return;
      
      // Check if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) {
        // Special shift already accounted for in initialization
        return;
      }
      
      // Skip non-flexible employees already handled in first pass
      if (!employee.isWorkingDaysFlexible && !isTemporarilyFlexible(employee.id)) return;
      
      // Only assign if it's a preferred day
      if (employee.preferredWorkingDays.includes(dayAbbr)) {
        workShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Arbeit"
        });
        
        // Update tracking counters
        employeeAssignments[employee.id]++;
        filledPositions[dayIndex]++;
        
        // Mark this employee as assigned for this day
        const dateEmployees = assignedWorkDays.get(dateKey);
        if (dateEmployees) {
          dateEmployees.add(employee.id);
        }
      }
    });
  });
  
  // Third pass: Only in maximum mode, assign flexible employees to non-preferred days
  // to maximize schedules, but only after all preferred days have been assigned
  if (planningMode === "maximum") {
    weekDays.forEach((day, dayIndex) => {
      const requiredCount = Number.MAX_SAFE_INTEGER; // Try to maximize in this mode
      
      if (filledPositions[dayIndex] >= requiredCount) return;
      
      const dateKey = formatDateKey(day);
      const dayAbbr = getDayAbbreviation(day);
      
      // Only truly flexible employees can be assigned to non-preferred days
      sortedEmployees.forEach(employee => {
        // Skip if already fully assigned
        if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) return;
        
        // Check if employee has a special shift on this day
        const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
        if (specialShift) {
          // Special shift already accounted for in initialization
          return;
        }
        
        // Only assign flexible employees to non-preferred days
        if ((employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)) && 
            !employee.preferredWorkingDays.includes(dayAbbr)) {
          
          workShifts.push({
            employeeId: employee.id,
            date: dateKey,
            shiftType: "Arbeit"
          });
          
          // Update tracking counters
          employeeAssignments[employee.id]++;
          filledPositions[dayIndex]++;
          
          // Mark this employee as assigned for this day
          const dateEmployees = assignedWorkDays.get(dateKey);
          if (dateEmployees) {
            dateEmployees.add(employee.id);
          }
        }
      });
    });
  }
  
  // Fourth pass: Set "Frei" status for all available employees who weren't assigned to work
  weekDays.forEach((day) => {
    const dateKey = formatDateKey(day);
    const dayAbbr = getDayAbbreviation(day);
    const assignedEmployees = assignedWorkDays.get(dateKey) || new Set<string>();
    
    // For each employee, check if they're available but not assigned
    sortedEmployees.forEach(employee => {
      // Skip if the employee is already assigned for this day
      if (assignedEmployees.has(employee.id)) return;
      
      // Skip if employee has a special shift on this day
      const specialShift = hasSpecialShift(employee.id, dateKey, existingShifts);
      if (specialShift) return;
      
      // Check if the employee can work on this day (is available)
      const canWork = canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible);
      
      // If they can work but aren't assigned, mark as "Frei"
      if (canWork) {
        freeShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Frei"
        });
      }
    });
  });
  
  // Return both work shifts and free shifts
  return {
    workShifts,
    freeShifts
  };
};

// Check if automatic planning is possible (all days have forecast values)
export const canAutoPlan = (requiredEmployees: Record<number, number>, dayCount: number): boolean => {
  // Now we can auto-plan even if forecast isn't set
  return true;
};
