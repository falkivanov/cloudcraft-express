
import { useState } from "react";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";

export const useFleetTable = (
  vehicles: Vehicle[],
  onUpdateVehicle: (vehicle: Vehicle) => void,
  onDefleet: (vehicle: Vehicle, defleetDate: string) => void,
  isDefleetView: boolean = false
) => {
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

  return {
    selectedVehicle,
    isDetailsOpen,
    isDefleetDialogOpen,
    defleetDate,
    setIsDetailsOpen,
    setDefleetDate,
    setIsDefleetDialogOpen,
    handleViewDetails,
    handleCloseDetails,
    handleStatusChange,
    handleOpenDefleetDialog,
    handleDefleet,
    handleReactivateVehicle
  };
};
