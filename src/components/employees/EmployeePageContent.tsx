
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useEmployeeFilter } from "@/hooks/useEmployeeFilter";
import { Employee } from "@/types/employee";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeTabs from "./EmployeeTabs";
import AddEmployeeDialog from "./AddEmployeeDialog";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface EmployeePageContentProps {
  initialEmployees: Employee[];
  isAddEmployeeDialogOpen?: boolean;
  setIsAddEmployeeDialogOpen?: (open: boolean) => void;
  isLoading?: boolean;
}

const EmployeePageContent: React.FC<EmployeePageContentProps> = ({ 
  initialEmployees: propInitialEmployees,
  isAddEmployeeDialogOpen = false,
  setIsAddEmployeeDialogOpen = () => {},
  isLoading = false
}) => {
  const [employees, setEmployees] = useState<Employee[]>(
    propInitialEmployees.length > 0 ? propInitialEmployees : initialEmployees
  );
  const { toast: shadcnToast } = useToast();
  const { setOpen } = useSidebar();

  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveEmployees,
    filteredFormerEmployees,
    sortField,
    sortDirection,
    handleSort
  } = useEmployeeFilter(employees);

  // Synchronisiere mit Prop-Änderungen
  useEffect(() => {
    if (propInitialEmployees.length > 0) {
      console.log('EmployeePageContent - Mitarbeiter aus Props aktualisieren:', propInitialEmployees.length);
      setEmployees(propInitialEmployees);
    }
  }, [propInitialEmployees]);

  // Höre auf Speicherereignisse von anderen Tabs und auf benutzerdefinierte Ereignisse
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.EMPLOYEES && e.newValue) {
        try {
          const parsedEmployees = JSON.parse(e.newValue);
          if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            console.log('EmployeePageContent - Mitarbeiter aus Speicher-Ereignis aktualisiert:', parsedEmployees.length);
            setEmployees(parsedEmployees);
          }
        } catch (error) {
          console.error('EmployeePageContent - Fehler beim Parsen der Mitarbeiter aus Speicher-Ereignis:', error);
        }
      }
    };
    
    const handleCustomEvent = (e: CustomEvent<{employees: Employee[]}>) => {
      if (e.detail && e.detail.employees) {
        console.log('EmployeePageContent - Aktualisierung durch Custom Event:', e.detail.employees.length);
        setEmployees(e.detail.employees);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('employees-updated', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('employees-updated', handleCustomEvent as EventListener);
    };
  }, []);

  // Problem mit pointer-events beheben
  useEffect(() => {
    const handleMouseMove = () => {
      document.body.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setOpen]);

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    
    setEmployees(updatedEmployees);
    
    // Sofort in localStorage speichern
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    
    toast("Mitarbeiter aktualisiert", {
      description: `Die Daten von ${updatedEmployee.name} wurden erfolgreich aktualisiert.`
    });
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    
    // Sofort in localStorage speichern
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    
    setIsAddEmployeeDialogOpen(false);
    
    toast("Mitarbeiter hinzugefügt", {
      description: `${newEmployee.name} wurde erfolgreich als neuer Mitarbeiter hinzugefügt.`
    });
  };

  const handleImportEmployees = (importedEmployees: Employee[]) => {
    const updatedEmployees = [...employees, ...importedEmployees];
    setEmployees(updatedEmployees);
    
    // Sofort in localStorage speichern
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    
    toast("Mitarbeiter importiert", {
      description: `${importedEmployees.length} Mitarbeiter wurden erfolgreich importiert.`
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="w-full mb-6">
        <EmployeeDashboard employees={employees} />
      </div>

      <EmployeeFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        employees={employees}
        onImportEmployees={handleImportEmployees}
      />

      <div className="w-full overflow-x-auto bg-background">
        <EmployeeTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredActiveEmployees={filteredActiveEmployees}
          filteredFormerEmployees={filteredFormerEmployees}
          onUpdateEmployee={handleUpdateEmployee}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <AddEmployeeDialog
        open={isAddEmployeeDialogOpen}
        onOpenChange={setIsAddEmployeeDialogOpen}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
};

export default EmployeePageContent;
