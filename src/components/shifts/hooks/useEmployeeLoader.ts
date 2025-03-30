
import { useMemo, useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { useEmployeeStorage } from "./useEmployeeStorage";
import { useEmployeeStorageSync } from "./useEmployeeStorageSync";
import { filterAndProcessEmployees } from "../utils/employee-processor";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";
import { toast } from "sonner";

export const useEmployeeLoader = (initialEmployeesData: Employee[] = []) => {
  // State zum Verfolgen des Ladezustands
  const [isLoading, setIsLoading] = useState(true);
  
  // Laden und Verwalten von Mitarbeitern
  const { employees, setEmployees } = useEmployeeStorage(initialEmployeesData);
  
  // Synchronisieren von Mitarbeitern über Tabs hinweg und Behandlung von beforeunload
  useEmployeeStorageSync(employees, setEmployees);
  
  // Abgeleiteter Zustand für gefilterte Mitarbeiter
  const filteredEmployees = useMemo(() => 
    filterAndProcessEmployees(employees),
    [employees]
  );

  // Zusätzlicher useEffect zum Lauschen auf direkte Änderungen im EMPLOYEES-Schlüssel
  useEffect(() => {
    console.log("useEmployeeLoader - Initialisiere Listener für Mitarbeiteraktualisierungen");
    
    const checkForUpdates = () => {
      try {
        const currentStored = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
        if (currentStored && currentStored.length > 0 && 
            JSON.stringify(currentStored) !== JSON.stringify(employees)) {
          console.log("useEmployeeLoader - Aktualisiere Mitarbeiter aus Storage:", currentStored.length);
          setEmployees(currentStored);
        }
      } catch (error) {
        console.error("useEmployeeLoader - Fehler beim Prüfen auf Aktualisierungen:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Prüfe beim Mounten
    checkForUpdates();
    
    // Listener für benutzerdefinierte Ereignisse
    const handleCustomEvent = (e: CustomEvent<{employees: Employee[]}>) => {
      if (e.detail && e.detail.employees) {
        console.log('useEmployeeLoader - Aktualisierung durch Custom Event:', e.detail.employees.length);
        setEmployees(e.detail.employees);
      }
    };
    
    // Registriere Listener
    window.addEventListener('employees-updated', handleCustomEvent as EventListener);
    
    // Regelmäßige Prüfung auf Änderungen (als Fallback)
    const interval = setInterval(checkForUpdates, 5000);
    
    return () => {
      window.removeEventListener('employees-updated', handleCustomEvent as EventListener);
      clearInterval(interval);
    };
  }, [setEmployees, employees]);

  return {
    employees,
    filteredEmployees,
    isLoading
  };
};
