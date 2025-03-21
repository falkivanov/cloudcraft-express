
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  activeVehicles, 
  getEmployeeName, 
  needsKeyChange, 
  getKeyChangeStyle,
  notAssignedPreferredVehicle 
} from "../utils/vehicleAssignmentUtils";

interface VehicleAssignmentTableProps {
  todayAssignments: Record<string, string>;
  tomorrowAssignments: Record<string, string>;
}

const VehicleAssignmentTable: React.FC<VehicleAssignmentTableProps> = ({
  todayAssignments,
  tomorrowAssignments
}) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formattedToday = format(today, "dd.MM.yyyy", { locale: de });
  const formattedTomorrow = format(tomorrow, "dd.MM.yyyy", { locale: de });

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Fahrzeug</TableHead>
            <TableHead className="w-1/3">{formattedToday}</TableHead>
            <TableHead className="w-1/3">{formattedTomorrow}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeVehicles.map(vehicle => {
            const tomorrowEmployeeId = tomorrowAssignments[vehicle.id];
            const keyChangeStatus = needsKeyChange(todayAssignments, vehicle.id, tomorrowEmployeeId);
            const cellStyle = getKeyChangeStyle(keyChangeStatus);
            const isNotPreferred = notAssignedPreferredVehicle(tomorrowEmployeeId, vehicle.id);
            
            return (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="font-medium">{vehicle.licensePlate}</div>
                  <div className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</div>
                </TableCell>
                <TableCell>
                  {todayAssignments[vehicle.id] ? (
                    <div>{getEmployeeName(todayAssignments[vehicle.id])}</div>
                  ) : (
                    <div className="text-muted-foreground">Nicht zugewiesen</div>
                  )}
                </TableCell>
                <TableCell className={cellStyle}>
                  {tomorrowEmployeeId ? (
                    <div className="flex items-center">
                      <div>{getEmployeeName(tomorrowEmployeeId)}</div>
                      {isNotPreferred && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-4 w-4 text-amber-500 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mitarbeiter erhält nicht das präferierte Fahrzeug</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Noch nicht zugewiesen</div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehicleAssignmentTable;
