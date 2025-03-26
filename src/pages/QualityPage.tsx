
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "@/components/ui/container";
import CustomerContactContent from "@/components/quality/customer-contact/CustomerContactContent";
import ConcessionsContent from "@/components/quality/ConcessionsContent";
import ScorecardContent from "@/components/quality/scorecard/ScorecardContent";
import MentorContent from "@/components/quality/MentorContent";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";
import { getKW11TestHTMLData } from "@/components/quality/customer-contact/data/testData";

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
  const [concessionsData, setConcessionsData] = useState<any>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [driversData, setDriversData] = useState<DriverComplianceData[]>([]);
  
  useEffect(() => {
    // Force a refresh of the data when the path changes
    loadDataForCurrentPath();
  }, [pathname]);
  
  const loadDataForCurrentPath = () => {
    if (pathname.includes("/quality/customer-contact")) {
      // Get data from localStorage or use test data
      const data = localStorage.getItem("customerContactData") || getKW11TestHTMLData();
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
    } else if (pathname.includes("/quality/concessions")) {
      try {
        const data = localStorage.getItem("concessionsData");
        if (data) {
          setConcessionsData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing concessions data:", error);
      }
    } else if (pathname.includes("/quality/mentor")) {
      try {
        // Clear any previous mentor data first
        setMentorData(null);
        
        // Try to load from localStorage
        const data = localStorage.getItem("mentorData");
        console.log("Retrieved mentorData from localStorage:", data ? "data exists" : "no data");
        
        if (data) {
          const parsedData = JSON.parse(data);
          console.log("Parsed mentor data:", parsedData);
          
          // Validate the data structure before setting
          if (parsedData && parsedData.drivers && Array.isArray(parsedData.drivers)) {
            setMentorData(parsedData);
          } else {
            console.error("Invalid mentor data structure:", parsedData);
          }
        }
      } catch (error) {
        console.error("Error parsing mentor data:", error);
      }
    }
  };
  
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
    } else if (pathname.includes("/quality/concessions")) {
      return <ConcessionsContent concessionsData={concessionsData} />;
    } else if (pathname.includes("/quality/mentor")) {
      return <MentorContent mentorData={mentorData} />;
    }
    
    return (
      <div className="p-4 border rounded-lg bg-background">
        <h2 className="text-2xl font-bold mb-4">Qualitätsmanagement</h2>
        <p>Wählen Sie eine Kategorie in der Seitenleiste aus.</p>
      </div>
    );
  };

  const getPageTitle = () => {
    if (pathname.includes("/quality/scorecard")) {
      return "Scorecard";
    } else if (pathname.includes("/quality/customer-contact")) {
      return "Customer Contact";
    } else if (pathname.includes("/quality/concessions")) {
      return "Concessions";
    } else if (pathname.includes("/quality/mentor")) {
      return "Mentor";
    }
    return "Qualitätsmanagement";
  };

  // Trigger initial data load
  useEffect(() => {
    loadDataForCurrentPath();
  }, []);

  return (
    <Container className="p-8">
      <h1 className="text-3xl font-bold mb-6">{getPageTitle()}</h1>
      <div className="mt-6">
        {renderContent()}
      </div>
    </Container>
  );
};

export default QualityPage;
