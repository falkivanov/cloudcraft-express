
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

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setOpenEditSheet(true);
  };

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmployee);
    }
    setOpenEditSheet(false);
    setEditingEmployee(null);
  };

  const handleOpenContractEndDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsContractEndDialogOpen(true);
  };

  const handleEndContract = () => {
    if (selectedEmployee && onUpdateEmployee) {
      const updatedEmployee = {
        ...selectedEmployee,
        status: "Inaktiv",
        endDate: endDate
      };
      
      onUpdateEmployee(updatedEmployee);
      setIsContractEndDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleReactivateEmployee = (employee: Employee) => {
    if (onUpdateEmployee) {
      const updatedEmployee = {
        ...employee,
        endDate: null,
        status: "Aktiv"
      };
      onUpdateEmployee(updatedEmployee);
    }
  };

  const handleBatchReactivate = (employeeIds: string[]) => {
    if (!onUpdateEmployee) return;
    
    employeeIds.forEach(id => {
      const employee = employees.find(e => e.id === id);
      if (employee) {
        const updatedEmployee = {
          ...employee,
          endDate: null,
          status: "Aktiv"
        };
        onUpdateEmployee(updatedEmployee);
      }
    });
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
    handleBatchReactivate
  };
};
