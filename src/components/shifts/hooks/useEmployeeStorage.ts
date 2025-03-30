
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { processEmployees } from "../utils/employee-processor";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/utils/storageUtils";
import { toast } from "sonner";

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
        const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
        
        if (savedEmployees && Array.isArray(savedEmployees) && savedEmployees.length > 0) {
          console.log('Loaded employees from localStorage for shift planning:', savedEmployees.length);
          
          const processedEmployees = processEmployees(savedEmployees);
          setEmployees(processedEmployees);
          
          // Set a timestamp after successful loading
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          // Show a toast confirming successful data loading
          toast.success(`${savedEmployees.length} Mitarbeiter geladen`);
          return; // Successfully loaded
        }
        
        console.log('No valid employees in localStorage, using fallback data');
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        const processedEmployees = processEmployees(fallbackEmployees);
        
        setEmployees(processedEmployees);
        
        // Save fallback data to localStorage
        saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
        saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
        
        // Notify user about using sample data
        toast.info("Beispieldaten für Mitarbeiter geladen", {
          description: "Es wurden keine gespeicherten Daten gefunden."
        });
      } catch (error) {
        console.error('Error loading employees from localStorage:', error);
        
        // Fallback to initialEmployees
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        const processedEmployees = processEmployees(fallbackEmployees);
        
        setEmployees(processedEmployees);
        
        // Try to save the sample data
        try {
          saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          toast.warning("Fehler beim Laden der Mitarbeiterdaten", {
            description: "Beispieldaten wurden geladen."
          });
        } catch (storageError) {
          console.error('Error saving fallback employee data:', storageError);
          toast.error("Probleme mit dem Speicherzugriff", {
            description: "Daten können nicht gespeichert werden."
          });
        }
      }
    };

    loadEmployeesFromStorage();
  }, [initialEmployeesData]);
  
  return { employees, setEmployees };
};
