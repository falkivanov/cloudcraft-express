
import { useCallback } from "react";
import { Employee } from "@/types/employee";

export const useScheduledEmployees = (
  filteredEmployees: Employee[],
  shiftsMap: Map<string, any>
) => {
  // Get employees scheduled for work on a specific day
  const getScheduledEmployeesForDay = useCallback((date: string) => {
    const scheduledEmpIds: string[] = [];
    
    // Scan through shiftsMap to find employees with "Arbeit" shifts on the given date
    shiftsMap.forEach((shift, key) => {
      if (shift.date === date && shift.shiftType === "Arbeit") {
        scheduledEmpIds.push(shift.employeeId);
      }
    });
    
    // Return the full employee objects for the scheduled employees
    return filteredEmployees.filter(emp => scheduledEmpIds.includes(emp.id));
  }, [filteredEmployees, shiftsMap]);
  
  return {
    getScheduledEmployeesForDay
  };
};
