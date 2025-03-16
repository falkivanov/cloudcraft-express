
import React from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import VehicleDetails from "./VehicleDetails";
import FleetTableHeader from "./table/FleetTableHeader";
import FleetTableRow from "./table/FleetTableRow";
import EmptyState from "./table/EmptyState";
import DefleetDialog from "./table/DefleetDialog";
import { useFleetTable } from "@/hooks/useFleetTable";

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
  const {
    selectedVehicle,
    isDetailsOpen,
    isDefleetDialogOpen,
    defleetDate,
    setIsDetailsOpen,
    setDefleetDate,
    setIsDefleetDialogOpen,
    handleViewDetails,
    handleStatusChange,
    handleOpenDefleetDialog,
    handleDefleet,
    handleReactivateVehicle
  } = useFleetTable(vehicles, onUpdateVehicle, onDefleet, isDefleetView);

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
