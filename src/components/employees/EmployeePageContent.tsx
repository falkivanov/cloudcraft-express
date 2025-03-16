
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
}

const EmployeePageContent: React.FC<EmployeePageContentProps> = ({ 
  initialEmployees 
}) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const { toast } = useToast();
  const { setOpen } = useSidebar();

  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveEmployees,
    filteredFormerEmployees
  } = useEmployeeFilter(employees);

  // Reset sidebar state when component unmounts or mounts
  useEffect(() => {
    // Allow sidebar to be interactive again on component mount
    const handleMouseMove = () => {
      // Re-enable sidebar interactivity
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

  return (
    <>
      <div className="w-full mb-6">
        <EmployeeDashboard employees={employees} />
      </div>

      <EmployeeFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        employees={employees}
      />

      <div className="w-full overflow-x-auto">
        <EmployeeTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredActiveEmployees={filteredActiveEmployees}
          filteredFormerEmployees={filteredFormerEmployees}
          onUpdateEmployee={handleUpdateEmployee}
        />
      </div>

      <AddEmployeeDialog
        open={isAddEmployeeDialogOpen}
        onOpenChange={setIsAddEmployeeDialogOpen}
        onAddEmployee={handleAddEmployee}
      />
    </>
  );
};

export default EmployeePageContent;
