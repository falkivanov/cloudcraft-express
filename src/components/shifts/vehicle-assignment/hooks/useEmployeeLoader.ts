
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { filterAndProcessEmployees } from "../../utils/employee-processor";
import { initialEmployees } from "@/data/sampleEmployeeData";

export function useEmployeeLoader() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
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
