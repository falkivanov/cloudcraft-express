
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
  
  // Show an info message if we suspect the data is sample data
  const isSuspectedSampleData = 
    (driverKPIs.length <= 3 && 
    driverKPIs.some(d => ["TR-001", "TR-002"].includes(d.name))) ||
    driverKPIs.length === 0;

  // Determine if we have too few drivers (likely extraction issue)
  const hasTooFewDrivers = driverKPIs.length > 0 && driverKPIs.length < 8;
  
  // Check for obvious data misalignment
  const hasMisalignedData = driverKPIs.length > 0 && checkForDataMisalignment(driverKPIs);
  
  // Check if we might need to update extraction methods
  const needsExtractionUpdate = driverKPIs.length > 0 && 
                               (!hasExpectedFormat && !hasAnyAPrefix);

  // Check if data is from real extraction
  const isRealData = localStorage.getItem("extractedScorecardData") 
    ? !JSON.parse(localStorage.getItem("extractedScorecardData") || "{}").isSampleData
    : true;
  
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
      
      {/* Show warning if few drivers or sample data detected */}
      {(isSuspectedSampleData || hasTooFewDrivers || needsExtractionUpdate || !isRealData || hasMisalignedData) && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Problem mit Fahrerdaten</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {driverKPIs.length === 0 
                ? "Es wurden keine Fahrer in der PDF gefunden." 
                : hasTooFewDrivers 
                  ? `Es wurden nur ${driverKPIs.length} Fahrer gefunden, obwohl die PDF wahrscheinlich mehr enthält.`
                  : !isRealData
                    ? "Die angezeigten Daten sind Beispieldaten, nicht aus der PDF extrahiert."
                    : hasMisalignedData
                      ? "Die extrahierten Daten scheinen nicht korrekt den Spalten zugeordnet zu sein."
                      : "Die extrahierten Fahrerdaten könnten unvollständig sein."}
            </p>
            
            {needsExtractionUpdate && (
              <p>
                Die PDF scheint in einem Format zu sein, das zusätzliche Anpassungen erfordert.
                {!hasExpectedFormat ? 
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
            </ul>
            
            {isRealData && (
              <p className="italic text-sm mt-2">
                Hinweis: Die PDF enthält möglicherweise maschinenlesbaren Text, der direkt kopiert werden kann. 
                Versuchen Sie alternativ, die Daten direkt aus der PDF zu kopieren und in eine Tabelle einzufügen.
              </p>
            )}
            
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

// Helper function to check for obvious misalignment in the driver data
function checkForDataMisalignment(drivers: DriverKPI[]): boolean {
  if (drivers.length < 2) return false;
  
  // Look for patterns that suggest incorrect column mapping
  // For example: All drivers have exactly the same metrics, or metrics are out of expected ranges
  
  const suspiciousCounts = {
    // Count how many drivers have the exact same DCR value
    sameDcr: new Map<number, number>(),
    // Count how many drivers have the exact same DNR DPMO value
    sameDnr: new Map<number, number>(),
    // Count unusually high values (potential misalignment)
    highDcr: 0, // DCR > 100%
    highPod: 0, // POD > 100%
    highCc: 0   // CC > 100%
  };
  
  // Analyze the data for suspicious patterns
  for (const driver of drivers) {
    for (const metric of driver.metrics) {
      if (metric.name === "DCR") {
        // Count occurrences of each DCR value
        const key = Math.round(metric.value * 10) / 10; // Round to 1 decimal
        suspiciousCounts.sameDcr.set(key, (suspiciousCounts.sameDcr.get(key) || 0) + 1);
        
        // Check for invalid range
        if (metric.value > 100) suspiciousCounts.highDcr++;
      }
      else if (metric.name === "DNR DPMO") {
        // Count occurrences of each DNR value
        const key = Math.round(metric.value);
        suspiciousCounts.sameDnr.set(key, (suspiciousCounts.sameDnr.get(key) || 0) + 1);
      }
      else if (metric.name === "POD" && metric.value > 100) {
        suspiciousCounts.highPod++;
      }
      else if (metric.name === "CC" && metric.value > 100) {
        suspiciousCounts.highCc++;
      }
    }
  }
  
  // Determine if there are suspicious patterns
  
  // Check if more than 80% of drivers have the exact same DCR value (suspicious)
  let mostCommonDcrCount = 0;
  for (const count of suspiciousCounts.sameDcr.values()) {
    if (count > mostCommonDcrCount) mostCommonDcrCount = count;
  }
  
  // Check if more than 80% of drivers have the exact same DNR value (suspicious)
  let mostCommonDnrCount = 0;
  for (const count of suspiciousCounts.sameDnr.values()) {
    if (count > mostCommonDnrCount) mostCommonDnrCount = count;
  }
  
  const dcrRatio = mostCommonDcrCount / drivers.length;
  const dnrRatio = mostCommonDnrCount / drivers.length;
  
  // If there are suspicious patterns, it suggests misaligned data
  return (
    dcrRatio > 0.8 || // More than 80% have same DCR
    dnrRatio > 0.8 || // More than 80% have same DNR
    suspiciousCounts.highDcr > drivers.length * 0.1 || // More than 10% have DCR > 100%
    suspiciousCounts.highPod > drivers.length * 0.1 || // More than 10% have POD > 100%
    suspiciousCounts.highCc > drivers.length * 0.1    // More than 10% have CC > 100%
  );
}

export default DriverKPIs;
