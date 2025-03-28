
import { useEffect } from "react";
import { Employee } from "@/types/employee";
import { processEmployees } from "../utils/employee-processor";

/**
 * Hook to synchronize employee data across tabs and handle beforeunload
 */
export const useEmployeeStorageSync = (
  employees: Employee[],
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
) => {
  // Save data before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Set a timestamp for data verification
        localStorage.setItem('dataTimestamp', Date.now().toString());
        
        // Ensure employee data is saved
        if (employees.length > 0) {
          const processedEmployees = processEmployees(employees);
          localStorage.setItem('employees', JSON.stringify(processedEmployees));
        }
      } catch (error) {
        console.error('Error saving employees to localStorage before unload:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [employees]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      // If it's a StorageEvent, check the key
      if (e instanceof StorageEvent) {
        if (e.key === 'employees' && e.newValue) {
          try {
            const updatedEmployees = JSON.parse(e.newValue);
            if (updatedEmployees && Array.isArray(updatedEmployees) && updatedEmployees.length > 0) {
              console.log('Updated employees from storage event for shift planning');
              const processedEmployees = processEmployees(updatedEmployees);
              setEmployees(processedEmployees);
            }
          } catch (error) {
            console.error('Error parsing employees from storage event:', error);
          }
        }
      } else {
        // If it's a generic event (for within the same tab)
        try {
          const savedEmployees = localStorage.getItem('employees');
          if (savedEmployees) {
            const parsedEmployees = JSON.parse(savedEmployees);
            if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
              const processedEmployees = processEmployees(parsedEmployees);
              setEmployees(processedEmployees);
            }
          }
        } catch (error) {
          console.error('Error handling internal storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setEmployees]);
};
