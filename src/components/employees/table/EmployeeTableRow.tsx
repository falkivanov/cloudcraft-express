
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Employee } from "@/types/employee";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeContactButtons from "./EmployeeContactButtons";
import EmployeeActions from "./EmployeeActions";
import { Calendar, Car, MessageCircle } from "lucide-react";

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

  // Get row background color based on status
  const getRowBackgroundColor = () => {
    if (employee.endDate === null) {
      // For active employees, no special color
      return "";
    } else {
      // For inactive employees, light gray background
      const daysSinceEnd = Math.floor(
        (new Date().getTime() - new Date(employee.endDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceEnd < 30) {
        return "bg-orange-50"; // Recently inactive
      }
      return "bg-gray-50"; // Long inactive
    }
  };

  // Create Telegram link if username exists
  const telegramLink = employee.telegramUsername ? 
    `https://t.me/${employee.telegramUsername.replace('@', '')}` : null;

  return (
    <TableRow 
      className={`cursor-pointer hover:bg-gray-100 ${getRowBackgroundColor()}`}
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
        <div className="flex items-center space-x-2">
          <EmployeeContactButtons email={employee.email} phone={employee.phone} />
          
          {telegramLink && (
            <a 
              href={telegramLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-50 rounded-full hover:bg-blue-100"
              title={`Telegram: ${employee.telegramUsername}`}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
        </div>
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
