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

  const getRowBackgroundColor = () => {
    if (employee.endDate === null) {
      return "";
    } else {
      const daysSinceEnd = Math.floor(
        (new Date().getTime() - new Date(employee.endDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceEnd < 30) {
        return "bg-orange-50";
      }
      return "bg-gray-50";
    }
  };

  const telegramLink = employee.telegramUsername ? 
    `https://t.me/${employee.telegramUsername.replace('@', '')}` : null;
    
  const isFullTimeEmployee = employee.workingDaysAWeek >= 5;

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
        <span className="inline-flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-1" /> {employee.workingDaysAWeek}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center text-gray-600">
          <Car className="h-4 w-4 mr-1" /> {employee.preferredVehicle}
        </span>
      </TableCell>
      <TableCell>
        {isFullTimeEmployee ? (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
            Vollzeit
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa"].map((day, index) => (
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
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <EmployeeContactButtons phone={employee.phone} />
          
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
