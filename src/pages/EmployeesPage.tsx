
import React, { useState, useEffect } from "react";
import EmployeePageHeader from "@/components/employees/EmployeePageHeader";
import EmployeePageContent from "@/components/employees/EmployeePageContent";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Container } from "@/components/ui/container";
import { Employee } from "@/types/employee";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, clearEmployeesStorage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EmployeesPage = () => {
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [loadedEmployees, setLoadedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast: shadcnToast } = useToast();
  
  // Improved loading of employees on initial load
  useEffect(() => {
    console.log('EmployeesPage - Initialisieren und Laden der Mitarbeiterdaten');
    setIsLoading(true);
    
    try {
      // Try to load saved employees from localStorage
      const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
      
      if (savedEmployees && savedEmployees.length > 0) {
        console.log('EmployeesPage - Erfolgreich geladene Mitarbeiter:', savedEmployees.length);
        setLoadedEmployees(savedEmployees);
        
        // Toast message to confirm loading
        toast(`${savedEmployees.length} Mitarbeiter geladen`, {
          description: "Mitarbeiterdaten wurden erfolgreich geladen."
        });
      } else {
        console.log('EmployeesPage - Keine gespeicherten Mitarbeiter gefunden, verwende Beispieldaten');
        setLoadedEmployees(initialEmployees);
        
        // Save example employees immediately to localStorage
        saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
        
        toast("Beispieldaten geladen", {
          description: "Es wurden keine gespeicherten Mitarbeiterdaten gefunden. Beispieldaten wurden geladen."
        });
      }
    } catch (error) {
      console.error('EmployeesPage - Fehler beim Laden der Mitarbeiter:', error);
      setLoadedEmployees(initialEmployees);
      
      // Save example employees to localStorage as fallback
      saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
      
      toast.error("Fehler beim Laden der Daten", {
        description: "Beispieldaten wurden stattdessen geladen."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ensure employees are saved when they change
  useEffect(() => {
    if (loadedEmployees.length > 0 && !isLoading) {
      try {
        saveToStorage(STORAGE_KEYS.EMPLOYEES, loadedEmployees);
        console.log('EmployeesPage - Gespeicherte Mitarbeiter in localStorage:', loadedEmployees.length);
        
        // Trigger custom event to notify other components
        const event = new CustomEvent('employees-updated', { 
          detail: { employees: loadedEmployees } 
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('EmployeesPage - Fehler beim Speichern der Mitarbeiter:', error);
      }
    }
  }, [loadedEmployees, isLoading]);

  // Handle resetting employee data
  const handleResetEmployeeData = () => {
    setIsResetDialogOpen(true);
  };

  const confirmResetEmployeeData = () => {
    setIsLoading(true);
    
    // Clear the employee data from localStorage
    const success = clearEmployeesStorage();
    
    if (success) {
      // Set empty employees array
      setLoadedEmployees([]);
      
      // Create an event to notify other components
      const event = new CustomEvent('employees-updated', { 
        detail: { employees: [] } 
      });
      window.dispatchEvent(event);
      
      toast.success("Mitarbeiterdaten zurückgesetzt", {
        description: "Alle Mitarbeiterdaten wurden erfolgreich gelöscht."
      });
    } else {
      toast.error("Fehler beim Zurücksetzen", {
        description: "Die Mitarbeiterdaten konnten nicht gelöscht werden."
      });
    }
    
    setIsLoading(false);
    setIsResetDialogOpen(false);
  };

  return (
    <Container className="py-8">
      <EmployeePageHeader 
        onAddEmployeeClick={() => setIsAddEmployeeDialogOpen(true)} 
        onResetEmployees={handleResetEmployeeData}
      />
      
      <EmployeePageContent 
        initialEmployees={loadedEmployees} 
        isAddEmployeeDialogOpen={isAddEmployeeDialogOpen}
        setIsAddEmployeeDialogOpen={setIsAddEmployeeDialogOpen}
        isLoading={isLoading}
      />

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiterdaten zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Mitarbeiterdaten werden unwiderruflich gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetEmployeeData} className="bg-destructive text-destructive-foreground">
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default EmployeesPage;
