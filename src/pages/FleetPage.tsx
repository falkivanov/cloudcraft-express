
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import FleetFilter from "@/components/fleet/FleetFilter";
import FleetTabs from "@/components/fleet/FleetTabs";
import FleetStatsOverview from "@/components/fleet/FleetStatsOverview";
import CostSummaryDashboard from "@/components/fleet/CostSummaryDashboard";
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
    handleImportVehicles,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter
  } = useVehicleData();

  // Handle filter by card click
  const handleStatusFilterChange = (newStatusFilter: "all" | "active" | "workshop") => {
    setStatusFilter(newStatusFilter);
    // When filtering by status, we should also set the active tab to "active"
    // to show the filtered vehicles in the active vehicles tab
    setActiveTab("active");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fuhrpark</h1>
        <Button onClick={() => setIsNewVehicleDialogOpen(true)}>
          <Car className="mr-2" />
          Neues Fahrzeug
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FleetStatsOverview 
          vehicles={vehicles} 
          onFilterChange={handleStatusFilterChange}
          activeFilter={statusFilter}
        />
        <CostSummaryDashboard vehicles={vehicles} />
      </div>

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
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
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
