
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeTable from "./EmployeeTable";
import { Employee } from "@/types/employee";

type SortField = "name" | "startDate" | "workingDaysAWeek" | "preferredVehicle";
type SortDirection = "asc" | "desc";

interface EmployeeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredActiveEmployees: Employee[];
  filteredFormerEmployees: Employee[];
  onUpdateEmployee: (employee: Employee) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const EmployeeTabs = ({
  activeTab,
  setActiveTab,
  filteredActiveEmployees,
  filteredFormerEmployees,
  onUpdateEmployee,
  sortField,
  sortDirection,
  onSort
}: EmployeeTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="active">Aktive Mitarbeiter</TabsTrigger>
        <TabsTrigger value="former">Ehemalige Mitarbeiter</TabsTrigger>
      </TabsList>
      
      <div className="w-full overflow-x-auto">
        <TabsContent value="active" className="min-w-full min-h-[500px] w-full">
          <div className="border rounded-lg w-full">
            <EmployeeTable 
              employees={filteredActiveEmployees} 
              onUpdateEmployee={onUpdateEmployee}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="former" className="min-w-full min-h-[500px] w-full">
          <div className="border rounded-lg w-full">
            <EmployeeTable 
              employees={filteredFormerEmployees} 
              onUpdateEmployee={onUpdateEmployee}
              isFormerView={true}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EmployeeTabs;
