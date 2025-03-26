
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "@/components/ui/container";
import CustomerContactContent from "@/components/quality/customer-contact/CustomerContactContent";
import ConcessionsContent from "@/components/quality/ConcessionsContent";
import ScorecardContent from "@/components/quality/scorecard/ScorecardContent";
import MentorContent from "@/components/quality/MentorContent";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";
import { getKW11TestHTMLData } from "@/components/quality/customer-contact/data/testData";
import QualityTabs from "@/components/quality/QualityTabs";

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
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  
  // Clear all quality-related localStorage data on component mount
  useEffect(() => {
    localStorage.removeItem('customerContactData');
    localStorage.removeItem('scorecardData');
    localStorage.removeItem('extractedScorecardData');
    localStorage.removeItem('concessionsData');
    localStorage.removeItem('mentorData');
  }, []);
  
  useEffect(() => {
    console.info("QualityPage: Path changed to", pathname);
    loadData();
  }, [pathname]);
  
  const loadData = () => {
    console.info("QualityPage: Initial data load");
    setDataLoaded(false);
    
    if (pathname.includes("/quality/customer-contact")) {
      console.info("Loading customer contact data");
      // Don't use test data, only try to load from localStorage
      const data = localStorage.getItem("customerContactData");
      setCustomerContactData(data);
      
      if (data) {
        console.info("Found parsed customer contact data in localStorage");
        const parsedData = parseCustomerContactData(data);
        setDriversData(parsedData);
        console.info("Customer contact data loaded");
      }
    } else if (pathname.includes("/quality/scorecard")) {
      try {
        const extractedData = localStorage.getItem("extractedScorecardData");
        if (extractedData) {
          console.info("Using extracted PDF data from localStorage");
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
        const data = localStorage.getItem("mentorData");
        if (data) {
          setMentorData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error parsing mentor data:", error);
      }
    }
    
    setDataLoaded(true);
  };
  
  const renderContent = () => {
    if (!dataLoaded) {
      return (
        <div className="p-4 border rounded-lg bg-background flex items-center justify-center h-96">
          <p className="text-muted-foreground">Daten werden geladen...</p>
        </div>
      );
    }
    
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

  return (
    <Container className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">{getPageTitle()}</h1>
      <QualityTabs />
      <div className="mt-6">
        {renderContent()}
      </div>
    </Container>
  );
};

export default QualityPage;
