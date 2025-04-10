
import React from "react";
import { DriverKPI, ScoreCardData } from "./types";
import DriverTable from "./driver/DriverTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  
  // Check if we have any drivers with 'A' prefix (not necessarily 14 characters)
  const hasAnyAPrefix = driverKPIs.some(d => d.name.startsWith('A'));
  
  // More robust check for real data extraction
  const isRealData = 
    driverKPIs.length >= 40 &&  // Significant number of drivers
    hasAnyAPrefix &&            // A-prefix drivers
    driverKPIs.every(driver => 
      driver.metrics.length === 7 &&  // Full set of metrics
      driver.metrics.some(metric => 
        metric.value !== 0 && metric.name !== "CE"
      )
    );
  
  // Store the real data flag in localStorage for persistence
  React.useEffect(() => {
    localStorage.setItem("extractedScorecardData", JSON.stringify({
      ...JSON.parse(localStorage.getItem("extractedScorecardData") || "{}"),
      isSampleData: !isRealData
    }));
  }, [isRealData]);

  // Handle navigation to upload page
  const handleUploadClick = () => {
    navigate("/file-upload");
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Fahrerkennzahlen</h2>
        <div className="text-sm text-gray-500">
          {activeDrivers.length} Fahrer gefunden
          {hasAnyAPrefix && " (A-IDs)" }
          {hasExpectedFormat && " (14-stellige A-IDs)"}
          {!isRealData && " (Beispieldaten)"}
        </div>
      </div>
      
      {/* Simplified warning condition */}
      {!isRealData && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Problem mit Fahrerdaten</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Die angezeigten Daten scheinen Beispieldaten zu sein oder 
              konnten nicht vollständig aus der PDF extrahiert werden.
            </p>
            
            <div className="pt-2 space-y-2">
              <Button variant="outline" onClick={handleUploadClick} className="flex items-center gap-2 w-full sm:w-auto">
                <Upload size={16} />
                Eine andere PDF-Version hochladen
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {activeDrivers.length > 0 ? (
        <DriverTable drivers={activeDrivers} />
      ) : (
        <div className="py-8 text-center text-gray-500 border rounded-md">
          <p className="mb-4">Keine Fahrerdaten verfügbar</p>
          <Button variant="outline" onClick={handleUploadClick} className="flex items-center gap-2">
            <Upload size={16} />
            PDF hochladen
          </Button>
        </div>
      )}
    </div>
  );
};

export default DriverKPIs;
