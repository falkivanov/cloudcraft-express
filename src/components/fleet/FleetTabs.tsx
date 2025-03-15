
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FleetTable from "./FleetTable";
import { Vehicle } from "@/types/vehicle";

interface FleetTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredActiveVehicles: Vehicle[];
  filteredDefleetedVehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDefleet: (vehicle: Vehicle, defleetDate: string) => void;
}

const FleetTabs = ({
  activeTab,
  setActiveTab,
  filteredActiveVehicles,
  filteredDefleetedVehicles,
  onUpdateVehicle,
  onDefleet
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
          />
        </TabsContent>
        
        <TabsContent value="defleeted" className="min-w-full">
          <FleetTable 
            vehicles={filteredDefleetedVehicles} 
            onUpdateVehicle={onUpdateVehicle}
            onDefleet={onDefleet}
            isDefleetView={true}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default FleetTabs;
