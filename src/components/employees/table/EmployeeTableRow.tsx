
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Employee } from "@/types/employee";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeContactButtons from "./EmployeeContactButtons";
import EmployeeActions from "./EmployeeActions";

interface EmployeeTableRowProps {
  employee: Employee;
  isFormerView: boolean;
  onViewDetails: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onOpenContractEndDialog: (employee: Employee) => void;
  onReactivateEmployee: (employee: Employee) => void;
}

const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  isFormerView,
  onViewDetails,
  onEditEmployee,
  onOpenContractEndDialog,
  onReactivateEmployee
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <TableRow 
      className="cursor-pointer"
      onDoubleClick={() => onViewDetails(employee)}
    >
      <TableCell className="font-medium">{employee.name}</TableCell>
      <TableCell>{employee.transporterId}</TableCell>
      <TableCell>{formatDate(employee.startDate)}</TableCell>
      {isFormerView && <TableCell>{formatDate(employee.endDate)}</TableCell>}
      <TableCell>
        <EmployeeStatusBadge endDate={employee.endDate} />
      </TableCell>
      <TableCell>
        <EmployeeContactButtons email={employee.email} phone={employee.phone} />
      </TableCell>
      <TableCell>
        <EmployeeActions
          employee={employee}
          isFormerView={isFormerView}
          onViewDetails={onViewDetails}
          onEditEmployee={onEditEmployee}
          onOpenContractEndDialog={onOpenContractEndDialog}
          onReactivateEmployee={onReactivateEmployee}
        />
      </TableCell>
    </TableRow>
  );
};

export default EmployeeTableRow;
