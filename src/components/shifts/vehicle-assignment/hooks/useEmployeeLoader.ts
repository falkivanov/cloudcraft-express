
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
  
  // Verbesserte Filterfunktion für Mitarbeiter
  const filteredEmployees = employees.filter(employee => {
    // Wenn Suchfeld leer ist, alle Mitarbeiter anzeigen
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Suche im Namen (jetzt auch nach Teilstrings)
    const nameMatch = employee.name.toLowerCase().includes(query);
    
    // Suche nach "100%" für flexible Mitarbeiter
    const isFlexibilitySearch = query.includes("100%");
    const availabilityMatch = isFlexibilitySearch && employee.isWorkingDaysFlexible;
    
    // Debugging-Info
    console.log(`Filtering employee: ${employee.name}, Query: ${query}, nameMatch: ${nameMatch}, availabilityMatch: ${availabilityMatch}`);
    
    return nameMatch || availabilityMatch;
  });
  
  // Debugging-Info hinzufügen
  useEffect(() => {
    console.log("Search query changed to:", searchQuery);
    console.log("Filtered employees count:", filteredEmployees.length);
    console.log("Total employees count:", employees.length);
  }, [searchQuery, filteredEmployees.length, employees.length]);
  
  return {
    employees,
    filteredEmployees,
    searchQuery,
    setSearchQuery
  };
}
