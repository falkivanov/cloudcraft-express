
import React from "react";
import { format } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface VehicleAssignmentTableProps {
  yesterdayAssignments: Record<string, string>;
  todayAssignments: Record<string, string>;
  tomorrowAssignments: Record<string, string>;
  yesterdayDateKey: string;
  todayDateKey: string;
  tomorrowDateKey: string;
}

const VehicleAssignmentTable: React.FC<VehicleAssignmentTableProps> = ({
  yesterdayAssignments,
  todayAssignments,
  tomorrowAssignments,
  yesterdayDateKey,
  todayDateKey,
  tomorrowDateKey
}) => {
  const { assignmentMap, handleAssignmentChange } = useAssignmentState(tomorrowAssignments);
  const { employees, filteredEmployees, searchQuery, setSearchQuery } = useEmployeeLoader();
  const vehicleList = activeVehicles();
  
  // Parse dates from date keys
  const yesterday = new Date(yesterdayDateKey);
  const today = new Date(todayDateKey);
  const tomorrow = new Date(tomorrowDateKey);
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Mitarbeiter suchen (z.B. Namen oder '100%' für volle Verfügbarkeit)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
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
                employees={searchQuery ? filteredEmployees : employees}
                onAssignmentChange={handleAssignmentChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VehicleAssignmentTable;
