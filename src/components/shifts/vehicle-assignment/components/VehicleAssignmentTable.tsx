
import React from "react";
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
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>Heute</TableHead>
            <TableHead>Morgen</TableHead>
            <TableHead>Hinweise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicleList.map(vehicle => (
            <VehicleTableRow
              key={vehicle.id}
              vehicle={vehicle}
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
