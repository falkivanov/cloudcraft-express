
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import FleetFilter from "@/components/fleet/FleetFilter";
import FleetTabs from "@/components/fleet/FleetTabs";
import NewVehicleDialog from "@/components/fleet/NewVehicleDialog";
import { useVehicleData } from "@/hooks/useVehicleData";
import { useSidebar } from "@/components/ui/sidebar";

const FleetPage = () => {
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  const { setOpen } = useSidebar();
  
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle
  } = useVehicleData();

  useEffect(() => {
    const handleMouseMove = () => {
      document.body.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setOpen]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fuhrpark</h1>
        <Button onClick={() => setIsNewVehicleDialogOpen(true)}>
          <Car className="mr-2" />
          Neues Fahrzeug
        </Button>
      </div>

      <FleetFilter 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
