
import { useState, useEffect, useCallback } from "react";
import { parseWeekIdentifier, isDataAvailableForWeek, getScorecardData } from "../data";
import { ScoreCardData } from "../types";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";

export const useScorecardWeek = (scorecardData: ScoreCardData | null) => {
  // Initialize with an empty week indicator or with current data
  const [selectedWeek, setSelectedWeek] = useState<string>(
    scorecardData && scorecardData.week > 0
      ? `week-${scorecardData.week}-${scorecardData.year}`
      : "week-11-2025" // Default to week 11 which has data
  );
  
  // Try to extract week number from data if it exists
  useEffect(() => {
    if (scorecardData && scorecardData.week > 0) {
      // Set the week from our data
      const weekId = `week-${scorecardData.week}-${scorecardData.year}`;
      setSelectedWeek(weekId);
      console.log(`Using week ${scorecardData.week} from scorecard data`);
    } else {
      // Try to load from localStorage
      try {
        const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
        if (extractedData && extractedData.week > 0) {
          const weekId = `week-${extractedData.week}-${extractedData.year}`;
          setSelectedWeek(weekId);
          console.log(`Using week ${extractedData.week} from localStorage`);
        } else {
          // If no data, default to week 11 which has data
          setSelectedWeek("week-11-2025");
        }
      } catch (error) {
        console.error("Error loading scorecard data from localStorage:", error);
        // Default to week with known data
        setSelectedWeek("week-11-2025");
      }
    }
  }, [scorecardData]);

  // Load scorecard data for the selected week
  const loadScorecardDataForWeek = useCallback((weekId: string): ScoreCardData | null => {
    console.log(`Loading scorecard data for week: ${weekId}`);
    return getScorecardData(null, weekId);
  }, []);
  
  // Check if selected week has available data
  const isUnavailableWeek = useCallback(() => {
    const parsedWeek = parseWeekIdentifier(selectedWeek);
    if (!parsedWeek) return true;
    
    const { weekNum, year } = parsedWeek;
    return !isDataAvailableForWeek(weekNum, year);
  }, [selectedWeek]);

  return { 
    selectedWeek, 
    setSelectedWeek, 
    isUnavailableWeek,
    loadScorecardDataForWeek
  };
};
