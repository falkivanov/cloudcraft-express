
import React, { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storage";
import { ScoreCardData } from "./types";
import { parseWeekIdentifier, isDataAvailableForWeek, getAllAvailableWeeks } from "./data";

interface ScorecardWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

const ScorecardWeekSelector: React.FC<ScorecardWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek
}) => {
  const [availableWeeks, setAvailableWeeks] = useState<{
    id: string;
    label: string;
    weekNum: number;
    year: number;
    date?: Date;
  }[]>([
    {
      id: "week-0-0",
      label: "Keine Daten vorhanden",
      weekNum: 0,
      year: 0,
      date: new Date()
    }
  ]);

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
      // Get all available weeks using the new helper function
      const weeks = getAllAvailableWeeks();
      
      // Get extracted data from storage for marking "current" week
      const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
      
      // Mark currently extracted data as latest
      if (extractedData && extractedData.week && extractedData.year) {
        const extractedWeekId = `week-${extractedData.week}-${extractedData.year}`;
        const existingWeekIndex = weeks.findIndex(w => w.id === extractedWeekId);
        
        if (existingWeekIndex >= 0) {
          weeks[existingWeekIndex].label = `KW ${extractedData.week}/${extractedData.year} (aktuell)`;
        } else {
          weeks.unshift({
            id: extractedWeekId,
            label: `KW ${extractedData.week}/${extractedData.year} (aktuell)`,
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
          const latestWeek = weeks.find(w => w.label.includes("aktuell")) || weeks[0];
          setSelectedWeek(latestWeek.id);
        }
      } else {
        // No data available
        setAvailableWeeks([{
          id: "week-0-0",
          label: "Keine Daten vorhanden",
          weekNum: 0,
          year: 0,
          date: new Date()
        }]);
      }
    } catch (error) {
      console.error("Error loading available weeks:", error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Kalenderwoche:</span>
      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Woche auswählen..." />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availableWeeks.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              {week.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScorecardWeekSelector;
