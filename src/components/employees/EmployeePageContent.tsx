
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useEmployeeFilter } from "@/hooks/useEmployeeFilter";
import { Employee } from "@/types/employee";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeTabs from "./EmployeeTabs";
import AddEmployeeDialog from "./AddEmployeeDialog";

interface EmployeePageContentProps {
  initialEmployees: Employee[];
  isAddEmployeeDialogOpen?: boolean;
  setIsAddEmployeeDialogOpen?: (open: boolean) => void;
}

const EmployeePageContent: React.FC<EmployeePageContentProps> = ({ 
  initialEmployees,
  isAddEmployeeDialogOpen = false,
  setIsAddEmployeeDialogOpen = () => {}
}) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
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

  // Initialize employees from localStorage or use initialEmployees
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      } else if (initialEmployees.length > 0) {
        setEmployees(initialEmployees);
        localStorage.setItem('employees', JSON.stringify(initialEmployees));
      }
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
      if (initialEmployees.length > 0) {
        setEmployees(initialEmployees);
      }
    }
  }, []);

  // Listen for storage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'employees' && e.newValue) {
        try {
          setEmployees(JSON.parse(e.newValue));
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

  // Save to localStorage whenever employees change
  useEffect(() => {
    try {
      if (employees.length > 0) {
        localStorage.setItem('employees', JSON.stringify(employees));
      }
    } catch (error) {
      console.error('Error saving employees to localStorage:', error);
    }
  }, [employees]);

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
