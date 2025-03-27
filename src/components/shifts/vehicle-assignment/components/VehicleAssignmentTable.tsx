
import React, { useState } from "react";
import { activeVehicles, getEmployeeName, needsKeyChange, getKeyChangeStyle, notAssignedPreferredVehicle } from "../utils/vehicleAssignmentUtils";
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initialEmployees } from "@/data/sampleEmployeeData";

interface VehicleAssignmentTableProps {
  todayAssignments: Record<string, string>;
  tomorrowAssignments: Record<string, string>;
}

const VehicleAssignmentTable: React.FC<VehicleAssignmentTableProps> = ({
  todayAssignments,
  tomorrowAssignments
}) => {
  const [assignmentMap, setAssignmentMap] = useState(tomorrowAssignments);
  
  // Load employees from localStorage
  const [employees, setEmployees] = useState(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          return parsedEmployees.filter(emp => emp.status === "Aktiv");
        }
      }
      return initialEmployees.filter(emp => emp.status === "Aktiv");
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
      return initialEmployees.filter(emp => emp.status === "Aktiv");
    }
  });
  
  React.useEffect(() => {
    setAssignmentMap(tomorrowAssignments);
  }, [tomorrowAssignments]);

  const handleAssignmentChange = (vehicleId: string, employeeId: string) => {
    setAssignmentMap(prev => {
      // Handle unassignment
      if (employeeId === "none") {
        const newMap = { ...prev };
        delete newMap[vehicleId];
        return newMap;
      }
      
      // First remove if this employee is already assigned elsewhere
      const updatedMap = { ...prev };
      Object.keys(updatedMap).forEach(vId => {
        if (updatedMap[vId] === employeeId) {
          delete updatedMap[vId];
        }
      });
      
      // Now assign to the new vehicle
      return {
        ...updatedMap,
        [vehicleId]: employeeId
      };
    });
  };

  const vehicleList = activeVehicles();
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Fahrzeug</th>
            <th className="text-left px-4 py-3 font-medium">Heute</th>
            <th className="text-left px-4 py-3 font-medium">Morgen</th>
            <th className="text-left px-4 py-3 font-medium">Hinweise</th>
          </tr>
        </thead>
        <tbody>
          {vehicleList.map(vehicle => {
            const todayEmployeeId = todayAssignments[vehicle.id];
            const employeeId = assignmentMap[vehicle.id] || "";
            const keyChangeStatus = needsKeyChange(
              todayAssignments,
              vehicle.id,
              employeeId
            );
            const notPreferred = notAssignedPreferredVehicle(employeeId, vehicle.id);
            
            return (
              <tr 
                key={vehicle.id} 
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
                    value={employeeId || "none"}
                    onValueChange={(value) => handleAssignmentChange(vehicle.id, value)}
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
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleAssignmentTable;
