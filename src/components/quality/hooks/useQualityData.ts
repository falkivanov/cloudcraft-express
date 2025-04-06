
import { useState, useEffect, useCallback } from "react";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";
import { toast } from "sonner";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { getPreviousWeekData } from "@/components/quality/scorecard/data/dataProvider";
import { STORAGE_KEYS, loadFromStorage, clearStorageItem } from "@/utils/storage";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

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

export const useQualityData = (pathname: string): QualityDataResult => {
  const [customerContactData, setCustomerContactData] = useState<string | null>(null);
  const [scorecardData, setScoreCardData] = useState<ScoreCardData | null>(null);
  const [prevWeekScoreCardData, setPrevWeekScoreCardData] = useState<ScoreCardData | null>(null);
  const [concessionsData, setConcessionsData] = useState<any>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [driversData, setDriversData] = useState<DriverComplianceData[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  
  const loadScoreCardData = useCallback(() => {
    try {
      const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
      
      if (extractedData) {
        console.info("Using extracted PDF data from storage:", 
          JSON.stringify(extractedData).substring(0, 100) + "...");
        setScoreCardData(extractedData);
        
        if (extractedData.week && extractedData.year) {
          const weekId = `week-${extractedData.week}-${extractedData.year}`;
          const previousData = getPreviousWeekData(weekId);
          setPrevWeekScoreCardData(previousData);
          
          console.info(`Successfully loaded data for week ${extractedData.week}/${extractedData.year}`);
        }
        return;
      }
      
      const legacyData = localStorage.getItem("extractedScorecardData");
      if (legacyData) {
        console.info("Using legacy extracted PDF data:", legacyData.substring(0, 100) + "...");
        const parsedData = JSON.parse(legacyData) as ScoreCardData;
        setScoreCardData(parsedData);
        
        if (parsedData.week && parsedData.year) {
          const weekId = `week-${parsedData.week}-${parsedData.year}`;
          const previousData = getPreviousWeekData(weekId);
          setPrevWeekScoreCardData(previousData);
        }
        return;
      }
      
      const data = localStorage.getItem("scorecardData");
      if (data) {
        const parsedScorecard = JSON.parse(data);
        setScoreCardData(parsedScorecard);
        
        if (parsedScorecard.week && parsedScorecard.year) {
          const weekId = `week-${parsedScorecard.week}-${parsedScorecard.year}`;
          const previousData = getPreviousWeekData(weekId);
          setPrevWeekScoreCardData(previousData);
        }
      } else {
        console.info("No scorecard data found in localStorage");
        setScoreCardData(null);
        setPrevWeekScoreCardData(null);
      }
    } catch (error) {
      console.error("Error parsing scorecard data:", error);
      toast.error("Fehler beim Laden der Scorecard-Daten", {
        description: "Bitte laden Sie die Scorecard-Datei erneut hoch."
      });
      
      clearScorecardData();
    }
  }, []);
  
  const loadCustomerContactData = useCallback((weekKey?: string) => {
    const activeWeek = weekKey || localStorage.getItem("customerContactActiveWeek") || "";
    console.info(`Loading customer contact data for week: ${activeWeek}`);
    
    if (activeWeek) {
      // Try to load week-specific data
      const htmlDataKey = `customerContactData_${activeWeek}`;
      const parsedDataKey = `parsedCustomerContactData_${activeWeek}`;
      
      const weekHtmlData = localStorage.getItem(htmlDataKey);
      if (weekHtmlData) {
        setCustomerContactData(weekHtmlData);
        
        // Try to load pre-parsed data
        const parsedData = localStorage.getItem(parsedDataKey);
        if (parsedData) {
          try {
            const driverData = JSON.parse(parsedData);
            setDriversData(driverData);
            console.info(`Loaded ${driverData.length} drivers for week ${activeWeek}`);
            return;
          } catch (e) {
            console.error(`Error parsing stored data for week ${activeWeek}:`, e);
          }
        }
        
        // If no parsed data or error parsing, re-parse the HTML
        const reparsedData = parseCustomerContactData(weekHtmlData);
        setDriversData(reparsedData);
        console.info(`Re-parsed ${reparsedData.length} drivers for week ${activeWeek}`);
        return;
      }
    }
    
    // Fallback to default data
    const defaultData = localStorage.getItem("customerContactData");
    setCustomerContactData(defaultData);
    
    if (defaultData) {
      // Try to load pre-parsed default data
      const parsedDefaultData = localStorage.getItem("parsedCustomerContactData");
      if (parsedDefaultData) {
        try {
          const driverData = JSON.parse(parsedDefaultData);
          setDriversData(driverData);
          console.info(`Loaded ${driverData.length} drivers from default data`);
          return;
        } catch (e) {
          console.error("Error parsing default parsed data:", e);
        }
      }
      
      // If no parsed data or error parsing, re-parse the HTML
      const reparsedData = parseCustomerContactData(defaultData);
      setDriversData(reparsedData);
      console.info(`Re-parsed ${reparsedData.length} drivers from default data`);
    } else {
      setDriversData([]);
      console.info("No customer contact data found");
    }
  }, []);

  const clearScorecardData = useCallback(() => {
    setScoreCardData(null);
    setPrevWeekScoreCardData(null);
    
    clearStorageItem(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    localStorage.removeItem("extractedScorecardData");
    localStorage.removeItem("scorecardData");
    localStorage.removeItem("scorecard_week");
    localStorage.removeItem("scorecard_year");
    localStorage.removeItem("scorecard_data");
    
    console.info("Scorecard data cleared due to deletion event");
    
    if (pathname.includes("/quality/scorecard")) {
      toast.info("Scorecard-Daten wurden gelöscht", {
        description: "Die Scorecard-Daten wurden erfolgreich entfernt.",
      });
    }
  }, [pathname]);

  const loadData = useCallback(() => {
    console.info("QualityPage: Loading data for path:", pathname);
    setDataLoaded(false);
    
    if (pathname.includes("/quality/customer-contact")) {
      console.info("Loading customer contact data");
      loadCustomerContactData();
    } else if (pathname.includes("/quality/scorecard")) {
      loadScoreCardData();
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
  }, [pathname, loadCustomerContactData, loadScoreCardData]);

  useEffect(() => {
    console.info("QualityPage: Path changed to", pathname);
    loadData();
  }, [pathname, loadData]);
  
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if ((event.key === STORAGE_KEYS.EXTRACTED_SCORECARD_DATA || 
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
