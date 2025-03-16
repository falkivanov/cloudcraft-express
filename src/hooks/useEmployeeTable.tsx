
import { useState } from "react";
import { Employee } from "@/types/employee";
import { toast } from "sonner";

// Helper functions
const markEmployeeInactive = (employee: Employee, endDate: string): Employee => ({
  ...employee,
  status: "Inaktiv",
  endDate: endDate
});

const markEmployeeActive = (employee: Employee): Employee => ({
  ...employee,
  endDate: null,
  status: "Aktiv"
});

const markEmployeeDeleted = (employee: Employee): Employee => ({
  ...employee,
  status: "Gelöscht"
});

export const useEmployeeTable = (
  employees: Employee[],
  onUpdateEmployee?: (updatedEmployee: Employee) => void,
) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const [isContractEndDialogOpen, setIsContractEndDialogOpen] = useState(false);
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Function to handle viewing employee details
  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  // Function to handle editing an employee
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setOpenEditSheet(true);
  };

  // Function to handle saving employee changes
  const handleSaveEmployee = (updatedEmployee: Employee) => {
    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmployee);
    }
    setOpenEditSheet(false);
    setEditingEmployee(null);
  };

  // Function to open the contract end dialog
  const handleOpenContractEndDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsContractEndDialogOpen(true);
  };

  // Function to handle ending an employee contract
  const handleEndContract = () => {
    if (!selectedEmployee || !onUpdateEmployee) return;
    
    const updatedEmployee = markEmployeeInactive(selectedEmployee, endDate);
    onUpdateEmployee(updatedEmployee);
    setIsContractEndDialogOpen(false);
    setSelectedEmployee(null);
  };

  // Function to reactivate a single employee
  const handleReactivateEmployee = (employee: Employee) => {
    if (!onUpdateEmployee) return;
    
    const updatedEmployee = markEmployeeActive(employee);
    onUpdateEmployee(updatedEmployee);
    toast.success(`Mitarbeiter ${employee.name} wurde reaktiviert`);
  };

  // Helper function to reactivate an employee
  const reactivateEmployee = (employee: Employee) => {
    if (!onUpdateEmployee) return;
    
    const updatedEmployee = markEmployeeActive(employee);
    onUpdateEmployee(updatedEmployee);
  };

  // Function to handle batch reactivation of employees
  const handleBatchReactivate = (employeeIds: string[]) => {
    if (!onUpdateEmployee) return;
    
    if (employeeIds.length === 0) {
      toast.warning("Keine Mitarbeiter ausgewählt");
      return;
    }
    
    let reactivatedCount = 0;
    employeeIds.forEach(id => {
      const employee = employees.find(e => e.id === id);
      if (employee) {
        reactivateEmployee(employee);
        reactivatedCount++;
      }
    });
    
    if (reactivatedCount > 0) {
      toast.success(`${reactivatedCount} Mitarbeiter wurden reaktiviert`);
    }
  };

  // Helper function to mark an employee as deleted
  const deleteEmployee = (employee: Employee) => {
    if (!onUpdateEmployee) return;
    
    const updatedEmployee = markEmployeeDeleted(employee);
    onUpdateEmployee(updatedEmployee);
  };

  // Function to handle batch deletion of employees
  const handleBatchDelete = (employeeIds: string[]) => {
    if (!onUpdateEmployee) return;
    
    if (employeeIds.length === 0) {
      toast.warning("Keine Mitarbeiter ausgewählt");
      return;
    }
    
    let deletedCount = 0;
    employeeIds.forEach(id => {
      const employee = employees.find(e => e.id === id);
      if (employee) {
        deleteEmployee(employee);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      toast.success(`${deletedCount} Mitarbeiter wurden gelöscht`);
    }
  };

  return {
    // State
    selectedEmployee,
    openDialog,
    editingEmployee,
    openEditSheet,
    isContractEndDialogOpen,
    endDate,
    
    // State setters
    setOpenDialog,
    setOpenEditSheet,
    setIsContractEndDialogOpen,
    setEndDate,
    
    // Handlers
    handleViewDetails,
    handleEditEmployee,
    handleSaveEmployee,
    handleOpenContractEndDialog,
    handleEndContract,
    handleReactivateEmployee,
    handleBatchReactivate,
    handleBatchDelete
  };
};
