
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs, 
  driverStatusTab, 
  setDriverStatusTab,
  previousWeekData
}) => {
  // Filter drivers by status
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");
  const formerDrivers = driverKPIs.filter(driver => driver.status === "former");

  return (
    <div className="space-y-4">
      {/* Section header with period */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
        {previousWeekData && (
          <span className="text-xs text-gray-500 italic">Vergleich: KW{previousWeekData.week}/{previousWeekData.year}</span>
        )}
      </div>
      
      {/* Tabs for active/former drivers */}
      <Tabs value={driverStatusTab} onValueChange={setDriverStatusTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Aktive Fahrer ({activeDrivers.length})</TabsTrigger>
          <TabsTrigger value="former">Ehemalige Fahrer ({formerDrivers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <DriverTable drivers={activeDrivers} previousWeekData={previousWeekData} />
        </TabsContent>
        
        <TabsContent value="former">
          <DriverTable drivers={formerDrivers} previousWeekData={previousWeekData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverKPIs;
