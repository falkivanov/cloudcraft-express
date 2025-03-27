
import React from "react";
import { format, addDays, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { activeVehicles } from "../utils/vehicleAssignmentUtils";
import { useAssignmentState } from "../hooks/useAssignmentState";
import { useEmployeeLoader } from "../hooks/useEmployeeLoader";
import VehicleTableRow from "./VehicleTableRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface VehicleAssignmentTableProps {
  todayAssignments: Record<string, string>;
  tomorrowAssignments: Record<string, string>;
}

const VehicleAssignmentTable: React.FC<VehicleAssignmentTableProps> = ({
  todayAssignments,
  tomorrowAssignments
}) => {
  const { assignmentMap, handleAssignmentChange } = useAssignmentState(tomorrowAssignments);
  const employees = useEmployeeLoader();
  const vehicleList = activeVehicles();
  
  // Get dates for column headers
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  
  // Generate yesterday assignments (2 days ago compared to tomorrow)
  // This is a simple mock. In a real app, you would load this from your backend or localStorage
  const yesterdayAssignments: Record<string, string> = {};
  vehicleList.forEach(vehicle => {
    // For this example, we'll just use a different assignment than today
    // In a real app, you would load the actual data for 2 days ago
    if (todayAssignments[vehicle.id]) {
      // Just use a different assignment than today for demonstration
      const employeeIndex = parseInt(todayAssignments[vehicle.id]) % employees.length;
      yesterdayAssignments[vehicle.id] = employeeIndex.toString();
    }
  });
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>{format(yesterday, "EEEE, dd.MM", { locale: de })}</TableHead>
            <TableHead>{format(today, "EEEE, dd.MM", { locale: de })}</TableHead>
            <TableHead>{format(tomorrow, "EEEE, dd.MM", { locale: de })}</TableHead>
            <TableHead>Hinweise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicleList.map(vehicle => (
            <VehicleTableRow
              key={vehicle.id}
              vehicle={vehicle}
              yesterdayEmployeeId={yesterdayAssignments[vehicle.id]}
              todayEmployeeId={todayAssignments[vehicle.id]}
              assignedEmployeeId={assignmentMap[vehicle.id] || ""}
              employees={employees}
              onAssignmentChange={handleAssignmentChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehicleAssignmentTable;
