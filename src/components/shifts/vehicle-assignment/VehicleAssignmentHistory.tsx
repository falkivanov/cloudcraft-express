
import React from "react";
import { Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { initialEmployees } from "@/data/sampleEmployeeData";
import VehicleAssignmentHistoryTable from "./history/VehicleAssignmentHistoryTable";
import VehicleAssignmentFilters from "./history/VehicleAssignmentFilters";
import { useVehicleAssignmentHistory } from "./history/useVehicleAssignmentHistory";
import { useEmployeeLoader } from "../vehicle-assignment/hooks/useEmployeeLoader";

const VehicleAssignmentHistory: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    selectedEmployee,
    setSelectedEmployee,
    sortedAssignments
  } = useVehicleAssignmentHistory();
  
  // Load employees using the hook
  const employees = useEmployeeLoader();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Car className="h-5 w-5" /> 
          Fahrzeugzuordnungshistorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <VehicleAssignmentFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            employees={employees}
          />
          
          <VehicleAssignmentHistoryTable assignments={sortedAssignments} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleAssignmentHistory;
