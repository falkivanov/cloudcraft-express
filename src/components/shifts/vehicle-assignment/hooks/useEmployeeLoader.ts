
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
          return parsedEmployees.filter(emp => emp.status === "Aktiv");
        }
      }
      return initialEmployees.filter(emp => emp.status === "Aktiv");
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
      return initialEmployees.filter(emp => emp.status === "Aktiv");
    }
  });
  
  // Return both the employees and filteredEmployees (which are the same in this case)
  // to match the interface expected by the component
  return {
    employees,
    filteredEmployees: employees
  };
}
