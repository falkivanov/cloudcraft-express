
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";

export const useEmployeeLoader = (initialEmployeesData: Employee[] = []) => {
  // Verbesserte Initialisierung mit Fallback
  const [employees, setEmployees] = useState<Employee[]>(
    initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees
  );
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(
    (initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees).filter(emp => emp.status === "Aktiv")
  );
  
  // Load employees from localStorage on component mount
  useEffect(() => {
    const loadEmployeesFromStorage = () => {
      try {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
          const parsedEmployees = JSON.parse(savedEmployees);
          console.log('Loaded employees from localStorage for shift planning:', parsedEmployees.length);
          if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            setEmployees(parsedEmployees);
            setFilteredEmployees(parsedEmployees.filter(emp => emp.status === "Aktiv"));
            return; // Erfolgreich geladen
          }
        }
        
        console.log('No valid employees in localStorage, using fallback data');
        if (initialEmployeesData.length > 0) {
          setEmployees(initialEmployeesData);
          setFilteredEmployees(initialEmployeesData.filter(emp => emp.status === "Aktiv"));
        } else {
          console.log('Using sample employee data as fallback');
          // Beispieldaten im localStorage speichern, damit sie nächstes Mal verfügbar sind
          localStorage.setItem('employees', JSON.stringify(initialEmployees));
          setEmployees(initialEmployees);
          setFilteredEmployees(initialEmployees.filter(emp => emp.status === "Aktiv"));
        }
      } catch (error) {
        console.error('Error loading employees from localStorage:', error);
        // Fallback zu initialEmployees
        if (initialEmployeesData.length > 0) {
          setEmployees(initialEmployeesData);
          setFilteredEmployees(initialEmployeesData.filter(emp => emp.status === "Aktiv"));
        } else {
          setEmployees(initialEmployees);
          setFilteredEmployees(initialEmployees.filter(emp => emp.status === "Aktiv"));
        }
      }
    };

    loadEmployeesFromStorage();
  }, [initialEmployeesData]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'employees' && e.newValue) {
        try {
          const updatedEmployees = JSON.parse(e.newValue);
          if (updatedEmployees && Array.isArray(updatedEmployees) && updatedEmployees.length > 0) {
            console.log('Updated employees from storage event for shift planning');
            setEmployees(updatedEmployees);
            setFilteredEmployees(updatedEmployees.filter(emp => emp.status === "Aktiv"));
          }
        } catch (error) {
          console.error('Error parsing employees from storage event:', error);
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
