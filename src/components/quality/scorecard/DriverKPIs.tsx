
import React from "react";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";
import { calculateDriverScore } from "./driver/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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

  // Show an info message if we suspect the data is sample data
  const isSuspectedSampleData = 
    driverKPIs.length === 2 && 
    driverKPIs[0]?.name === "TR-001" && 
    driverKPIs[1]?.name === "TR-002";

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
      </div>
      
      {isSuspectedSampleData && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle>Hinweis zu Daten</AlertTitle>
          <AlertDescription>
            Die angezeigten Fahrerdaten konnten nicht aus der PDF extrahiert werden. 
            Bitte prüfen Sie die PDF oder laden Sie sie erneut hoch.
          </AlertDescription>
        </Alert>
      )}
      
      <DriverTable drivers={driversWithScores} />
    </div>
  );
};

export default DriverKPIs;
