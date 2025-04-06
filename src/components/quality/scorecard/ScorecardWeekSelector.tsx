
import React, { useEffect, useState } from "react";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";
import { ScoreCardData } from "./types";
import { parseWeekIdentifier, isDataAvailableForWeek, getAllAvailableWeeks } from "./data";
import WeekSelectorWithArrows, { WeekOption } from "../shared/WeekSelectorWithArrows";

interface ScorecardWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

const ScorecardWeekSelector: React.FC<ScorecardWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek
}) => {
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([
    {
      id: "week-0-0",
      label: "Keine Daten vorhanden"
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all available weeks on component mount
  useEffect(() => {
    loadAvailableWeeks();

    // Listen for scorecard data updates
    const handleScorecardUpdate = () => {
      loadAvailableWeeks();
    };

    window.addEventListener('scorecardDataUpdated', handleScorecardUpdate);
    return () => {
      window.removeEventListener('scorecardDataUpdated', handleScorecardUpdate);
    };
  }, []);
  
  const loadAvailableWeeks = () => {
    try {
      setIsLoading(true);
      
      // Get all available weeks using the helper function
      const weeks = getAllAvailableWeeks();
      
      // Get extracted data from storage for marking current week
      const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
      
      // Mark currently extracted data
      if (extractedData && extractedData.week && extractedData.year) {
        const extractedWeekId = `week-${extractedData.week}-${extractedData.year}`;
        const existingWeekIndex = weeks.findIndex(w => w.id === extractedWeekId);
        
        if (existingWeekIndex >= 0) {
          weeks[existingWeekIndex].label = `KW ${extractedData.week}/${extractedData.year}`;
        } else {
          weeks.unshift({
            id: extractedWeekId,
            label: `KW ${extractedData.week}/${extractedData.year}`,
            weekNum: extractedData.week,
            year: extractedData.year
          });
        }
      }
      
      // If we have weeks, update the state
      if (weeks.length > 0) {
        setAvailableWeeks(weeks);
        
        // If current selection is not valid, select the latest week
        const parsedWeek = parseWeekIdentifier(selectedWeek);
        if (!parsedWeek || !weeks.some(w => w.id === selectedWeek)) {
          const latestWeek = weeks[0];
          setSelectedWeek(latestWeek.id);
        }
      } else {
        // No data available
        setAvailableWeeks([{
          id: "week-0-0",
          label: "Keine Daten vorhanden"
        }]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading available weeks:", error);
      setIsLoading(false);
    }
  };

  return (
    <WeekSelectorWithArrows
      selectedWeek={selectedWeek}
      setSelectedWeek={setSelectedWeek}
      availableWeeks={availableWeeks}
      isLoading={isLoading}
    />
  );
};

export default ScorecardWeekSelector;
