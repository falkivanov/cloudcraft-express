
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MoreHorizontal, 
  Eye, 
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FleetTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const FleetTable = ({ vehicles, onUpdateVehicle }: FleetTableProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedVehicle(null);
    // Ensure body pointer events are re-enabled
    document.body.style.pointerEvents = 'auto';
  };

  const handleStatusChange = (vehicleId: string, newStatus: "Aktiv" | "In Werkstatt" | "Defleet") => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const updatedVehicle = { 
        ...vehicle, 
        status: newStatus,
        // If status is not 'Defleet', ensure defleetDate is null
        defleetDate: newStatus !== "Defleet" ? null : vehicle.defleetDate
      };
      onUpdateVehicle(updatedVehicle);
      
      toast({
        title: "Status aktualisiert",
        description: `Der Status des Fahrzeugs ${updatedVehicle.licensePlate} wurde auf ${newStatus} geändert.`,
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kennzeichen</TableHead>
              <TableHead>Marke</TableHead>
              <TableHead>Modell</TableHead>
              <TableHead>FIN (VIN)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Infleet Datum</TableHead>
              <TableHead>Defleet Datum</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.vinNumber}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={vehicle.status}
                    onValueChange={(value: "Aktiv" | "In Werkstatt" | "Defleet") => 
                      handleStatusChange(vehicle.id, value)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktiv">Aktiv</SelectItem>
                      <SelectItem value="In Werkstatt">In Werkstatt</SelectItem>
                      <SelectItem value="Defleet">Defleet</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{vehicle.infleetDate}</TableCell>
                <TableCell>{vehicle.defleetDate || "—"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menü öffnen</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(vehicle)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Löschen</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vehicle Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fahrzeugdetails</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Kennzeichen:</span>
                <span>{selectedVehicle.licensePlate}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Marke:</span>
                <span>{selectedVehicle.brand}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Modell:</span>
                <span>{selectedVehicle.model}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">FIN (VIN):</span>
                <span>{selectedVehicle.vinNumber}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Status:</span>
                <span>{selectedVehicle.status}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Infleet Datum:</span>
                <span>{selectedVehicle.infleetDate}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Defleet Datum:</span>
                <span>{selectedVehicle.defleetDate || "—"}</span>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleCloseDetails}>Schließen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FleetTable;
