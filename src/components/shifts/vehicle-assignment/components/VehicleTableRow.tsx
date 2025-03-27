
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Employee } from "@/types/employee";
import { getEmployeeName, needsKeyChange, getKeyChangeStyle, notAssignedPreferredVehicle } from "../utils/vehicleAssignmentUtils";

interface VehicleTableRowProps {
  vehicle: Vehicle;
  todayEmployeeId: string;
  assignedEmployeeId: string;
  employees: Employee[];
  onAssignmentChange: (vehicleId: string, employeeId: string) => void;
}

const VehicleTableRow: React.FC<VehicleTableRowProps> = ({
  vehicle,
  todayEmployeeId,
  assignedEmployeeId,
  employees,
  onAssignmentChange
}) => {
  const keyChangeStatus = needsKeyChange(
    { [vehicle.id]: todayEmployeeId },
    vehicle.id,
    assignedEmployeeId
  );
  
  const notPreferred = notAssignedPreferredVehicle(assignedEmployeeId, vehicle.id);
  
  return (
    <tr 
      className={`${getKeyChangeStyle(keyChangeStatus)} border-b`}
    >
      <td className="px-4 py-3">
        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
        <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
      </td>
      <td className="px-4 py-3">
        {getEmployeeName(todayEmployeeId)}
      </td>
      <td className="px-4 py-3">
        <Select 
          value={assignedEmployeeId || "none"}
          onValueChange={(value) => onAssignmentChange(vehicle.id, value)}
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="Mitarbeiter wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nicht zugewiesen</SelectItem>
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        {keyChangeStatus === "new" && (
          <div className="flex items-center text-xs text-blue-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Schlüsselübergabe notwendig
          </div>
        )}
        {keyChangeStatus === "exchange" && (
          <div className="flex items-center text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Schlüsseltausch notwendig
          </div>
        )}
        {notPreferred && (
          <div className="text-xs text-muted-foreground mt-1">
            Nicht bevorzugtes Fahrzeug
          </div>
        )}
      </td>
    </tr>
  );
};

export default VehicleTableRow;
