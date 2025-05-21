
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const EmployeesPage = () => {
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [loadedEmployees, setLoadedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast: shadcnToast } = useToast();
  
  // Fetch employees from API on initial load
  useEffect(() => {
    console.log('EmployeesPage - Lade Mitarbeiterdaten vom Server');
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const response = await api.employees.getAll();
      
      if (!response.success) {
        console.error('EmployeesPage - Fehler beim Laden der Mitarbeiter:', response.error);
        setApiError(response.error || "Die Verbindung zum Server konnte nicht hergestellt werden.");
        toast.error("Fehler beim Laden der Daten", {
          description: response.error || "Die Mitarbeiterdaten konnten nicht vom Server geladen werden."
        });
        setLoadedEmployees([]);
      } else {
        console.log('EmployeesPage - Erfolgreich geladene Mitarbeiter:', response.data?.length || 0);
        
        // Access the data properly from the API response
        const employeeData = response.data || [];
        setLoadedEmployees(employeeData);
        
        if (employeeData.length > 0) {
          toast("Mitarbeiterdaten geladen", {
            description: `${employeeData.length} Mitarbeiter wurden erfolgreich geladen.`
          });
        }
      }
    } catch (error) {
      console.error('EmployeesPage - Unbehandelter Fehler beim Laden der Mitarbeiter:', error);
      setApiError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      
      toast.error("Fehler beim Laden der Daten", {
        description: "Die Mitarbeiterdaten konnten nicht vom Server geladen werden."
      });
      
      setLoadedEmployees([]);
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
      const response = await api.employees.deleteAll();
      
      if (response.success) {
        // Refresh employee list
        setLoadedEmployees([]);
        
        toast.success("Mitarbeiterdaten zurückgesetzt", {
          description: "Alle Mitarbeiterdaten wurden erfolgreich gelöscht."
        });
      } else {
        toast.error("Fehler beim Zurücksetzen", {
          description: response.error || "Die Mitarbeiterdaten konnten nicht gelöscht werden."
        });
      }
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
      
      {apiError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verbindungsfehler</AlertTitle>
          <AlertDescription>
            {apiError}
            <button 
              onClick={fetchEmployees} 
              className="underline ml-2 font-medium"
            >
              Erneut versuchen
            </button>
          </AlertDescription>
        </Alert>
      )}
      
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
