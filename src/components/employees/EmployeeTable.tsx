
import React from "react";
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
import { useEmployeeTable } from "@/hooks/useEmployeeTable";
import { ArrowUpDown } from "lucide-react";

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
    handleReactivateEmployee
  } = useEmployeeTable(employees, onUpdateEmployee);

  const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name">Name</SortableHeader>
              <TableHead>Transporter ID</TableHead>
              <SortableHeader field="startDate">Startdatum</SortableHeader>
              {isFormerView && <TableHead>Enddatum</TableHead>}
              <TableHead>Status</TableHead>
              <SortableHeader field="workingDaysAWeek">Arbeitstage</SortableHeader>
              <SortableHeader field="preferredVehicle">Fahrzeug</SortableHeader>
              <TableHead>Präferierte Tage</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isFormerView ? 10 : 9} className="text-center py-10 text-muted-foreground">
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
