
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "@/components/ui/container";
import QualityTabs from "@/components/quality/QualityTabs";
import QualityPageHeader from "@/components/quality/QualityPageHeader";
import QualityPageContent from "@/components/quality/QualityPageContent";
import { useQualityData } from "@/components/quality/hooks/useQualityData";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";

const QualityPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    customerContactData,
    scorecardData,
    prevWeekScoreCardData,
    concessionsData,
    mentorData,
    driversData,
    dataLoaded,
    loadScoreCardData,
    loadCustomerContactData
  } = useQualityData(pathname);

  // Add a listener for data removed events to force a refresh
  useEffect(() => {
    const handleDataRemoved = () => {
      console.log("QualityPage: Data removed event detected, forcing refresh");
      setRefreshKey(prev => prev + 1);
      
      // If on scorecard page, ensure data is cleared and reloaded
      if (pathname.includes("/quality/scorecard")) {
        loadScoreCardData();
      }
    };
    
    const handleCustomerContactDataRemoved = () => {
      console.log("QualityPage: Customer contact data removed event detected");
      if (pathname.includes("/quality/customer-contact")) {
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleCustomerContactDataUpdated = (event: Event) => {
      console.log("QualityPage: Customer contact data updated event detected");
      if (pathname.includes("/quality/customer-contact")) {
        const customEvent = event as CustomEvent;
        loadCustomerContactData(customEvent.detail?.weekKey);
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const handleCustomerContactWeekChanged = (event: Event) => {
      console.log("QualityPage: Customer contact week changed event detected");
      if (pathname.includes("/quality/customer-contact")) {
        const customEvent = event as CustomEvent;
        loadCustomerContactData(customEvent.detail?.weekKey);
        setRefreshKey(prev => prev + 1);
      }
    };
    
    window.addEventListener('scorecardDataRemoved', handleDataRemoved);
    window.addEventListener('customerContactDataRemoved', handleCustomerContactDataRemoved);
    window.addEventListener('concessionsDataRemoved', handleDataRemoved);
    window.addEventListener('mentorDataRemoved', handleDataRemoved);
    window.addEventListener('customerContactDataUpdated', handleCustomerContactDataUpdated);
    window.addEventListener('customerContactWeekChanged', handleCustomerContactWeekChanged);
    
    return () => {
      window.removeEventListener('scorecardDataRemoved', handleDataRemoved);
      window.removeEventListener('customerContactDataRemoved', handleCustomerContactDataRemoved);
      window.removeEventListener('concessionsDataRemoved', handleDataRemoved);
      window.removeEventListener('mentorDataRemoved', handleDataRemoved);
      window.removeEventListener('customerContactDataUpdated', handleCustomerContactDataUpdated);
      window.removeEventListener('customerContactWeekChanged', handleCustomerContactWeekChanged);
    };
  }, [pathname, loadScoreCardData, loadCustomerContactData]);

  return (
    <Container className="p-4 md:p-8">
      <QualityPageHeader pathname={pathname} />
      <QualityTabs />
      <div className="mt-6">
        <QualityPageContent
          key={refreshKey} /* Force re-render when data is removed */
          pathname={pathname}
          dataLoaded={dataLoaded}
          scorecardData={scorecardData}
          prevWeekScoreCardData={prevWeekScoreCardData}
          customerContactData={customerContactData}
          driversData={driversData}
          concessionsData={concessionsData}
          mentorData={mentorData}
        />
      </div>
    </Container>
  );
};

export default QualityPage;
