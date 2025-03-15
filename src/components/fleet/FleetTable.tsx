
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
  Archive,
  ArchiveRestore
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import StatusBadge from "./StatusBadge";

interface FleetTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDefleet: (vehicle: Vehicle, defleetDate: string) => void;
  isDefleetView?: boolean;
}

const FleetTable = ({ 
  vehicles, 
  onUpdateVehicle, 
  onDefleet,
  isDefleetView = false 
}: FleetTableProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDefleetDialogOpen, setIsDefleetDialogOpen] = useState(false);
  const [defleetDate, setDefleetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
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

  const handleStatusChange = (vehicleId: string, newStatus: "Aktiv" | "In Werkstatt") => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const updatedVehicle = { 
        ...vehicle, 
        status: newStatus
      };
      onUpdateVehicle(updatedVehicle);
      
      toast({
        title: "Status aktualisiert",
        description: `Der Status des Fahrzeugs ${updatedVehicle.licensePlate} wurde auf ${newStatus} geändert.`,
      });
    }
  };

  const handleOpenDefleetDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDefleetDialogOpen(true);
  };

  const handleDefleet = () => {
    if (selectedVehicle) {
      onDefleet(selectedVehicle, defleetDate);
      setIsDefleetDialogOpen(false);
      setSelectedVehicle(null);
    }
  };

  const handleReactivateVehicle = (vehicle: Vehicle) => {
    const updatedVehicle = {
      ...vehicle,
      status: "Aktiv" as const,
      defleetDate: null
    };
    
    onUpdateVehicle(updatedVehicle);
    
    toast({
      title: "Fahrzeug reaktiviert",
      description: `Das Fahrzeug ${vehicle.licensePlate} wurde reaktiviert.`,
    });
  };

  return (
    <>
      <div className="rounded-md border w-full">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">Kennzeichen</TableHead>
              <TableHead className="w-[12%]">Marke</TableHead>
              <TableHead className="w-[12%]">Modell</TableHead>
              <TableHead className="w-[20%]">FIN (VIN)</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[15%]">Infleet Datum</TableHead>
              {isDefleetView && <TableHead className="w-[15%]">Defleet Datum</TableHead>}
              <TableHead className="text-right w-[10%]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDefleetView ? 8 : 7} className="h-32 text-center text-muted-foreground">
                  Keine Fahrzeuge gefunden
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell className="font-mono text-sm">{vehicle.vinNumber}</TableCell>
                  <TableCell>
                    {!isDefleetView ? (
                      <Select 
                        defaultValue={vehicle.status}
                        onValueChange={(value: "Aktiv" | "In Werkstatt") => 
                          handleStatusChange(vehicle.id, value)
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
                  <TableCell>{vehicle.infleetDate}</TableCell>
                  {isDefleetView && <TableCell>{vehicle.defleetDate || "—"}</TableCell>}
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
                        {!isDefleetView && (
                          <DropdownMenuItem onClick={() => handleOpenDefleetDialog(vehicle)}>
                            <Archive className="mr-2 h-4 w-4" />
                            <span>Defleet</span>
                          </DropdownMenuItem>
                        )}
                        {isDefleetView && (
                          <DropdownMenuItem onClick={() => handleReactivateVehicle(vehicle)}>
                            <ArchiveRestore className="mr-2 h-4 w-4" />
                            <span>Reaktivieren</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vehicle Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fahrzeugdetails</DialogTitle>
            <DialogDescription>
              Details zum ausgewählten Fahrzeug
            </DialogDescription>
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
              {selectedVehicle.defleetDate && (
                <div className="grid grid-cols-2 items-center gap-4">
                  <span className="font-medium">Defleet Datum:</span>
                  <span>{selectedVehicle.defleetDate}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleCloseDetails}>Schließen</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Defleet Dialog */}
      <Dialog open={isDefleetDialogOpen} onOpenChange={setIsDefleetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fahrzeug Defleet</DialogTitle>
            <DialogDescription>
              Wählen Sie das Defleet-Datum für das Fahrzeug aus.
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Kennzeichen:</span>
                <span>{selectedVehicle.licensePlate}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Defleet Datum:</span>
                <Input
                  type="date"
                  value={defleetDate}
                  onChange={(e) => setDefleetDate(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDefleetDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleDefleet}>Defleet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FleetTable;
