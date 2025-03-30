
import React from "react";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";
import { calculateDriverScore } from "./driver/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Show an info message if we suspect the data is sample data or problematic
  const isSuspectedSampleData = 
    (driverKPIs.length <= 2 && 
    driverKPIs.some(d => ["TR-001", "TR-002"].includes(d.name))) ||
    driverKPIs.length === 0;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
        <div className="text-sm text-gray-500">
          {driversWithScores.length} Fahrer gefunden
        </div>
      </div>
      
      {/* Show warning if few drivers or sample data detected */}
      {(isSuspectedSampleData || driverKPIs.length <= 1) ? (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Problem mit Fahrerdaten</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Die Fahrerdaten konnten nicht vollständig aus der PDF extrahiert werden. 
              {driverKPIs.length === 0 ? 
                " Es wurden keine Fahrer gefunden." : 
                driverKPIs.length === 1 ?
                " Es wurde nur ein Fahrer gefunden." :
                " Es wurden nur einige Beispielfahrer gefunden."}
            </p>
            <p>
              Bitte prüfen Sie die PDF oder laden Sie sie erneut hoch. Wenn das Problem weiterhin besteht, 
              könnte das Format der PDF nicht vollständig unterstützt werden.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}
      
      {driversWithScores.length > 0 ? (
        <DriverTable drivers={driversWithScores} />
      ) : (
        <div className="py-8 text-center text-gray-500 border rounded-md">
          <p className="mb-4">Keine Fahrerdaten verfügbar</p>
        </div>
      )}
    </div>
  );
};

export default DriverKPIs;
