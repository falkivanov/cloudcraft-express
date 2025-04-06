
import { useState, useEffect, useCallback } from "react";
import { useScoreCardData } from "./useScoreCardData";
import { useCustomerContactData } from "./useCustomerContactData";
import { useConcessionsData } from "./useConcessionsData";
import { useMentorData } from "./useMentorData";
import { ScoreCardData } from "@/components/quality/scorecard/types";

interface QualityDataResult {
  customerContactData: string | null;
  scorecardData: ScoreCardData | null;
  prevWeekScoreCardData: ScoreCardData | null;
  concessionsData: any;
  mentorData: any;
  driversData: DriverComplianceData[];
  dataLoaded: boolean;
  loadScoreCardData: () => void;
  loadCustomerContactData: (weekKey?: string) => void;
}

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

export const useQualityData = (pathname: string): QualityDataResult => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  
  const {
    scorecardData,
    prevWeekScoreCardData,
    loadScoreCardData,
    clearScorecardData
  } = useScoreCardData(pathname);
  
  const {
    customerContactData,
    driversData,
    loadCustomerContactData
  } = useCustomerContactData();
  
  const { concessionsData } = useConcessionsData();
  
  const { mentorData } = useMentorData();
  
  const loadData = useCallback(() => {
    console.info("QualityPage: Loading data for path:", pathname);
    setDataLoaded(false);
    
    if (pathname.includes("/quality/customer-contact")) {
      console.info("Loading customer contact data");
      loadCustomerContactData();
    } else if (pathname.includes("/quality/scorecard")) {
      loadScoreCardData();
    }
    
    setDataLoaded(true);
  }, [pathname, loadCustomerContactData, loadScoreCardData]);

  useEffect(() => {
    console.info("QualityPage: Path changed to", pathname);
    loadData();
  }, [pathname, loadData]);
  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if ((event.key === "extractedScorecardData" || 
           event.key === "extractedScorecardData") && 
          pathname.includes("/quality/scorecard")) {
        console.info("Storage event detected: Scorecard data changed");
        loadScoreCardData();
      }
    };
    
    const handleScoreCardUpdatedEvent = () => {
      if (pathname.includes("/quality/scorecard")) {
        console.info("Custom event detected: Scorecard data changed");
        loadScoreCardData();
      }
    };
    
    const handleScoreCardRemovedEvent = () => {
      if (pathname.includes("/quality/scorecard")) {
        console.info("Custom event detected: Scorecard data removed");
        clearScorecardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scorecardDataUpdated', handleScoreCardUpdatedEvent);
    window.addEventListener('scorecardDataRemoved', handleScoreCardRemovedEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scorecardDataUpdated', handleScoreCardUpdatedEvent);
      window.removeEventListener('scorecardDataRemoved', handleScoreCardRemovedEvent);
    };
  }, [pathname, loadScoreCardData, clearScorecardData]);

  return {
    customerContactData,
    scorecardData,
    prevWeekScoreCardData,
    concessionsData,
    mentorData,
    driversData,
    dataLoaded,
    loadScoreCardData,
    loadCustomerContactData
  };
};
