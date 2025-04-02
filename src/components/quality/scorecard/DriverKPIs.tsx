
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

  // Check if we have any drivers with the expected 14-character A-prefix format
  const hasExactFormat = driverKPIs.some(d => /^A[A-Z0-9]{13}$/.test(d.name));
  
  // Check if we have any drivers with A-prefix but not exactly 14 characters
  const hasAnyAPrefixFormat = driverKPIs.some(d => /^A[A-Z0-9]{5,}/.test(d.name) && !(/^A[A-Z0-9]{13}$/.test(d.name)));
  
  // Show an info message if we suspect the data is sample data
  const isSuspectedSampleData = 
    (driverKPIs.length <= 3 && 
    driverKPIs.some(d => ["TR-001", "TR-002"].includes(d.name))) ||
    driverKPIs.length === 0;

  // Determine if we have too few drivers (likely extraction issue)
  const hasTooFewDrivers = driverKPIs.length > 0 && driverKPIs.length < 8;
  
  // Check if we have any drivers with 'A' prefix but not in the expected format
  const hasAnyAPrefix = driverKPIs.some(d => d.name.startsWith('A'));
  
  // Check if we might need to update extraction methods (no expected format found)
  const needsExtractionUpdate = driverKPIs.length > 0 && !hasExactFormat;
  
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
          {hasExactFormat && 
            " (14-stellige A-IDs)"
          }
          {hasAnyAPrefixFormat && 
            " (A-IDs mit unterschiedlicher Länge)"
          }
        </div>
      </div>
      
      {/* Show warning if few drivers or sample data detected */}
      {(isSuspectedSampleData || hasTooFewDrivers || needsExtractionUpdate) && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Problem mit Fahrerdaten</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {driverKPIs.length === 0 
                ? "Es wurden keine Fahrer in der PDF gefunden." 
                : hasTooFewDrivers 
                  ? `Es wurden nur ${driverKPIs.length} Fahrer gefunden, obwohl die PDF wahrscheinlich mehr enthält.`
                  : "Die extrahierten Fahrerdaten könnten unvollständig sein."}
            </p>
            
            {hasAnyAPrefix && !hasExactFormat && (
              <p>
                Es wurden Fahrer-IDs mit dem Präfix 'A' gefunden, aber nicht im erwarteten 14-stelligen Format.
              </p>
            )}
            
            {needsExtractionUpdate && (
              <p>
                Die PDF scheint in einem Format zu sein, das zusätzliche Anpassungen erfordert.
                {!hasExactFormat ? 
                  " Es wurden keine Fahrer im erwarteten Format (14-stellige IDs beginnend mit 'A') gefunden." : 
                  " Nicht alle Fahrer-IDs entsprechen dem erwarteten Format."}
              </p>
            )}
            
            <p>
              Mögliche Ursachen:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Das Format der Fahrertabelle wird nicht korrekt erkannt</li>
              <li>Die Tabellendaten sind nicht standardmäßig strukturiert</li>
              <li>Die PDF hat ein ungewöhnliches oder geändertes Layout</li>
              <li>Die Daten könnten auf mehreren Seiten verteilt sein</li>
            </ul>
            <p>
              Sie können:
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
