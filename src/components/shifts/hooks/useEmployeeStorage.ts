
import { useState, useEffect, useRef } from "react";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { processEmployees } from "../utils/employee-processor";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/utils/storageUtils";
import { toast } from "sonner";

/**
 * Hook zum Laden von Mitarbeitern aus localStorage
 */
export const useEmployeeStorage = (initialEmployeesData: Employee[] = []) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
    return processEmployees(fallbackEmployees);
  });
  
  // Ref zum Verfolgen, ob Daten geladen wurden
  const dataLoadedRef = useRef(false);
  
  // Mitarbeiter aus localStorage beim Komponenten-Mount laden
  useEffect(() => {
    const loadEmployeesFromStorage = () => {
      if (dataLoadedRef.current) {
        console.log("useEmployeeStorage - Daten wurden bereits geladen, überspringe");
        return;
      }
      
      try {
        const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
        
        if (savedEmployees && Array.isArray(savedEmployees) && savedEmployees.length > 0) {
          console.log('Mitarbeiter aus localStorage für Schichtplanung geladen:', savedEmployees.length);
          
          const processedEmployees = processEmployees(savedEmployees);
          setEmployees(processedEmployees);
          
          // Zeitstempel nach erfolgreichem Laden setzen
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          // Toast zur Bestätigung des erfolgreichen Datenladens anzeigen
          toast.success(`${savedEmployees.length} Mitarbeiter geladen`);
          
          // Markiere, dass Daten geladen wurden
          dataLoadedRef.current = true;
          return; // Erfolgreich geladen
        }
        
        console.log('Keine gültigen Mitarbeiter im localStorage, verwende Fallback-Daten');
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        const processedEmployees = processEmployees(fallbackEmployees);
        
        setEmployees(processedEmployees);
        
        // Fallback-Daten im localStorage speichern
        saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
        saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
        
        // Benutzer über die Verwendung von Beispieldaten benachrichtigen
        toast.info("Beispieldaten für Mitarbeiter geladen", {
          description: "Es wurden keine gespeicherten Daten gefunden."
        });
        
        // Markiere, dass Daten geladen wurden
        dataLoadedRef.current = true;
      } catch (error) {
        console.error('Fehler beim Laden von Mitarbeitern aus localStorage:', error);
        
        // Auf initialEmployees zurückgreifen
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        const processedEmployees = processEmployees(fallbackEmployees);
        
        setEmployees(processedEmployees);
        
        // Versuche, die Beispieldaten zu speichern
        try {
          saveToStorage(STORAGE_KEYS.EMPLOYEES, processedEmployees);
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          toast.warning("Fehler beim Laden der Mitarbeiterdaten", {
            description: "Beispieldaten wurden geladen."
          });
        } catch (storageError) {
          console.error('Fehler beim Speichern von Fallback-Mitarbeiterdaten:', storageError);
          toast.error("Probleme mit dem Speicherzugriff", {
            description: "Daten können nicht gespeichert werden."
          });
        }
        
        // Markiere, dass daten geladen wurden, auch wenn mit Fehlern
        dataLoadedRef.current = true;
      }
    };

    loadEmployeesFromStorage();
    
    // Fallback: Nach einer Verzögerung erneut versuchen, falls Daten nicht geladen wurden
    const fallbackTimer = setTimeout(() => {
      if (!dataLoadedRef.current) {
        console.log("useEmployeeStorage - Fallback-Timer für Datenladen ausgelöst");
        loadEmployeesFromStorage();
      }
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [initialEmployeesData]);
  
  return { employees, setEmployees };
};
