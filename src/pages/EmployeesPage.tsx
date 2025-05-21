
import React, { useState, useEffect } from "react";
import EmployeePageHeader from "@/components/employees/EmployeePageHeader";
import EmployeePageContent from "@/components/employees/EmployeePageContent";
import { Container } from "@/components/ui/container";
import { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { api } from "@/services/api";
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
  
  // Fetch employees from API on initial load
  useEffect(() => {
    console.log('EmployeesPage - Lade Mitarbeiterdaten vom Server');
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    
    try {
      const employees = await api.employees.getAll();
      console.log('EmployeesPage - Erfolgreich geladene Mitarbeiter:', employees.length);
      setLoadedEmployees(employees);
      
      toast("Mitarbeiterdaten geladen", {
        description: `${employees.length} Mitarbeiter wurden erfolgreich geladen.`
      });
    } catch (error) {
      console.error('EmployeesPage - Fehler beim Laden der Mitarbeiter:', error);
      
      toast.error("Fehler beim Laden der Daten", {
        description: "Die Mitarbeiterdaten konnten nicht vom Server geladen werden."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resetting employee data
  const handleResetEmployeeData = () => {
    setIsResetDialogOpen(true);
  };

  const confirmResetEmployeeData = async () => {
    setIsLoading(true);
    
    try {
      await api.employees.deleteAll();
      
      // Refresh employee list
      setLoadedEmployees([]);
      
      toast.success("Mitarbeiterdaten zurückgesetzt", {
        description: "Alle Mitarbeiterdaten wurden erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Error deleting employees:', error);
      
      toast.error("Fehler beim Zurücksetzen", {
        description: "Die Mitarbeiterdaten konnten nicht gelöscht werden."
      });
    } finally {
      setIsLoading(false);
      setIsResetDialogOpen(false);
    }
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
        onRefresh={fetchEmployees}
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
