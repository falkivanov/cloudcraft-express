
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { processEmployees, filterAndProcessEmployees } from "../utils/employee-processor";

/**
 * Hook to handle loading employees from localStorage
 */
export const useEmployeeStorage = (initialEmployeesData: Employee[] = []) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
    return processEmployees(fallbackEmployees);
  });
  
  // Load employees from localStorage on component mount
  useEffect(() => {
    const loadEmployeesFromStorage = () => {
      try {
        const dataTimestamp = localStorage.getItem('dataTimestamp');
        const savedEmployees = localStorage.getItem('employees');
        
        if (savedEmployees) {
          const parsedEmployees = JSON.parse(savedEmployees);
          console.log('Loaded employees from localStorage for shift planning:', parsedEmployees.length);
          
          if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            const processedEmployees = processEmployees(parsedEmployees);
            setEmployees(processedEmployees);
            
            // Set a timestamp after successful loading
            localStorage.setItem('dataTimestamp', Date.now().toString());
            return; // Successfully loaded
          }
        }
        
        console.log('No valid employees in localStorage, using fallback data');
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        const processedEmployees = processEmployees(fallbackEmployees);
        
        setEmployees(processedEmployees);
        
        // Save to localStorage
        localStorage.setItem('employees', JSON.stringify(processedEmployees));
        localStorage.setItem('dataTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Error loading employees from localStorage:', error);
        
        // Fallback to initialEmployees
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        const processedEmployees = processEmployees(fallbackEmployees);
        
        setEmployees(processedEmployees);
        
        // Try to save the sample data
        try {
          localStorage.setItem('employees', JSON.stringify(processedEmployees));
          localStorage.setItem('dataTimestamp', Date.now().toString());
        } catch (storageError) {
          console.error('Error saving fallback employee data:', storageError);
        }
      }
    };

    loadEmployeesFromStorage();
  }, [initialEmployeesData]);
  
  return { employees, setEmployees };
};
