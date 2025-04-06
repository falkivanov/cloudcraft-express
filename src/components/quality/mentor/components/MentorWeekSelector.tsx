
import React, { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { loadFromStorage } from "@/utils/storage";

interface MentorWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

interface AvailableWeek {
  id: string;
  label: string;
  weekNum: number;
  year: number;
}

const MentorWeekSelector: React.FC<MentorWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek
}) => {
  const [availableWeeks, setAvailableWeeks] = useState<AvailableWeek[]>([
    {
      id: "week-0-0",
      label: "Keine Daten vorhanden",
      weekNum: 0,
      year: 0,
    }
  ]);

  // Load all available weeks on component mount
  useEffect(() => {
    loadAvailableWeeks();

    // Listen for mentor data updates
    const handleMentorUpdate = () => {
      loadAvailableWeeks();
    };

    window.addEventListener('mentorDataUpdated', handleMentorUpdate);
    window.addEventListener('mentorDataRemoved', handleMentorUpdate);
    
    return () => {
      window.removeEventListener('mentorDataUpdated', handleMentorUpdate);
      window.removeEventListener('mentorDataRemoved', handleMentorUpdate);
    };
  }, []);
  
  const loadAvailableWeeks = () => {
    try {
      const weeks: AvailableWeek[] = [];
      
      // Scan all localStorage keys for mentor data by week
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mentor_data_week_')) {
          // Parse week number and year from key
          const match = key.match(/mentor_data_week_(\d+)_(\d+)/);
          if (match) {
            const weekNum = parseInt(match[1], 10);
            const year = parseInt(match[2], 10);
            
            const weekId = `week-${weekNum}-${year}`;
            weeks.push({
              id: weekId,
              label: `KW ${weekNum}/${year}`,
              weekNum,
              year
            });
          }
        }
      }
      
      // Check current mentor data (for backward compatibility)
      const mentorDataString = localStorage.getItem("mentorData");
      if (mentorDataString) {
        const mentorData = JSON.parse(mentorDataString);
        if (mentorData && mentorData.weekNumber && mentorData.year) {
          const weekId = `week-${mentorData.weekNumber}-${mentorData.year}`;
          // Only add if not already in the list
          if (!weeks.some(w => w.id === weekId)) {
            weeks.push({
              id: weekId,
              label: `KW ${mentorData.weekNumber}/${mentorData.year} (aktuell)`,
              weekNum: mentorData.weekNumber,
              year: mentorData.year
            });
          }
        }
      }
      
      // Check upload history for additional mentor files
      const historyString = localStorage.getItem('fileUploadHistory');
      if (historyString) {
        const history = JSON.parse(historyString);
        const mentorUploads = history.filter((item: any) => 
          item.category === "mentor" && 
          item.weekNumber && 
          item.year
        );
        
        // Add unique weeks from history
        mentorUploads.forEach((upload: any) => {
          const weekId = `week-${upload.weekNumber}-${upload.year}`;
          if (!weeks.some(w => w.id === weekId)) {
            // Check if data exists for this week
            const weekKey = `mentor_data_week_${upload.weekNumber}_${upload.year}`;
            const weekData = loadFromStorage(weekKey);
            
            if (weekData) {
              weeks.push({
                id: weekId,
                label: `KW ${upload.weekNumber}/${upload.year}`,
                weekNum: upload.weekNumber,
                year: upload.year
              });
            }
          }
        });
      }
      
      // Sort weeks by year and week number (newest first)
      weeks.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.weekNum - a.weekNum;
      });
      
      // If we have weeks, update the state
      if (weeks.length > 0) {
        setAvailableWeeks(weeks);
        
        // If current selection is not valid, select the latest week
        if (!weeks.some(w => w.id === selectedWeek)) {
          setSelectedWeek(weeks[0].id);
        }
      } else {
        // No data available
        setAvailableWeeks([{
          id: "week-0-0",
          label: "Keine Daten vorhanden",
          weekNum: 0,
          year: 0
        }]);
      }
    } catch (error) {
      console.error("Error loading available mentor weeks:", error);
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

export default MentorWeekSelector;
