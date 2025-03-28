
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
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee => {
    if (!searchQuery.trim()) return true;
    
    // Search in employee name
    const nameMatch = employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Search in employee availability (100% available)
    const availabilityMatch = searchQuery.toLowerCase().includes("100%") && 
      employee.isWorkingDaysFlexible;
    
    return nameMatch || availabilityMatch;
  });
  
  return {
    employees,
    filteredEmployees,
    searchQuery,
    setSearchQuery
  };
}
