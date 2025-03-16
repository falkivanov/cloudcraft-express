
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { qualitySubItems } from "../navbar/navigationItems";

const QualityTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Bestimme den aktiven Tab basierend auf dem aktuellen Pfad
  const getActiveTab = () => {
    if (pathname.includes("scorecard")) return "scorecard";
    if (pathname.includes("customer-contact")) return "customer-contact";
    if (pathname.includes("pod")) return "pod";
    if (pathname.includes("concessions")) return "concessions";
    return "scorecard"; // Default
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    // Navigiere zur entsprechenden Unterseite
    switch (value) {
      case "scorecard":
        navigate("/quality/scorecard");
        break;
      case "customer-contact":
        navigate("/quality/customer-contact");
        break;
      case "pod":
        navigate("/quality/pod");
        break;
      case "concessions":
        navigate("/quality/concessions");
        break;
      default:
        navigate("/quality/scorecard");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6 grid grid-cols-4 w-full">
        <TabsTrigger value="scorecard" className="flex items-center gap-2">
          {qualitySubItems[0].icon}
          <span className="hidden md:inline">{qualitySubItems[0].name}</span>
        </TabsTrigger>
        <TabsTrigger value="customer-contact" className="flex items-center gap-2">
          {qualitySubItems[1].icon}
          <span className="hidden md:inline">{qualitySubItems[1].name}</span>
        </TabsTrigger>
        <TabsTrigger value="pod" className="flex items-center gap-2">
          {qualitySubItems[2].icon}
          <span className="hidden md:inline">{qualitySubItems[2].name}</span>
        </TabsTrigger>
        <TabsTrigger value="concessions" className="flex items-center gap-2">
          {qualitySubItems[3].icon}
          <span className="hidden md:inline">{qualitySubItems[3].name}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="scorecard">
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Scorecard</h2>
          <p>Hier finden Sie detaillierte Leistungskennzahlen und KPIs.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="customer-contact">
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Customer Contact</h2>
          <p>Kundenkontaktberichte und Kommunikationsanalysen.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="pod">
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">POD (Proof of Delivery)</h2>
          <p>Liefernachweise und Zustellungsdokumentation.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="concessions">
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Concessions</h2>
          <p>Übersicht zu Zugeständnissen und Ausnahmeregelungen.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default QualityTabs;
