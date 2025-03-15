
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import FleetFilter from "@/components/fleet/FleetFilter";
import FleetTabs from "@/components/fleet/FleetTabs";
import FleetStatsOverview from "@/components/fleet/FleetStatsOverview";
import NewVehicleDialog from "@/components/fleet/NewVehicleDialog";
import { useVehicleData } from "@/hooks/useVehicleData";

const FleetPage = () => {
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  
  const {
    vehicles,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles
  } = useVehicleData();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fuhrpark</h1>
        <Button onClick={() => setIsNewVehicleDialogOpen(true)}>
          <Car className="mr-2" />
          Neues Fahrzeug
        </Button>
      </div>

      <FleetStatsOverview vehicles={vehicles} />

      <FleetFilter 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vehicles={vehicles}
        onImportVehicles={handleImportVehicles}
      />

      <div className="w-full overflow-x-auto">
        <FleetTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredActiveVehicles={filteredActiveVehicles}
          filteredDefleetedVehicles={filteredDefleetedVehicles}
          onUpdateVehicle={handleUpdateVehicle}
          onDefleet={handleDefleetVehicle}
        />
      </div>
      
      <NewVehicleDialog 
        open={isNewVehicleDialogOpen}
        onOpenChange={setIsNewVehicleDialogOpen}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
};

export default FleetPage;
