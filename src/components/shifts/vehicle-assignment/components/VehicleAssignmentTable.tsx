
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
import { toast } from "sonner";

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
  const { filteredEmployees, searchQuery, setSearchQuery } = useEmployeeLoader();
  const vehicleList = activeVehicles();
  
  // Parse dates from date keys
  const yesterday = new Date(yesterdayDateKey);
  const today = new Date(todayDateKey);
  const tomorrow = new Date(tomorrowDateKey);
  
  // Improved search function with feedback
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Main search input changed to:", value);
    setSearchQuery(value);
    
    // Show feedback when searching for "100%" flexibility
    if (value.includes("100%") || value.includes("100")) {
      const flexibleEmployees = filteredEmployees.filter(emp => emp.isWorkingDaysFlexible);
      console.log(`Filtered to ${flexibleEmployees.length} employees with 100% flexibility`);
      
      toast.info(`Zeige ${flexibleEmployees.length} Mitarbeiter mit 100% Verfügbarkeit`);
    }
  };
  
  // Log the current state for debugging
  React.useEffect(() => {
    console.log(`Displaying ${filteredEmployees.length} employees. Search: "${searchQuery}"`);
    if (searchQuery.includes("100")) {
      console.log("Current filteredEmployees with 100% search:", 
        filteredEmployees.map(e => `${e.name} (flexible: ${e.isWorkingDaysFlexible})`));
    }
  }, [filteredEmployees.length, searchQuery]);
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Mitarbeiter suchen (z.B. Namen oder '100%' für volle Verfügbarkeit)"
          value={searchQuery}
          onChange={handleSearchChange}
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
                employees={filteredEmployees}
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
