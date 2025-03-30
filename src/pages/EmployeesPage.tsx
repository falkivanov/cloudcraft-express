
import React, { useState, useEffect } from "react";
import EmployeePageHeader from "@/components/employees/EmployeePageHeader";
import EmployeePageContent from "@/components/employees/EmployeePageContent";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Container } from "@/components/ui/container";
import { Employee } from "@/types/employee";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

const EmployeesPage = () => {
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [loadedEmployees, setLoadedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast: shadcnToast } = useToast();
  
  // Verbessertes Laden von Mitarbeitern beim initialen Laden
  useEffect(() => {
    console.log('EmployeesPage - Initialisieren und Laden der Mitarbeiterdaten');
    setIsLoading(true);
    
    try {
      // Versuche, gespeicherte Mitarbeiter aus dem localStorage zu laden
      const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
      
      if (savedEmployees && savedEmployees.length > 0) {
        console.log('EmployeesPage - Erfolgreich geladene Mitarbeiter:', savedEmployees.length);
        setLoadedEmployees(savedEmployees);
        
        // Toast-Nachricht zur Bestätigung des Ladens
        toast(`${savedEmployees.length} Mitarbeiter geladen`, {
          description: "Mitarbeiterdaten wurden erfolgreich geladen."
        });
      } else {
        console.log('EmployeesPage - Keine gespeicherten Mitarbeiter gefunden, verwende Beispieldaten');
        setLoadedEmployees(initialEmployees);
        
        // Speichere Beispiel-Mitarbeiter sofort in localStorage
        saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
        
        toast("Beispieldaten geladen", {
          description: "Es wurden keine gespeicherten Mitarbeiterdaten gefunden. Beispieldaten wurden geladen."
        });
      }
    } catch (error) {
      console.error('EmployeesPage - Fehler beim Laden der Mitarbeiter:', error);
      setLoadedEmployees(initialEmployees);
      
      // Speichere Beispiel-Mitarbeiter in localStorage als Fallback
      saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
      
      toast.error("Fehler beim Laden der Daten", {
        description: "Beispieldaten wurden stattdessen geladen."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stellen Sie sicher, dass Mitarbeiter gespeichert werden, wenn sie sich ändern
  useEffect(() => {
    if (loadedEmployees.length > 0 && !isLoading) {
      try {
        saveToStorage(STORAGE_KEYS.EMPLOYEES, loadedEmployees);
        console.log('EmployeesPage - Gespeicherte Mitarbeiter in localStorage:', loadedEmployees.length);
        
        // Custom Event auslösen, um andere Komponenten zu benachrichtigen
        const event = new CustomEvent('employees-updated', { 
          detail: { employees: loadedEmployees } 
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('EmployeesPage - Fehler beim Speichern der Mitarbeiter:', error);
      }
    }
  }, [loadedEmployees, isLoading]);

  return (
    <Container className="py-8">
      <EmployeePageHeader 
        onAddEmployeeClick={() => setIsAddEmployeeDialogOpen(true)} 
      />
      
      <EmployeePageContent 
        initialEmployees={loadedEmployees} 
        isAddEmployeeDialogOpen={isAddEmployeeDialogOpen}
        setIsAddEmployeeDialogOpen={setIsAddEmployeeDialogOpen}
        isLoading={isLoading}
      />
    </Container>
  );
};

export default EmployeesPage;
