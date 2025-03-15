
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import EmployeeTableRow from "./table/EmployeeTableRow";
import EmployeeDetailsContent from "./table/EmployeeDetailsContent";

interface EmployeeTableProps {
  employees: Employee[];
  onUpdateEmployee?: (updatedEmployee: Employee) => void;
  isFormerView?: boolean;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ 
  employees,
  onUpdateEmployee = () => {},
  isFormerView = false
}) => {
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
    onUpdateEmployee(updatedEmployee);
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

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Transporter ID</TableHead>
              <TableHead>Startdatum</TableHead>
              {isFormerView && <TableHead>Enddatum</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isFormerView ? 7 : 6} className="text-center py-10 text-muted-foreground">
                  {isFormerView ? "Keine ehemaligen Mitarbeiter gefunden" : "Keine Mitarbeiter gefunden"}
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  isFormerView={isFormerView}
                  onViewDetails={handleViewDetails}
                  onEditEmployee={handleEditEmployee}
                  onOpenContractEndDialog={handleOpenContractEndDialog}
                  onReactivateEmployee={handleReactivateEmployee}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
