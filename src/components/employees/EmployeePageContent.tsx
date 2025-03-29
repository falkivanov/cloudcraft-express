
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

  // Load employees from localStorage on component mount
  useEffect(() => {
    const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, undefined, 
      propInitialEmployees.length > 0 ? propInitialEmployees : initialEmployees);
    
    if (savedEmployees && savedEmployees.length > 0) {
      console.log('Loaded employees from localStorage:', savedEmployees.length);
      setEmployees(savedEmployees);
    } else if (propInitialEmployees.length > 0) {
      console.log('Using prop initialEmployees as fallback');
      setEmployees(propInitialEmployees);
      saveToStorage(STORAGE_KEYS.EMPLOYEES, propInitialEmployees);
    } else {
      console.log('Using sample initialEmployees as fallback');
      setEmployees(initialEmployees);
      saveToStorage(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    }
  }, [propInitialEmployees]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.EMPLOYEES && e.newValue) {
        try {
          const parsedEmployees = JSON.parse(e.newValue);
          if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            setEmployees(parsedEmployees);
          }
        } catch (error) {
          console.error('Error parsing employees from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save employees to localStorage when they change
  useEffect(() => {
    if (employees.length > 0) {
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    }
  }, [employees]);

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
    setEmployees(employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    
    toast({
      title: "Mitarbeiter aktualisiert",
      description: `Die Daten von ${updatedEmployee.name} wurden erfolgreich aktualisiert.`,
    });
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees([...employees, newEmployee]);
    setIsAddEmployeeDialogOpen(false);
    
    toast({
      title: "Mitarbeiter hinzugefügt",
      description: `${newEmployee.name} wurde erfolgreich als neuer Mitarbeiter hinzugefügt.`,
    });
  };

  const handleImportEmployees = (importedEmployees: Employee[]) => {
    setEmployees(prevEmployees => [...prevEmployees, ...importedEmployees]);
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
