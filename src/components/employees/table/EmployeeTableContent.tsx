
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Employee } from "@/types/employee";
import EmployeeTableRow from "./EmployeeTableRow";
import SortableTableHeader from "./SortableTableHeader";

type SortField = "name" | "startDate" | "workingDaysAWeek" | "preferredVehicle";

interface EmployeeTableContentProps {
  employees: Employee[];
  isFormerView: boolean;
  sortField: SortField;
  onSort: (field: SortField) => void;
  onViewDetails: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onOpenContractEndDialog: (employee: Employee) => void;
  onReactivateEmployee: (employee: Employee) => void;
  selectedEmployees: string[];
  onToggleSelect: (employeeId: string) => void;
  selectAll: boolean;
  onToggleSelectAll: () => void;
}

const EmployeeTableContent: React.FC<EmployeeTableContentProps> = ({
  employees,
  isFormerView,
  sortField,
  onSort,
  onViewDetails,
  onEditEmployee,
  onOpenContractEndDialog,
  onReactivateEmployee,
  selectedEmployees,
  onToggleSelect,
  selectAll,
  onToggleSelectAll
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isFormerView && (
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectAll}
                onCheckedChange={onToggleSelectAll}
                aria-label="Alle auswählen"
              />
            </TableHead>
          )}
          <SortableTableHeader field="name" currentSortField={sortField} onSort={onSort}>Name</SortableTableHeader>
          <TableHead>Transporter ID</TableHead>
          <SortableTableHeader field="startDate" currentSortField={sortField} onSort={onSort}>Startdatum</SortableTableHeader>
          {isFormerView && <TableHead>Enddatum</TableHead>}
          <TableHead>Status</TableHead>
          <SortableTableHeader field="workingDaysAWeek" currentSortField={sortField} onSort={onSort}>Arbeitstage</SortableTableHeader>
          <SortableTableHeader field="preferredVehicle" currentSortField={sortField} onSort={onSort}>Fahrzeug</SortableTableHeader>
          <TableHead>Präferierte Tage</TableHead>
          <TableHead>Kontakt</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isFormerView ? 11 : 9} className="text-center py-10 text-muted-foreground">
              {isFormerView ? "Keine ehemaligen Mitarbeiter gefunden" : "Keine Mitarbeiter gefunden"}
            </TableCell>
          </TableRow>
        ) : (
          employees.map((employee) => (
            <EmployeeTableRow
              key={employee.id}
              employee={employee}
              isFormerView={isFormerView}
              onViewDetails={onViewDetails}
              onEditEmployee={onEditEmployee}
              onOpenContractEndDialog={onOpenContractEndDialog}
              onReactivateEmployee={onReactivateEmployee}
              isSelected={selectedEmployees.includes(employee.id)}
              onToggleSelect={() => onToggleSelect(employee.id)}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EmployeeTableContent;
