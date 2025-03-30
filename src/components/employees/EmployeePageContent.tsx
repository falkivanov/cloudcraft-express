
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
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from "@/utils/storageUtils";

interface EmployeePageContentProps {
  initialEmployees: Employee[];
  isAddEmployeeDialogOpen?: boolean;
  setIsAddEmployeeDialogOpen?: (open: boolean) => void;
}

const EmployeePageContent: React.FC<EmployeePageContentProps> = ({ 
  initialEmployees: propInitialEmployees,
  isAddEmployeeDialogOpen = false,
  setIsAddEmployeeDialogOpen = () => {}
}) => {
  const [employees, setEmployees] = useState<Employee[]>(
    propInitialEmployees.length > 0 ? propInitialEmployees : initialEmployees
  );
  const { toast } = useToast();
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

  // Synchronize with prop changes
  useEffect(() => {
    if (propInitialEmployees.length > 0) {
      console.log('EmployeePageContent - Updating employees from props:', propInitialEmployees.length);
      setEmployees(propInitialEmployees);
    }
  }, [propInitialEmployees]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.EMPLOYEES && e.newValue) {
        try {
          const parsedEmployees = JSON.parse(e.newValue);
          if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            console.log('EmployeePageContent - Updated employees from storage event:', parsedEmployees.length);
            setEmployees(parsedEmployees);
          }
        } catch (error) {
          console.error('EmployeePageContent - Error parsing employees from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fix pointer events issue
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
    
    // Save to localStorage immediately after update
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    
    toast({
      title: "Mitarbeiter aktualisiert",
      description: `Die Daten von ${updatedEmployee.name} wurden erfolgreich aktualisiert.`,
    });
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    
    // Save to localStorage immediately after adding
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    
    setIsAddEmployeeDialogOpen(false);
    
    toast({
      title: "Mitarbeiter hinzugefügt",
      description: `${newEmployee.name} wurde erfolgreich als neuer Mitarbeiter hinzugefügt.`,
    });
  };

  const handleImportEmployees = (importedEmployees: Employee[]) => {
    const updatedEmployees = [...employees, ...importedEmployees];
    setEmployees(updatedEmployees);
    
    // Save to localStorage immediately after import
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    
    toast({
      title: "Mitarbeiter importiert",
      description: `${importedEmployees.length} Mitarbeiter wurden erfolgreich importiert.`,
    });
  };

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
