
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadIcon, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

const QualityPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [customerContactData, setCustomerContactData] = useState<string | null>(null);
  const [scorecardData, setScoreCardData] = useState<any>(null);
  const [podData, setPodData] = useState<any>(null);
  const [concessionsData, setConcessionsData] = useState<any>(null);
  const [driversData, setDriversData] = useState<DriverComplianceData[]>([]);
  
  // Beim Laden der Komponente und bei Änderung des Pfads
  // die Daten aus dem LocalStorage laden
  useEffect(() => {
    if (pathname.includes("/quality/customer-contact")) {
      const data = localStorage.getItem("customerContactData");
      setCustomerContactData(data);
      
      // Parse HTML to extract driver compliance data
      if (data) {
        parseCustomerContactData(data);
      }
    } else if (pathname.includes("/quality/scorecard")) {
      try {
        const data = localStorage.getItem("scorecardData");
        if (data) {
          setScoreCardData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing scorecard data:", error);
      }
    } else if (pathname.includes("/quality/pod")) {
      try {
        const data = localStorage.getItem("podData");
        if (data) {
          setPodData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing POD data:", error);
      }
    } else if (pathname.includes("/quality/concessions")) {
      try {
        const data = localStorage.getItem("concessionsData");
        if (data) {
          setConcessionsData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing concessions data:", error);
      }
    }
  }, [pathname]);
  
  // Parse customer contact HTML to extract driver data
  const parseCustomerContactData = (htmlContent: string) => {
    try {
      // Create a DOM parser to extract data from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
      // Find table rows with driver data
      const rows = doc.querySelectorAll("table tr");
      const extractedData: DriverComplianceData[] = [];
      
      // Skip header row, start from index 1
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        if (cells.length >= 6) { // Make sure we have enough cells
          const fullName = cells[0].textContent?.trim() || "";
          const nameParts = fullName.split(" ");
          const firstName = nameParts[0] || "";
          const totalAddresses = parseInt(cells[1].textContent?.trim() || "0", 10);
          const totalContacts = parseInt(cells[2].textContent?.trim() || "0", 10);
          const complianceText = cells[5].textContent?.trim() || "0%";
          const compliancePercentage = parseFloat(complianceText.replace("%", ""));
          
          extractedData.push({
            name: fullName,
            firstName,
            totalAddresses,
            totalContacts,
            compliancePercentage
          });
        }
      }
      
      setDriversData(extractedData);
    } catch (error) {
      console.error("Error parsing customer contact HTML:", error);
    }
  };
  
  // Generate personalized message for drivers with compliance below 98%
  const generateDriverMessage = (driver: DriverComplianceData) => {
    return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktiert, hast aber nur ${driver.totalContacts} kontaktiert. Immer wenn du ein Paket nicht zustellen kannst musst du den Kunden anrufen oder eine SMS schreiben. Bitte versuch diese Woche auf 100% zu kommen.`;
  };

  // Style for compliance values
  const getComplianceStyle = (percentage: number) => {
    return percentage < 98 
      ? "bg-red-100 text-red-800 font-semibold"
      : "bg-green-100 text-green-800 font-semibold";
  };
  
  // Determine which quality section to display based on the current path
  const renderContent = () => {
    if (pathname.includes("/quality/scorecard")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Scorecard</h2>
          <p className="mb-4">Hier finden Sie detaillierte Leistungskennzahlen und KPIs.</p>
          
          {scorecardData ? (
            <div className="mt-6 p-4 border rounded bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">Geladene Scorecard-Daten</h3>
              <p>Dateiname: {scorecardData.fileName}</p>
              <p>Dateityp: {scorecardData.type.toUpperCase()}</p>
              {/* Hier könnte eine spezifische Darstellung der Scorecard-Daten erfolgen */}
            </div>
          ) : (
            renderNoDataMessage("Scorecard")
          )}
        </div>
      );
    } else if (pathname.includes("/quality/customer-contact")) {
      return (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-background">
            <h2 className="text-2xl font-bold mb-4">Customer Contact</h2>
            <p className="mb-4">Kundenkontaktberichte und Kommunikationsanalysen.</p>
            
            {customerContactData ? (
              <div className="mt-6 space-y-6">
                {/* Enhanced display with colored compliance values */}
                <div 
                  className="max-h-[500px] overflow-auto border rounded p-4 bg-slate-50 customer-contact-report"
                  dangerouslySetInnerHTML={{ 
                    __html: customerContactData.replace(
                      /<td>(\d+(\.\d+)?)%<\/td>/g, 
                      (match, percentage) => {
                        const value = parseFloat(percentage);
                        const colorClass = value < 98 ? 'bg-red-100 text-red-800 font-semibold' : 'bg-green-100 text-green-800 font-semibold';
                        return `<td class="${colorClass} px-2 py-1 rounded">${value}%</td>`;
                      }
                    ) 
                  }} 
                />
                
                {/* Display personalized messages for drivers with compliance below 98% */}
                {driversData.filter(driver => driver.compliancePercentage < 98).length > 0 && (
                  <div className="mt-8 border rounded-lg p-4 bg-amber-50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Personalisierte Nachrichten für Fahrer mit Compliance unter 98%
                    </h3>
                    <div className="space-y-4">
                      {driversData
                        .filter(driver => driver.compliancePercentage < 98)
                        .map((driver, index) => (
                          <div key={index} className="p-3 bg-white rounded-md border">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-semibold">{driver.name}</span>
                              <Badge className={getComplianceStyle(driver.compliancePercentage)}>
                                {driver.compliancePercentage}%
                              </Badge>
                            </div>
                            <p className="text-sm">{generateDriverMessage(driver)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              renderNoDataMessage("Customer Contact")
            )}
          </div>
        </div>
      );
    } else if (pathname.includes("/quality/pod")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">POD (Proof of Delivery)</h2>
          <p className="mb-4">Liefernachweise und Zustellungsdokumentation.</p>
          
          {podData ? (
            <div className="mt-6 p-4 border rounded bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">Geladene POD-Daten</h3>
              <p>Dateiname: {podData.fileName}</p>
              <p>Dateityp: {podData.type.toUpperCase()}</p>
              {/* Hier könnte eine spezifische Darstellung der POD-Daten erfolgen */}
            </div>
          ) : (
            renderNoDataMessage("POD")
          )}
        </div>
      );
    } else if (pathname.includes("/quality/concessions")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Concessions</h2>
          <p className="mb-4">Übersicht zu Zugeständnissen und Ausnahmeregelungen.</p>
          
          {concessionsData ? (
            <div className="mt-6 p-4 border rounded bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">Geladene Concessions-Daten</h3>
              <p>Dateiname: {concessionsData.fileName}</p>
              <p>Dateityp: {concessionsData.type.toUpperCase()}</p>
              {/* Hier könnte eine spezifische Darstellung der Concessions-Daten erfolgen */}
            </div>
          ) : (
            renderNoDataMessage("Concessions")
          )}
        </div>
      );
    }
    
    // Default fallback (should not happen due to routing)
    return (
      <div className="p-4 border rounded-lg bg-background">
        <h2 className="text-2xl font-bold mb-4">Qualitätsmanagement</h2>
        <p>Wählen Sie eine Kategorie in der Seitenleiste aus.</p>
      </div>
    );
  };
  
  // Hilfsfunktion für die "Keine Daten" Meldung
  const renderNoDataMessage = (category: string) => {
    return (
      <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center">
        <p className="text-lg font-medium mb-3">Keine {category}-Daten verfügbar</p>
        <p className="text-muted-foreground mb-4">
          Bitte laden Sie zuerst eine Datei hoch, um die Daten hier anzuzeigen.
        </p>
        <Button asChild>
          <Link to="/file-upload" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            <span>Zur Upload-Seite</span>
          </Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Qualitätsmanagement</h1>
      {renderContent()}
    </div>
  );
};

export default QualityPage;
