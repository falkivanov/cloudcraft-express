
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  Archive, 
  ArchiveRestore, 
  Edit, 
  FileText,
  Car,
  Calendar,
  AlertTriangle
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FleetTableRowProps {
  vehicle: Vehicle;
  isDefleetView: boolean;
  onViewDetails: (vehicle: Vehicle) => void;
  onOpenDefleetDialog: (vehicle: Vehicle) => void;
  onReactivateVehicle: (vehicle: Vehicle) => void;
  onStatusChange: (vehicleId: string, newStatus: "Aktiv" | "In Werkstatt") => void;
}

const FleetTableRow = ({ 
  vehicle, 
  isDefleetView, 
  onViewDetails, 
  onOpenDefleetDialog, 
  onReactivateVehicle,
  onStatusChange
}: FleetTableRowProps) => {
  const formatDateString = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      console.error("Invalid date format", error);
      return dateString;
    }
  };

  const handleDoubleClick = () => {
    onViewDetails(vehicle);
  };

  // Determine if vehicle has upcoming appointments
  const hasAppointments = vehicle.appointments && vehicle.appointments.length > 0;
  const hasUpcomingAppointments = hasAppointments && vehicle.appointments!.some(
    appointment => !appointment.completed && new Date(appointment.date) > new Date()
  );

  return (
    <TableRow 
      key={vehicle.id} 
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer"
    >
      <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
      <TableCell>{vehicle.brand}</TableCell>
      <TableCell>{vehicle.model}</TableCell>
      <TableCell>{vehicle.vinNumber}</TableCell>
      <TableCell>
        {!isDefleetView ? (
          <Select 
            defaultValue={vehicle.status}
            onValueChange={(value: "Aktiv" | "In Werkstatt") => 
              onStatusChange(vehicle.id, value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                <StatusBadge status={vehicle.status} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktiv">
                <StatusBadge status="Aktiv" />
              </SelectItem>
              <SelectItem value="In Werkstatt">
                <StatusBadge status="In Werkstatt" />
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={vehicle.status} />
        )}
      </TableCell>
      <TableCell>{formatDateString(vehicle.infleetDate)}</TableCell>
      {isDefleetView && <TableCell>{formatDateString(vehicle.defleetDate)}</TableCell>}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menü öffnen</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Fahrzeugaktionen</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => onViewDetails(vehicle)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Details anzeigen</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              <span>Fahrzeug bearbeiten</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Dokumente</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <Car className="mr-2 h-4 w-4" />
              <span>Fahrtenbuch</span>
            </DropdownMenuItem>
            
            {hasUpcomingAppointments && (
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                <span>Anstehende Termine</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {!isDefleetView && (
              <DropdownMenuItem 
                onClick={() => onOpenDefleetDialog(vehicle)}
                className="text-destructive"
              >
                <Archive className="mr-2 h-4 w-4" />
                <span>Defleet</span>
              </DropdownMenuItem>
            )}
            
            {isDefleetView && (
              <DropdownMenuItem onClick={() => onReactivateVehicle(vehicle)}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                <span>Reaktivieren</span>
              </DropdownMenuItem>
            )}
            
            {vehicle.status === "In Werkstatt" && (
              <DropdownMenuItem className="text-amber-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>In Werkstatt</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default FleetTableRow;
