
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Employee } from "@/types/employee";
import EmployeeForm from "./EmployeeForm";
import ContractEndDialog from "./ContractEndDialog";
import EmployeeDetailsContent from "./table/EmployeeDetailsContent";
import { useEmployeeTable } from "@/hooks/useEmployeeTable";
import EmployeeTableContent from "./table/EmployeeTableContent";
import BatchActionButtons from "./table/BatchActionButtons";

type SortField = "name" | "startDate" | "workingDaysAWeek" | "preferredVehicle";
type SortDirection = "asc" | "desc";

interface EmployeeTableProps {
  employees: Employee[];
  onUpdateEmployee?: (updatedEmployee: Employee) => void;
  isFormerView?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ 
  employees,
  onUpdateEmployee = () => {},
  isFormerView = false,
  sortField,
  sortDirection,
  onSort
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const {
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
  } = useEmployeeTable(employees, onUpdateEmployee);

  const toggleSelect = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      // If all are selected, unselect all
      setSelectedEmployees([]);
    } else {
      // If not all are selected, select all
      setSelectedEmployees(employees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  return (
    <>
      <div className="border rounded-lg">
        <EmployeeTableContent 
          employees={employees}
          isFormerView={isFormerView}
          sortField={sortField}
          onSort={onSort}
          onViewDetails={handleViewDetails}
          onEditEmployee={handleEditEmployee}
          onOpenContractEndDialog={handleOpenContractEndDialog}
          onReactivateEmployee={handleReactivateEmployee}
          selectedEmployees={selectedEmployees}
          onToggleSelect={toggleSelect}
          selectAll={selectAll}
          onToggleSelectAll={toggleSelectAll}
        />
      </div>

      {isFormerView && selectedEmployees.length > 0 && (
        <BatchActionButtons 
          selectedCount={selectedEmployees.length}
          onReactivate={() => handleBatchReactivate(selectedEmployees)}
          onDelete={() => handleBatchDelete(selectedEmployees)}
        />
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mitarbeiterdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zum Mitarbeiter
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <EmployeeDetailsContent
              employee={selectedEmployee}
              onEdit={(employee) => {
                handleEditEmployee(employee);
                setOpenDialog(false);
              }}
              onClose={() => setOpenDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={openEditSheet} onOpenChange={setOpenEditSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Mitarbeiter bearbeiten</SheetTitle>
            <SheetDescription>
              Die Informationen des Mitarbeiters anpassen
            </SheetDescription>
          </SheetHeader>
          {editingEmployee && (
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleSaveEmployee}
              onCancel={() => setOpenEditSheet(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <ContractEndDialog
        selectedEmployee={selectedEmployee}
        open={isContractEndDialogOpen}
        endDate={endDate}
        onOpenChange={setIsContractEndDialogOpen}
        onEndDateChange={setEndDate}
        onEndContract={handleEndContract}
      />
    </>
  );
};

export default EmployeeTable;
