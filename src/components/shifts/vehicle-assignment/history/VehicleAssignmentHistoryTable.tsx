
import React from "react";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import { Car } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VehicleAssignment } from "@/types/shift";

interface VehicleAssignmentHistoryTableProps {
  assignments: VehicleAssignment[];
}

const VehicleAssignmentHistoryTable: React.FC<VehicleAssignmentHistoryTableProps> = ({ 
  assignments 
}) => {
  if (assignments.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Car className="mx-auto h-16 w-16 mb-4 opacity-20" />
        <p>Keine Fahrzeugzuordnungen gefunden.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Mitarbeiter</TableHead>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>Kennzeichen</TableHead>
            <TableHead className="text-right">Zugewiesen am</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const assignDate = parse(assignment.date, "yyyy-MM-dd", new Date());
            const assignedDate = parse(assignment.assignedAt.split('T')[0], "yyyy-MM-dd", new Date());
            
            return (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="font-medium">
                    {format(assignDate, "dd.MM.yyyy", { locale: de })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(assignDate, "EEEE", { locale: de })}
                  </div>
                </TableCell>
                <TableCell>{assignment.employeeName}</TableCell>
                <TableCell>
                  {assignment.vehicleInfo.split(' (')[0]}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {assignment.vehicleInfo.match(/\((.*?)\)/)?.[1] || ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">{format(assignedDate, "dd.MM.yyyy", { locale: de })}</div>
                  <div className="text-xs text-muted-foreground">
                    von {assignment.assignedBy}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehicleAssignmentHistoryTable;
