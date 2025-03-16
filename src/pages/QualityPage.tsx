
import React from "react";
import { useLocation } from "react-router-dom";

const QualityPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Determine which quality section to display based on the current path
  const renderContent = () => {
    if (pathname.includes("/quality/scorecard")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Scorecard</h2>
          <p>Hier finden Sie detaillierte Leistungskennzahlen und KPIs.</p>
        </div>
      );
    } else if (pathname.includes("/quality/customer-contact")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Customer Contact</h2>
          <p>Kundenkontaktberichte und Kommunikationsanalysen.</p>
        </div>
      );
    } else if (pathname.includes("/quality/pod")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">POD (Proof of Delivery)</h2>
          <p>Liefernachweise und Zustellungsdokumentation.</p>
        </div>
      );
    } else if (pathname.includes("/quality/concessions")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Concessions</h2>
          <p>Übersicht zu Zugeständnissen und Ausnahmeregelungen.</p>
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Qualitätsmanagement</h1>
      {renderContent()}
    </div>
  );
};

export default QualityPage;
