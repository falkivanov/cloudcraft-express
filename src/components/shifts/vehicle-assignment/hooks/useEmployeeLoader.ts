
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";

export function useEmployeeLoader() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          // Filter for active employees and ensure full-time employees don't have preferred days
          return parsedEmployees
            .filter(emp => emp.status === "Aktiv")
            .map(emp => {
              // For full-time employees (5+ days), clear preferred days and set as flexible
              if (emp.workingDaysAWeek >= 5) {
                return {
                  ...emp,
                  preferredWorkingDays: [],
                  isWorkingDaysFlexible: true
                };
              }
              return emp;
            });
        }
      }
      return initialEmployees
        .filter(emp => emp.status === "Aktiv")
        .map(emp => {
          if (emp.workingDaysAWeek >= 5) {
            return {
              ...emp,
              preferredWorkingDays: [],
              isWorkingDaysFlexible: true
            };
          }
          return emp;
        });
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
      return initialEmployees
        .filter(emp => emp.status === "Aktiv")
        .map(emp => {
          if (emp.workingDaysAWeek >= 5) {
            return {
              ...emp,
              preferredWorkingDays: [],
              isWorkingDaysFlexible: true
            };
          }
          return emp;
        });
    }
  });
  
  return employees;
}
