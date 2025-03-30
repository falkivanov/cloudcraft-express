
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
    const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, undefined, initialEmployees);
    
    if (savedEmployees && savedEmployees.length > 0) {
      setLoadedEmployees(savedEmployees);
      
      // Show a toast to confirm data was loaded
      toast({
        title: "Daten geladen",
        description: `${savedEmployees.length} Mitarbeiter wurden erfolgreich geladen.`,
      });
    } else {
      setLoadedEmployees(initialEmployees);
    }
  }, [toast]);

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
