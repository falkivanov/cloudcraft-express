
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FleetTable from "./FleetTable";
import { Vehicle } from "@/types/vehicle";

type SortField = "licensePlate" | "brand" | "model" | "vinNumber" | "infleetDate";
type SortDirection = "asc" | "desc";

interface FleetTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredActiveVehicles: Vehicle[];
  filteredDefleetedVehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDefleet: (vehicle: Vehicle, defleetDate: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const FleetTabs = ({
  activeTab,
  setActiveTab,
  filteredActiveVehicles,
  filteredDefleetedVehicles,
  onUpdateVehicle,
  onDefleet,
  sortField,
  sortDirection,
  onSort
}: FleetTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="active">Aktive Fahrzeuge</TabsTrigger>
        <TabsTrigger value="defleeted">Defleeted Fahrzeuge</TabsTrigger>
      </TabsList>
      
      <div className="w-full overflow-x-auto">
        <TabsContent value="active" className="min-w-full">
          <FleetTable 
            vehicles={filteredActiveVehicles} 
            onUpdateVehicle={onUpdateVehicle}
            onDefleet={onDefleet}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
        </TabsContent>
        
        <TabsContent value="defleeted" className="min-w-full">
          <FleetTable 
            vehicles={filteredDefleetedVehicles} 
            onUpdateVehicle={onUpdateVehicle}
            onDefleet={onDefleet}
            isDefleetView={true}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default FleetTabs;
