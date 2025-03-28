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
  
  // Improved filtering function for employees with better 100% flexibility search
  const filteredEmployees = employees.filter(employee => {
    // If search field is empty, show all employees
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Specific case: Search for "100%" to find flexible employees
    if (query.includes("100%") || query.includes("100")) {
      console.log(`Found flexibility search term in query for employee ${employee.name}, isWorkingDaysFlexible: ${employee.isWorkingDaysFlexible}`);
      return employee.isWorkingDaysFlexible === true;
    }
    
    // Otherwise, search in name
    return employee.name.toLowerCase().includes(query);
  });
  
  // Add debugging logs
  useEffect(() => {
    console.log("Search query changed to:", searchQuery);
    console.log("Filtered employees count:", filteredEmployees.length);
    console.log("Total employees count:", employees.length);
    
    if (searchQuery.includes("100%") || searchQuery.includes("100")) {
      console.log("100% availability search detected");
      console.log("Employees with 100% availability:", employees.filter(emp => emp.isWorkingDaysFlexible).length);
      console.log("Filtered results:", filteredEmployees.map(e => `${e.name} (flexible: ${e.isWorkingDaysFlexible})`));
    }
  }, [searchQuery, filteredEmployees.length, employees.length]);
  
  return {
    employees,
    filteredEmployees,
    searchQuery,
    setSearchQuery
  };
}
