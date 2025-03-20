
import React from "react";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";
import { calculateDriverScore } from "./driver/utils";

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs,
  previousWeekData
}) => {
  // Filter only active drivers
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");

  // Calculate score for each driver
  const driversWithScores = activeDrivers.map(driver => {
    const score = calculateDriverScore(driver);
    return { ...driver, score };
  });

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
      </div>
      
      <DriverTable drivers={driversWithScores} />
    </div>
  );
};

export default DriverKPIs;
