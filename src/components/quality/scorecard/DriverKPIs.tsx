
import React from "react";
import { DriverKPI, ScoreCardData } from "./types";
import DriverTable from "./driver/DriverTable";
import { useNavigate } from "react-router-dom";

export interface DriverKPIsProps {
  driverKPIs: DriverKPI[];
  previousWeekData: ScoreCardData | null;
}

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs,
  previousWeekData
}) => {
  const navigate = useNavigate();
  
  // Filter only active drivers
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");

  // Check if we have any drivers with the expected 14-character A-prefix format
  const hasExpectedFormat = driverKPIs.some(d => /^A[A-Z0-9]{13}$/.test(d.name));
  
  // More robust check for real data extraction
  const isRealData = 
    driverKPIs.length >= 40 &&  // Significant number of drivers
    hasExpectedFormat &&        // Has proper A-prefix IDs
    driverKPIs.every(driver => driver.metrics.length >= 4); // Has sufficient metrics
  
  // Store the real data flag in localStorage for persistence
  React.useEffect(() => {
    localStorage.setItem("extractedScorecardData", JSON.stringify({
      ...JSON.parse(localStorage.getItem("extractedScorecardData") || "{}"),
      isSampleData: !isRealData
    }));
  }, [isRealData]);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
        <div className="text-sm text-gray-500">
          {activeDrivers.length} Fahrer gefunden
          {hasExpectedFormat && " (14-stellige A-IDs)"}
        </div>
      </div>
      
      {activeDrivers.length > 0 ? (
        <DriverTable drivers={activeDrivers} />
      ) : (
        <div className="py-8 text-center text-gray-500 border rounded-md">
          <p className="mb-4">Keine Fahrerdaten verfügbar</p>
        </div>
      )}
    </div>
  );
};

export default DriverKPIs;
