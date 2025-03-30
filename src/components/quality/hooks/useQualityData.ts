import { useState, useEffect } from "react";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";
import { toast } from "sonner";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { getPreviousWeekData } from "@/components/quality/scorecard/data/dataProvider";

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
}

export const useQualityData = (pathname: string): QualityDataResult => {
  const [customerContactData, setCustomerContactData] = useState<string | null>(null);
  const [scorecardData, setScoreCardData] = useState<ScoreCardData | null>(null);
  const [prevWeekScoreCardData, setPrevWeekScoreCardData] = useState<ScoreCardData | null>(null);
  const [concessionsData, setConcessionsData] = useState<any>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [driversData, setDriversData] = useState<DriverComplianceData[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  
  // Load scorecard data
  const loadScoreCardData = () => {
    try {
      // Try to load extracted data first - IMPORTANT: Force refresh by not using cached state
      const extractedData = localStorage.getItem("extractedScorecardData");
      
      if (extractedData) {
        console.info("Using extracted PDF data from localStorage:", extractedData.substring(0, 100) + "...");
        const parsedData = JSON.parse(extractedData) as ScoreCardData;
        setScoreCardData(parsedData);
        
        // Load previous week data if available
        if (parsedData.week && parsedData.year) {
          const weekId = `week-${parsedData.week}-${parsedData.year}`;
          const previousData = getPreviousWeekData(weekId);
          setPrevWeekScoreCardData(previousData);
          
          console.info(`Successfully loaded data for week ${parsedData.week}/${parsedData.year}`);
        }
      } else {
        // Fall back to test data if available
        const data = localStorage.getItem("scorecardData");
        if (data) {
          const parsedScorecard = JSON.parse(data);
          setScoreCardData(parsedScorecard);
          
          // Try to load previous week data
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
      }
    } catch (error) {
      console.error("Error parsing scorecard data:", error);
      toast.error("Fehler beim Laden der Scorecard-Daten", {
        description: "Bitte laden Sie die Scorecard-Datei erneut hoch."
      });
    }
  };

  // Clear scorecard data when it's removed
  const clearScorecardData = () => {
    setScoreCardData(null);
    setPrevWeekScoreCardData(null);
    console.info("Scorecard data cleared due to deletion event");
    toast.info("Scorecard-Daten wurden gelöscht", {
      description: "Die Scorecard-Daten wurden erfolgreich entfernt.",
    });
  };

  const loadData = () => {
    console.info("QualityPage: Loading data");
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
  };

  // Load data when path changes
  useEffect(() => {
    console.info("QualityPage: Path changed to", pathname);
    loadData();
  }, [pathname]);
  
  // Listen for changes to localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "extractedScorecardData" && pathname.includes("/quality/scorecard")) {
        console.info("Storage event detected: Scorecard data changed");
        loadScoreCardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also add a manual event listener for updates within the same window
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
    
    window.addEventListener('scorecardDataUpdated', handleScoreCardUpdatedEvent);
    window.addEventListener('scorecardDataRemoved', handleScoreCardRemovedEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scorecardDataUpdated', handleScoreCardUpdatedEvent);
      window.removeEventListener('scorecardDataRemoved', handleScoreCardRemovedEvent);
    };
  }, [pathname]);

  return {
    customerContactData,
    scorecardData,
    prevWeekScoreCardData,
    concessionsData,
    mentorData,
    driversData,
    dataLoaded,
    loadScoreCardData
  };
};
