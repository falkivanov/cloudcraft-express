
import { useState } from "react";
import { Employee } from "@/types/employee";

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
    
    const updatedEmployee = {
      ...selectedEmployee,
      status: "Inaktiv",
      endDate: endDate
    };
    
    onUpdateEmployee(updatedEmployee);
    setIsContractEndDialogOpen(false);
    setSelectedEmployee(null);
  };

  // Function to reactivate a single employee
  const handleReactivateEmployee = (employee: Employee) => {
    if (!onUpdateEmployee) return;
    
    const updatedEmployee = {
      ...employee,
      endDate: null,
      status: "Aktiv"
    };
    onUpdateEmployee(updatedEmployee);
  };

  // Function to handle batch reactivation of employees
  const handleBatchReactivate = (employeeIds: string[]) => {
    if (!onUpdateEmployee) return;
    
    employeeIds.forEach(id => {
      const employee = employees.find(e => e.id === id);
      if (employee) {
        reactivateEmployee(employee);
      }
    });
  };

  // Helper function to reactivate an employee
  const reactivateEmployee = (employee: Employee) => {
    if (!onUpdateEmployee) return;
    
    const updatedEmployee = {
      ...employee,
      endDate: null,
      status: "Aktiv"
    };
    onUpdateEmployee(updatedEmployee);
  };

  // Function to handle batch deletion of employees
  const handleBatchDelete = (employeeIds: string[]) => {
    if (!onUpdateEmployee) return;
    
    employeeIds.forEach(id => {
      const employee = employees.find(e => e.id === id);
      if (employee) {
        deleteEmployee(employee);
      }
    });
  };

  // Helper function to mark an employee as deleted
  const deleteEmployee = (employee: Employee) => {
    if (!onUpdateEmployee) return;
    
    // Mark the employee as deleted
    // In a real app, you might want to use a separate deletion API
    const updatedEmployee = {
      ...employee,
      status: "Gelöscht"
    };
    onUpdateEmployee(updatedEmployee);
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
