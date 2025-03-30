
import { useEffect } from "react";
import { Employee } from "@/types/employee";
import { processEmployees } from "../utils/employee-processor";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/utils/storageUtils";

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
        saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
        
        // Ensure employee data is saved
        if (employees.length > 0) {
          const processedEmployees = processEmployees(employees);
          saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
          console.log("Saved employees to localStorage before unload:", employees.length);
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
        if (e.key === STORAGE_KEYS.EMPLOYEES && e.newValue) {
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
          const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
          if (savedEmployees && Array.isArray(savedEmployees) && savedEmployees.length > 0) {
            const processedEmployees = processEmployees(savedEmployees);
            setEmployees(processedEmployees);
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
