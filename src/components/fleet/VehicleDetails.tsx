
import React from "react";
import { Vehicle } from "@/types/vehicle";
import VehicleDetailsDialog from "./vehicle-details/VehicleDetailsDialog";

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const VehicleDetails = (props: VehicleDetailsProps) => {
  return <VehicleDetailsDialog {...props} />;
};

export default VehicleDetails;
