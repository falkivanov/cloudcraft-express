
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
  Edit, 
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import VehicleForm from "./VehicleForm";

interface FleetTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const FleetTable = ({ vehicles, onUpdateVehicle }: FleetTableProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedVehicle(null);
    // Ensure body pointer events are re-enabled
    document.body.style.pointerEvents = 'auto';
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedVehicle(null);
    // Ensure body pointer events are re-enabled
    document.body.style.pointerEvents = 'auto';
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.status}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Bearbeiten</span>
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
                <span className="font-medium">VIN:</span>
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
                <span>{selectedVehicle.defleetDate || "N/A"}</span>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleCloseDetails}>Schließen</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Fahrzeug bearbeiten</SheetTitle>
          </SheetHeader>
          {selectedVehicle && (
            <VehicleForm 
              vehicle={selectedVehicle} 
              onSubmit={(updatedVehicle) => {
                onUpdateVehicle(updatedVehicle);
                handleCloseEdit();
              }}
              onCancel={handleCloseEdit}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FleetTable;
