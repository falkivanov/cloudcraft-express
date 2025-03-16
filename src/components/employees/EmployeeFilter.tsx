
import React from "react";
import { Employee } from "@/types/employee";
import EmployeeSearch from "./filter/EmployeeSearch";
import EmployeeImport from "./filter/EmployeeImport";
import EmployeeExport from "./filter/EmployeeExport";
import EmployeeAdvancedFilter from "./filter/EmployeeAdvancedFilter";

interface EmployeeFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  employees: Employee[];
  onImportEmployees?: (employees: Employee[]) => void;
  workingDaysFilter: number | null;
  onWorkingDaysFilterChange: (value: number | null) => void;
  vehicleFilter: string;
  onVehicleFilterChange: (value: string) => void;
  uniqueVehicles: string[];
}

const EmployeeFilter = ({ 
  searchQuery, 
  onSearchChange,
  employees,
  onImportEmployees,
  workingDaysFilter,
  onWorkingDaysFilterChange,
  vehicleFilter,
  onVehicleFilterChange,
  uniqueVehicles
}: EmployeeFilterProps) => {
  return (
    <div className="space-y-4 mb-6 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-center">
        <EmployeeSearch 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
        />
        <EmployeeImport onImportEmployees={onImportEmployees} />
        <EmployeeExport employees={employees} />
      </div>
      
      <EmployeeAdvancedFilter
        workingDaysFilter={workingDaysFilter}
        onWorkingDaysFilterChange={onWorkingDaysFilterChange}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={onVehicleFilterChange}
        uniqueVehicles={uniqueVehicles}
      />
    </div>
  );
};

export default EmployeeFilter;
