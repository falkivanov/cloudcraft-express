import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomerContactContent from "@/components/quality/CustomerContactContent";
import PodContent from "@/components/quality/PodContent";
import ConcessionsContent from "@/components/quality/ConcessionsContent";
import ScorecardContent from "@/components/quality/scorecard/ScorecardContent";
import ScorecardWeekSelector from "@/components/quality/scorecard/ScorecardWeekSelector";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";
import { getScorecardData } from "@/components/quality/scorecard/ScorecardDataProvider";

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
  
  const [selectedWeek, setSelectedWeek] = useState<string>("week-10-2025");
  
  useEffect(() => {
    if (pathname.includes("/quality/customer-contact")) {
      const data = localStorage.getItem("customerContactData");
      setCustomerContactData(data);
      
      if (data) {
        const parsedData = parseCustomerContactData(data);
        setDriversData(parsedData);
      }
    } else if (pathname.includes("/quality/scorecard")) {
      try {
        const data = localStorage.getItem("scorecardData");
        if (data) {
          const parsedScorecard = JSON.parse(data);
          setScoreCardData(parsedScorecard);
          
          const dummyData = getScorecardData(parsedScorecard);
          if (dummyData) {
            const weekId = `week-${dummyData.week}-${dummyData.year}`;
            setSelectedWeek(weekId);
          }
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
  
  const renderContent = () => {
    if (pathname.includes("/quality/scorecard")) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Scorecard</h2>
            <ScorecardWeekSelector 
              selectedWeek={selectedWeek} 
              setSelectedWeek={setSelectedWeek} 
            />
          </div>
          <ScorecardContent scorecardData={scorecardData} />
        </div>
      );
    } else if (pathname.includes("/quality/customer-contact")) {
      return (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-background">
            <h2 className="text-2xl font-bold mb-4">Customer Contact</h2>
            <p className="mb-4">Kundenkontaktberichte und Kommunikationsanalysen.</p>
            <CustomerContactContent 
              customerContactData={customerContactData} 
              driversData={driversData} 
            />
          </div>
        </div>
      );
    } else if (pathname.includes("/quality/pod")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">POD (Proof of Delivery)</h2>
          <p className="mb-4">Liefernachweise und Zustellungsdokumentation.</p>
          <PodContent podData={podData} />
        </div>
      );
    } else if (pathname.includes("/quality/concessions")) {
      return (
        <div className="p-4 border rounded-lg bg-background">
          <h2 className="text-2xl font-bold mb-4">Concessions</h2>
          <p className="mb-4">Übersicht zu Zugeständnissen und Ausnahmeregelungen.</p>
          <ConcessionsContent concessionsData={concessionsData} />
        </div>
      );
    }
    
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
