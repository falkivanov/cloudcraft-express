import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Link } from "react-router-dom";
import CustomerContactTable from "@/components/quality/CustomerContactTable";

const QualityPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [customerContactData, setCustomerContactData] = useState<string | null>(null);
  const [scorecardData, setScoreCardData] = useState<any>(null);
  const [podData, setPodData] = useState<any>(null);
  const [concessionsData, setConcessionsData] = useState<any>(null);
  
  // Beim Laden der Komponente und bei Änderung des Pfads
  // die Daten aus dem LocalStorage laden
  useEffect(() => {
    if (pathname.includes("/quality/customer-contact")) {
      const data = localStorage.getItem("customerContactData");
      setCustomerContactData(data);
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
              <div className="mt-6">
                <CustomerContactTable htmlContent={customerContactData} />
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
          <h2 className="text-2xl font-bold mb-4">POD</h2>
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
