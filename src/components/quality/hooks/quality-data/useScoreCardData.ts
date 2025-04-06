
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { getPreviousWeekData } from "@/components/quality/scorecard/data/dataProvider";
import { STORAGE_KEYS, loadFromStorage, clearStorageItem } from "@/utils/storage";

export const useScoreCardData = (pathname: string) => {
  const [scorecardData, setScoreCardData] = useState<ScoreCardData | null>(null);
  const [prevWeekScoreCardData, setPrevWeekScoreCardData] = useState<ScoreCardData | null>(null);

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

  return {
    scorecardData,
    prevWeekScoreCardData,
    loadScoreCardData,
    clearScorecardData
  };
};
