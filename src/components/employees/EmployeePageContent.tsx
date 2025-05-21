
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useEmployeeFilter } from "@/hooks/useEmployeeFilter";
import { Employee } from "@/types/employee";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeTabs from "./EmployeeTabs";
import AddEmployeeDialog from "./AddEmployeeDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/services/api";

interface EmployeePageContentProps {
  initialEmployees: Employee[];
  isAddEmployeeDialogOpen?: boolean;
  setIsAddEmployeeDialogOpen?: (open: boolean) => void;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

const EmployeePageContent: React.FC<EmployeePageContentProps> = ({ 
  initialEmployees: propInitialEmployees,
  isAddEmployeeDialogOpen = false,
  setIsAddEmployeeDialogOpen = () => {},
  isLoading = false,
  onRefresh
}) => {
  const [employees, setEmployees] = useState<Employee[]>(propInitialEmployees);
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

  // Sync with prop changes
  useEffect(() => {
    if (propInitialEmployees.length > 0 || propInitialEmployees.length === 0) {
      console.log('EmployeePageContent - Mitarbeiter aus Props aktualisieren:', propInitialEmployees.length);
      setEmployees(propInitialEmployees);
    }
  }, [propInitialEmployees]);

  // Fix pointer-events issue
  useEffect(() => {
    const handleMouseMove = () => {
      document.body.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setOpen]);

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    try {
      await api.employees.update(updatedEmployee.id, updatedEmployee);
      
      // Update local state
      const updatedEmployees = employees.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      );
      setEmployees(updatedEmployees);
      
      toast("Mitarbeiter aktualisiert", {
        description: `Die Daten von ${updatedEmployee.name} wurden erfolgreich aktualisiert.`
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error("Fehler beim Aktualisieren", {
        description: `Die Daten von ${updatedEmployee.name} konnten nicht aktualisiert werden.`
      });
    }
  };

  const handleAddEmployee = async (newEmployee: Employee) => {
    try {
      const createdEmployee = await api.employees.create(newEmployee);
      
      // Update local state
      setEmployees(prev => [...prev, createdEmployee]);
      
      setIsAddEmployeeDialogOpen(false);
      
      toast("Mitarbeiter hinzugefügt", {
        description: `${newEmployee.name} wurde erfolgreich als neuer Mitarbeiter hinzugefügt.`
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error("Fehler beim Hinzufügen", {
        description: `${newEmployee.name} konnte nicht hinzugefügt werden.`
      });
    }
  };

  const handleImportEmployees = async (importedEmployees: Employee[]) => {
    try {
      const result = await api.employees.createBatch(importedEmployees);
      
      // Update local state with newly created employees
      if (result.created && result.created.length > 0) {
        setEmployees(prev => [...prev, ...result.created]);
      }
      
      toast(
        result.skipped > 0 
          ? "Mitarbeiter teilweise importiert" 
          : "Mitarbeiter importiert", 
        {
          description: `${result.created.length} Mitarbeiter wurden erfolgreich importiert. ${
            result.skipped > 0 ? `${result.skipped} wurden übersprungen.` : ''
          }`
        }
      );
    } catch (error) {
      console.error('Error importing employees:', error);
      toast.error("Fehler beim Importieren", {
        description: `Die Mitarbeiter konnten nicht importiert werden.`
      });
    }
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
        onRefresh={onRefresh}
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
