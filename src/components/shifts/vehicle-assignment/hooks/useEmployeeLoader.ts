
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { filterAndProcessEmployees } from "../../utils/employee-processor";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { loadFromStorage } from "@/utils/storage";

export function useEmployeeLoader() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const savedEmployees = loadFromStorage('employees');
      if (savedEmployees) {
        const parsedEmployees = savedEmployees;
        if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          return filterAndProcessEmployees(parsedEmployees);
        }
      }
      return filterAndProcessEmployees(initialEmployees);
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
      return filterAndProcessEmployees(initialEmployees);
    }
  });
  
  return employees;
}
