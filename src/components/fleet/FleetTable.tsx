
import React, { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import VehicleDetails from "./VehicleDetails";
import FleetTableHeader from "./table/FleetTableHeader";
import FleetTableRow from "./table/FleetTableRow";
import EmptyState from "./table/EmptyState";
import DefleetDialog from "./table/DefleetDialog";

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
          <FleetTableHeader isDefleetView={isDefleetView} />
          <TableBody>
            {vehicles.length === 0 ? (
              <EmptyState isDefleetView={isDefleetView} />
            ) : (
              vehicles.map((vehicle) => (
                <FleetTableRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  isDefleetView={isDefleetView}
                  onViewDetails={handleViewDetails}
                  onOpenDefleetDialog={handleOpenDefleetDialog}
                  onReactivateVehicle={handleReactivateVehicle}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <VehicleDetails 
        vehicle={selectedVehicle} 
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdateVehicle={onUpdateVehicle}
      />

      <DefleetDialog
        selectedVehicle={selectedVehicle}
        open={isDefleetDialogOpen}
        defleetDate={defleetDate}
        onOpenChange={setIsDefleetDialogOpen}
        onDefleetDateChange={setDefleetDate}
        onDefleet={handleDefleet}
      />
    </>
  );
};

export default FleetTable;
