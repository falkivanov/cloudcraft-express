import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import FleetFilter from "@/components/fleet/FleetFilter";
import FleetTabs from "@/components/fleet/FleetTabs";
import FleetStatsOverview from "@/components/fleet/FleetStatsOverview";
import CostSummaryDashboard from "@/components/fleet/CostSummaryDashboard";
import NewVehicleDialog from "@/components/fleet/NewVehicleDialog";
import { useVehicleData } from "@/hooks/useVehicleData";
import { useGroupedVehicles } from "@/hooks/useGroupedVehicles";
import VehicleGroupView from "@/components/fleet/VehicleGroupView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container } from "@/components/ui/container";

const FleetPage = () => {
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<"brand" | "model" | "none">("none");
  
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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicles') {
        console.log('Vehicle data changed in another tab');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStatusFilterChange = (newStatusFilter: "all" | "active" | "workshop") => {
    setStatusFilter(newStatusFilter);
    setActiveTab("active");
  };

  const groupedActiveVehicles = useGroupedVehicles(filteredActiveVehicles, groupBy);
  const groupedDefleetedVehicles = useGroupedVehicles(filteredDefleetedVehicles, groupBy);

  return (
    <Container className="py-8">
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
          <Select 
            value={groupBy} 
            onValueChange={(value: "brand" | "model" | "none") => setGroupBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Gruppieren nach..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Gruppierung</SelectItem>
              <SelectItem value="brand">Nach Marke</SelectItem>
              <SelectItem value="model">Nach Modell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        {groupBy === "none" ? (
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
              <div className="flex">
                <button 
                  className={`px-4 py-2 ${activeTab === "active" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("active")}
                >
                  Aktive Fahrzeuge
                </button>
                <button 
                  className={`px-4 py-2 ${activeTab === "defleeted" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("defleeted")}
                >
                  Defleeted Fahrzeuge
                </button>
              </div>
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
    </Container>
  );
};

export default FleetPage;
