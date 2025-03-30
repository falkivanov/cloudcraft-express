
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
import { parseWeekIdentifier, isDataAvailableForWeek } from "./data";

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
      // Get all uploaded scorecards from history
      const uploadHistory = loadFromStorage<any[]>("file-upload-history") || [];
      const scorecardUploads = uploadHistory.filter(
        (item) => item.category === "scorecard" && item.week && item.year
      );
      
      // Get extracted data from storage
      const extractedData = loadFromStorage<ScoreCardData>(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
      
      // Combine all available weeks
      const weeks = new Map<string, {
        id: string;
        label: string;
        weekNum: number;
        year: number;
        isLatest?: boolean;
      }>();
      
      // Add sample data weeks (hardcoded weeks 6-11)
      for (let weekNum = 6; weekNum <= 11; weekNum++) {
        if (isDataAvailableForWeek(weekNum, 2025)) {
          const weekId = `week-${weekNum}-2025`;
          weeks.set(weekId, {
            id: weekId,
            label: `KW ${weekNum}/2025 (Beispiel)`,
            weekNum: weekNum,
            year: 2025
          });
        }
      }
      
      // Add uploaded scorecard weeks from history
      scorecardUploads.forEach(upload => {
        const weekId = `week-${upload.week}-${upload.year}`;
        weeks.set(weekId, {
          id: weekId,
          label: `KW ${upload.week}/${upload.year}`,
          weekNum: upload.week,
          year: upload.year,
          isLatest: false
        });
      });
      
      // Mark currently extracted data as latest
      if (extractedData && extractedData.week && extractedData.year) {
        const extractedWeekId = `week-${extractedData.week}-${extractedData.year}`;
        const existingData = weeks.get(extractedWeekId);
        
        if (existingData) {
          weeks.set(extractedWeekId, {
            ...existingData,
            label: `KW ${extractedData.week}/${extractedData.year} (aktuell)`,
            isLatest: true
          });
        } else {
          weeks.set(extractedWeekId, {
            id: extractedWeekId,
            label: `KW ${extractedData.week}/${extractedData.year} (aktuell)`,
            weekNum: extractedData.week,
            year: extractedData.year,
            isLatest: true
          });
        }
      }
      
      // Convert to array and sort by year and week (newest first)
      let weeksArray = Array.from(weeks.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.weekNum - a.weekNum;
      });
      
      // If we have weeks, update the state
      if (weeksArray.length > 0) {
        setAvailableWeeks(weeksArray);
        
        // If current selection is not valid, select the latest week
        const parsedWeek = parseWeekIdentifier(selectedWeek);
        if (!parsedWeek || !weeksArray.some(w => w.id === selectedWeek)) {
          const latestWeek = weeksArray.find(w => w.isLatest === true) || weeksArray[0];
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
