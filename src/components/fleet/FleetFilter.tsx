
import React from "react";
import { Vehicle } from "@/types/vehicle";
import FleetSearch from "./filter/FleetSearch";
import FleetImport from "./filter/FleetImport";
import FleetExport from "./filter/FleetExport";

interface FleetFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vehicles: Vehicle[];
  onImportVehicles: (vehicles: Vehicle[]) => void;
}

const FleetFilter = ({ 
  searchQuery, 
  onSearchChange, 
  vehicles, 
  onImportVehicles 
}: FleetFilterProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-6 items-center">
      <FleetSearch 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange} 
      />
      <FleetImport onImportVehicles={onImportVehicles} />
      <FleetExport vehicles={vehicles} />
    </div>
  );
};

export default FleetFilter;
