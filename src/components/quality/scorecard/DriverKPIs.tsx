
import React from "react";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs
}) => {
  // Filter only active drivers
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
      </div>
      
      <DriverTable drivers={activeDrivers} />
    </div>
  );
};

export default DriverKPIs;
