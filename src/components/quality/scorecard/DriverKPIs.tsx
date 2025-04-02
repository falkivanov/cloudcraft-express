
import React from "react";
import { DriverKPIsProps } from "./types";
import DriverTable from "./driver/DriverTable";
import { calculateDriverScore } from "./driver/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DriverKPIs: React.FC<DriverKPIsProps> = ({ 
  driverKPIs,
  previousWeekData
}) => {
  const navigate = useNavigate();
  
  // Filter only active drivers
  const activeDrivers = driverKPIs.filter(driver => driver.status === "active");

  // Calculate score for each driver
  const driversWithScores = activeDrivers.map(driver => {
    const score = calculateDriverScore(driver);
    return { ...driver, score };
  });

  // Show an info message if we suspect the data is sample data or problematic
  const isSuspectedSampleData = 
    (driverKPIs.length <= 3 && 
    driverKPIs.some(d => ["TR-001", "TR-002"].includes(d.name))) ||
    driverKPIs.length === 0;

  // Determine if we have too few drivers (likely extraction issue)
  const hasTooFewDrivers = driverKPIs.length > 0 && driverKPIs.length < 10;
  
  // Check if we have any drivers with 'A' prefix (expected format)
  const hasExpectedDriverFormat = driverKPIs.some(d => d.name.startsWith('A'));
  
  // Handle navigation to upload page
  const handleUploadClick = () => {
    navigate("/upload");
  };

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
      {(isSuspectedSampleData || hasTooFewDrivers || !hasExpectedDriverFormat) && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Problem mit Fahrerdaten</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Die Fahrerdaten konnten nicht vollständig aus der PDF extrahiert werden. 
              {driverKPIs.length === 0 ? 
                " Es wurden keine Fahrer gefunden." : 
                !hasExpectedDriverFormat ?
                " Es wurden keine Fahrer im erwarteten Format (beginnend mit 'A') gefunden." :
                driverKPIs.length < 10 ?
                ` Es wurden nur ${driverKPIs.length} Fahrer gefunden, obwohl die PDF wahrscheinlich mehr enthält.` :
                " Es wurden nur einige Beispielfahrer gefunden."}
            </p>
            <p>
              Dies kann verschiedene Ursachen haben:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Das Format der Fahrertabelle wird nicht korrekt erkannt</li>
              <li>Die "DSP WEEKLY SUMMARY" Tabelle wurde nicht gefunden</li>
              <li>Die PDF-Struktur ist ungewöhnlich oder wurde geändert</li>
            </ul>
            <p>
              Sie können eine neue PDF mit einem klareren Format hochladen:
            </p>
            <div className="pt-2">
              <Button variant="outline" onClick={handleUploadClick} className="flex items-center gap-2">
                <Upload size={16} />
                Neue PDF hochladen
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {driversWithScores.length > 0 ? (
        <DriverTable drivers={driversWithScores} />
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
