
import React, { useState, useEffect } from "react";
import EmployeePageHeader from "@/components/employees/EmployeePageHeader";
import EmployeePageContent from "@/components/employees/EmployeePageContent";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Container } from "@/components/ui/container";
import { Employee } from "@/types/employee";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/utils/storageUtils";
import { useToast } from "@/hooks/use-toast";

const EmployeesPage = () => {
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [loadedEmployees, setLoadedEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  
  // Load employees from localStorage on initial load
  useEffect(() => {
    // Try-catch block for robust error handling
    try {
      const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
      
      if (savedEmployees && savedEmployees.length > 0) {
        console.log('EmployeesPage - Successfully loaded employees:', savedEmployees.length);
        setLoadedEmployees(savedEmployees);
        
        // Show a toast to confirm data was loaded
        toast({
          title: "Daten geladen",
          description: `${savedEmployees.length} Mitarbeiter wurden erfolgreich geladen.`,
        });
      } else {
        console.log('EmployeesPage - No stored employees found, using sample data');
        setLoadedEmployees(initialEmployees);
        
        // Save initial employees to localStorage immediately
        saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
        
        toast({
          title: "Beispieldaten geladen",
          description: "Es wurden keine gespeicherten Mitarbeiterdaten gefunden. Beispieldaten wurden geladen.",
        });
      }
    } catch (error) {
      console.error('EmployeesPage - Error loading employees:', error);
      setLoadedEmployees(initialEmployees);
      
      // Save initial employees to localStorage as fallback
      saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
      
      toast({
        title: "Fehler beim Laden",
        description: "Es gab ein Problem beim Laden der Mitarbeiterdaten. Beispieldaten wurden geladen.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Ensure employees are saved whenever they change
  useEffect(() => {
    if (loadedEmployees.length > 0) {
      try {
        saveToStorage(STORAGE_KEYS.EMPLOYEES, loadedEmployees);
        console.log('EmployeesPage - Saved employees to localStorage:', loadedEmployees.length);
      } catch (error) {
        console.error('EmployeesPage - Error saving employees:', error);
      }
    }
  }, [loadedEmployees]);

  return (
    <Container className="py-8">
      <EmployeePageHeader 
        onAddEmployeeClick={() => setIsAddEmployeeDialogOpen(true)} 
      />
      
      <EmployeePageContent 
        initialEmployees={loadedEmployees} 
        isAddEmployeeDialogOpen={isAddEmployeeDialogOpen}
        setIsAddEmployeeDialogOpen={setIsAddEmployeeDialogOpen}
      />
    </Container>
  );
};

export default EmployeesPage;
