
import React from "react";
import { ChevronDown, ChevronRight, Car } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FleetTable from "./FleetTable";

type SortField = "licensePlate" | "brand" | "model" | "vinNumber" | "infleetDate";
type SortDirection = "asc" | "desc";

interface VehicleGroupViewProps {
  groupedVehicles: Record<string, Vehicle[]>;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDefleet: (vehicle: Vehicle, defleetDate: string) => void;
  isDefleetView?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const VehicleGroupView = ({
  groupedVehicles,
  onUpdateVehicle,
  onDefleet,
  isDefleetView = false,
  sortField,
  sortDirection,
  onSort
}: VehicleGroupViewProps) => {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Initialize all groups as open
  React.useEffect(() => {
    const initialOpenState = Object.keys(groupedVehicles).reduce(
      (acc, groupName) => {
        acc[groupName] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setOpenGroups(initialOpenState);
  }, [groupedVehicles]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedVehicles).map(([groupName, vehicles]) => (
        <Collapsible
          key={groupName}
          open={openGroups[groupName]}
          onOpenChange={() => toggleGroup(groupName)}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{groupName}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({vehicles.length} {vehicles.length === 1 ? "Fahrzeug" : "Fahrzeuge"})
              </span>
            </div>
            {openGroups[groupName] ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FleetTable
              vehicles={vehicles}
              onUpdateVehicle={onUpdateVehicle}
              onDefleet={onDefleet}
              isDefleetView={isDefleetView}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default VehicleGroupView;
