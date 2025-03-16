
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
}

const EmployeeFilter = ({ 
  searchQuery, 
  onSearchChange,
  employees,
  onImportEmployees,
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
      
      <EmployeeAdvancedFilter />
    </div>
  );
};

export default EmployeeFilter;
