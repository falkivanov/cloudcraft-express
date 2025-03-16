
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Employee } from "@/types/employee";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeContactButtons from "./EmployeeContactButtons";
import EmployeeActions from "./EmployeeActions";
import { Calendar, Car } from "lucide-react";

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
      className="cursor-pointer hover:bg-gray-50"
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
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" /> {employee.workingDaysAWeek}
          </span>
          <span className="text-gray-400">|</span>
          <span className="inline-flex items-center text-gray-600">
            <Car className="h-4 w-4 mr-1" /> {employee.preferredVehicle.substring(0, 10)}{employee.preferredVehicle.length > 10 ? '...' : ''}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, index) => (
            <span 
              key={index} 
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                employee.preferredWorkingDays?.includes(day) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {day}
            </span>
          ))}
        </div>
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
