
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs, 
  driverStatusTab, 
  setDriverStatusTab
}) => {
  // Filter drivers by status
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");
  const formerDrivers = driverKPIs.filter(driver => driver.status === "former");

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
      </div>
      
      {/* Tabs for active/former drivers */}
      <Tabs value={driverStatusTab} onValueChange={setDriverStatusTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Aktive Fahrer ({activeDrivers.length})</TabsTrigger>
          <TabsTrigger value="former">Ehemalige Fahrer ({formerDrivers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <DriverTable drivers={activeDrivers} />
        </TabsContent>
        
        <TabsContent value="former">
          <DriverTable drivers={formerDrivers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverKPIs;
