
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, List, Grid2X2 } from "lucide-react";
import FleetFilter from "@/components/fleet/FleetFilter";
import FleetTabs from "@/components/fleet/FleetTabs";
import FleetStatsOverview from "@/components/fleet/FleetStatsOverview";
import CostSummaryDashboard from "@/components/fleet/CostSummaryDashboard";
import NewVehicleDialog from "@/components/fleet/NewVehicleDialog";
import { useVehicleData } from "@/hooks/useVehicleData";
import { useGroupedVehicles } from "@/hooks/useGroupedVehicles";
import VehicleGroupView from "@/components/fleet/VehicleGroupView";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FleetPage = () => {
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "group">("list");
  const [groupBy, setGroupBy] = useState<"brand" | "model" | "status" | "none">("none");
  
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

  // Get grouped vehicles based on selected grouping option
  const groupedActiveVehicles = useGroupedVehicles(filteredActiveVehicles, viewMode === "group" ? groupBy : "none");
  const groupedDefleetedVehicles = useGroupedVehicles(filteredDefleetedVehicles, viewMode === "group" ? groupBy : "none");

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

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <FleetFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          vehicles={vehicles}
          onImportVehicles={handleImportVehicles}
        />
        
        <div className="flex items-center space-x-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "list" | "group")}>
            <ToggleGroupItem value="list" aria-label="Listenansicht">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="group" aria-label="Gruppierte Ansicht">
              <Grid2X2 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          {viewMode === "group" && (
            <Select 
              value={groupBy} 
              onValueChange={(value: "brand" | "model" | "status" | "none") => setGroupBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Gruppieren nach..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Gruppierung</SelectItem>
                <SelectItem value="brand">Nach Marke</SelectItem>
                <SelectItem value="model">Nach Modell</SelectItem>
                <SelectItem value="status">Nach Status</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        {viewMode === "list" ? (
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
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="mb-4 border-b">
              <ToggleGroup type="single" value={activeTab} onValueChange={(value) => value && setActiveTab(value)}>
                <ToggleGroupItem value="active" className="rounded-none border-b-2 border-transparent data-[state=on]:border-primary data-[state=on]:bg-transparent px-4">
                  Aktive Fahrzeuge
                </ToggleGroupItem>
                <ToggleGroupItem value="defleeted" className="rounded-none border-b-2 border-transparent data-[state=on]:border-primary data-[state=on]:bg-transparent px-4">
                  Defleeted Fahrzeuge
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            {activeTab === "active" && (
              <VehicleGroupView 
                groupedVehicles={groupedActiveVehicles}
                onUpdateVehicle={handleUpdateVehicle}
                onDefleet={handleDefleetVehicle}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            )}
            
            {activeTab === "defleeted" && (
              <VehicleGroupView 
                groupedVehicles={groupedDefleetedVehicles}
                onUpdateVehicle={handleUpdateVehicle}
                onDefleet={handleDefleetVehicle}
                isDefleetView={true}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            )}
          </div>
        )}
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
