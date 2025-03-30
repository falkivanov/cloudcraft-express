import { useEffect, useRef } from "react";
import { Employee } from "@/types/employee";
import { processEmployees } from "../utils/employee-processor";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/utils/storage";

/**
 * Hook zum Synchronisieren von Mitarbeiterdaten über Tabs hinweg und zur Behandlung von beforeunload
 */
export const useEmployeeStorageSync = (
  employees: Employee[],
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
) => {
  // Ref zum Verfolgen des letzten gespeicherten Status
  const lastSavedRef = useRef<string>("");
  
  // Daten vor dem Entladen speichern
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Zeitstempel für Datenüberprüfung setzen
        saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
        
        // Sicherstellen, dass Mitarbeiterdaten gespeichert werden
        if (employees.length > 0) {
          const processedEmployees = processEmployees(employees);
          saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
          console.log("Mitarbeiter im localStorage vor Entladen gespeichert:", employees.length);
          
          // Aktualisiere die lastSaved-Ref
          lastSavedRef.current = JSON.stringify(processedEmployees);
        }
      } catch (error) {
        console.error('Fehler beim Speichern von Mitarbeitern im localStorage vor Entladen:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [employees]);

  // Auf Storage-Ereignisse von anderen Tabs/Fenstern lauschen und automatisch speichern
  useEffect(() => {
    // Speichern, wenn sich employees ändern, aber nur wenn sie sich vom letzten gespeicherten Zustand unterscheiden
    const saveEmployees = () => {
      if (employees.length > 0) {
        const processedEmployees = processEmployees(employees);
        const currentJSON = JSON.stringify(processedEmployees);
        
        if (currentJSON !== lastSavedRef.current) {
          saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
          console.log("Mitarbeiter automatisch im localStorage gespeichert:", employees.length);
          
          // Zeitstempel für Synchronisierung aktualisieren
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          // Aktualisiere die lastSaved-Ref
          lastSavedRef.current = currentJSON;
          
          // Custom Event auslösen
          const event = new CustomEvent('employees-updated', { 
            detail: { employees: processedEmployees } 
          });
          window.dispatchEvent(event);
        }
      }
    };
    
    // Speichere initial und richte Timer ein
    saveEmployees();
    const saveInterval = setInterval(saveEmployees, 10000);
    
    // Handler für Storage-Ereignisse
    const handleStorageChange = (e: StorageEvent | Event) => {
      // Wenn es ein StorageEvent ist, prüfe den Schlüssel
      if (e instanceof StorageEvent) {
        if (e.key === STORAGE_KEYS.EMPLOYEES && e.newValue) {
          try {
            const updatedEmployees = JSON.parse(e.newValue);
            if (updatedEmployees && Array.isArray(updatedEmployees) && updatedEmployees.length > 0 &&
                JSON.stringify(updatedEmployees) !== JSON.stringify(employees)) {
              console.log('Mitarbeiter aus Storage-Ereignis für Schichtplanung aktualisiert');
              const processedEmployees = processEmployees(updatedEmployees);
              setEmployees(processedEmployees);
              
              // Aktualisiere die lastSaved-Ref, um Wiederholungen zu vermeiden
              lastSavedRef.current = JSON.stringify(processedEmployees);
            }
          } catch (error) {
            console.error('Fehler beim Parsen von Mitarbeitern aus Storage-Ereignis:', error);
          }
        }
      } else {
        // Wenn es ein generisches Ereignis ist (innerhalb desselben Tabs)
        try {
          const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
          if (savedEmployees && Array.isArray(savedEmployees) && savedEmployees.length > 0 &&
              JSON.stringify(savedEmployees) !== JSON.stringify(employees)) {
            const processedEmployees = processEmployees(savedEmployees);
            setEmployees(processedEmployees);
            
            // Aktualisiere die lastSaved-Ref
            lastSavedRef.current = JSON.stringify(processedEmployees);
          }
        } catch (error) {
          console.error('Fehler beim Behandeln des internen Storage-Ereignisses:', error);
        }
      }
    };
    
    // Registriere Event-Listener
    window.addEventListener('storage', handleStorageChange);
    
    // Lausche auch auf benutzerdefinierte Ereignisse
    const handleCustomEvent = (e: CustomEvent<{employees: Employee[]}>) => {
      if (e.detail && e.detail.employees && 
          JSON.stringify(e.detail.employees) !== JSON.stringify(employees)) {
        console.log('useEmployeeStorageSync - Aktualisierung durch Custom Event');
        setEmployees(e.detail.employees);
        lastSavedRef.current = JSON.stringify(e.detail.employees);
      }
    };
    
    window.addEventListener('employees-updated', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('employees-updated', handleCustomEvent as EventListener);
      clearInterval(saveInterval);
    };
  }, [employees, setEmployees]);
};
