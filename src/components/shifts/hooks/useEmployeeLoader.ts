
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";

export const useEmployeeLoader = (initialEmployees: Employee[]) => {
  // Use state to handle employees from localStorage
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(
    initialEmployees.filter(emp => emp.status === "Aktiv")
  );
  
  // Load employees from localStorage on component mount
  useEffect(() => {
    const loadEmployeesFromStorage = () => {
      try {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
          const parsedEmployees = JSON.parse(savedEmployees);
          console.log('Loaded employees from localStorage for shift planning:', parsedEmployees.length);
          setEmployees(parsedEmployees);
          setFilteredEmployees(parsedEmployees.filter(emp => emp.status === "Aktiv"));
        } else {
          console.log('No saved employees found in localStorage, using initial data');
          setFilteredEmployees(initialEmployees.filter(emp => emp.status === "Aktiv"));
        }
      } catch (error) {
        console.error('Error loading employees from localStorage:', error);
        // Fallback to initial data when localStorage fails
        setEmployees(initialEmployees);
        setFilteredEmployees(initialEmployees.filter(emp => emp.status === "Aktiv"));
      }
    };

    loadEmployeesFromStorage();
  }, [initialEmployees]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'employees' && e.newValue) {
        try {
          const updatedEmployees = JSON.parse(e.newValue);
          console.log('Updated employees from storage event for shift planning');
          setEmployees(updatedEmployees);
          setFilteredEmployees(updatedEmployees.filter(emp => emp.status === "Aktiv"));
        } catch (error) {
          console.error('Error parsing employees from storage event:', error);
          // Don't update state if storage event data is invalid
          // This prevents corrupted data from breaking the application
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    employees,
    filteredEmployees
  };
};
