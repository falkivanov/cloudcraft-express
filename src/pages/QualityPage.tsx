import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomerContactContent from "@/components/quality/CustomerContactContent";
import PodContent from "@/components/quality/PodContent";
import ConcessionsContent from "@/components/quality/ConcessionsContent";
import ScorecardContent from "@/components/quality/scorecard/ScorecardContent";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";
import { getScorecardData } from "@/components/quality/scorecard/data";

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
        const extractedData = localStorage.getItem("extractedScorecardData");
        if (extractedData) {
          console.log("Using extracted PDF data from localStorage");
          setScoreCardData(JSON.parse(extractedData));
        } else {
          const data = localStorage.getItem("scorecardData");
          if (data) {
            const parsedScorecard = JSON.parse(data);
            setScoreCardData(parsedScorecard);
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
      return <ScorecardContent scorecardData={scorecardData} />;
    } else if (pathname.includes("/quality/customer-contact")) {
      return (
        <CustomerContactContent 
          customerContactData={customerContactData} 
          driversData={driversData} 
        />
      );
    } else if (pathname.includes("/quality/pod")) {
      return <PodContent podData={podData} />;
    } else if (pathname.includes("/quality/concessions")) {
      return <ConcessionsContent concessionsData={concessionsData} />;
    }
    
    return (
      <div className="p-4 border rounded-lg bg-background">
        <h2 className="text-2xl font-bold mb-4">Qualitätsmanagement</h2>
        <p>Wählen Sie eine Kategorie in der Seitenleiste aus.</p>
      </div>
    );
  };

  // Get current page title
  const getPageTitle = () => {
    if (pathname.includes("/quality/scorecard")) {
      return "Scorecard";
    } else if (pathname.includes("/quality/customer-contact")) {
      return "Customer Contact";
    } else if (pathname.includes("/quality/pod")) {
      return "POD";
    } else if (pathname.includes("/quality/concessions")) {
      return "Concessions";
    }
    return "Qualitätsmanagement";
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{getPageTitle()}</h1>
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default QualityPage;
