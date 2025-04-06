
import React, { useState, useEffect, useCallback } from "react";
import { MentorReport } from "@/components/file-upload/processors/mentor/types";
import { loadFromStorage } from "@/utils/storage";
import WeekSelectorWithArrows, { WeekOption } from "../../shared/WeekSelectorWithArrows";

interface MentorWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (week: string) => void;
}

const MentorWeekSelector: React.FC<MentorWeekSelectorProps> = ({ selectedWeek, setSelectedWeek }) => {
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Find all available weeks using a similar approach to Scorecard
  const findAvailableWeeks = useCallback(() => {
    setIsLoading(true);
    console.log("Finding available mentor weeks...");
    const weeks: WeekOption[] = [];
    
    // Check local storage for mentor data with pattern: mentor_data_week_X_YYYY
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const match = key.match(/^mentor_data_week_(\d+)_(\d+)$/);
      if (match) {
        const weekNum = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        
        try {
          // Verify data is valid by checking if it has drivers array
          const data = loadFromStorage<MentorReport>(key);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            const weekId = `week-${weekNum}-${year}`;
            weeks.push({
              id: weekId,
              label: `KW${weekNum}/${year}`,
              weekNum,
              year
            });
            console.log(`Found valid mentor data for KW${weekNum}/${year}`);
          }
        } catch (error) {
          console.error(`Error loading mentor data for key ${key}:`, error);
        }
      }
    }
    
    // Check for legacy data (using the old storage key)
    try {
      const legacyData = localStorage.getItem("mentorData");
      if (legacyData) {
        const data = JSON.parse(legacyData) as MentorReport;
        if (data && data.weekNumber && data.year && Array.isArray(data.drivers) && data.drivers.length > 0) {
          const weekId = `week-${data.weekNumber}-${data.year}`;
          if (!weeks.some(w => w.id === weekId)) {
            weeks.push({
              id: weekId,
              label: `KW${data.weekNumber}/${data.year}`,
              weekNum: data.weekNumber,
              year: data.year
            });
            console.log(`Found legacy mentor data for KW${data.weekNumber}/${data.year}`);
          }
        }
      }
    } catch (error) {
      console.error("Error loading legacy mentor data:", error);
    }
    
    // Sort weeks by year and week number (newest first)
    weeks.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year! - a.year!; // Newer year first
      }
      return b.weekNum! - a.weekNum!; // Newer week first
    });
    
    console.log("Found available mentor weeks:", weeks);
    setAvailableWeeks(weeks);
    setIsLoading(false);
    
    // If no week is currently selected but we have weeks, select the first one
    if ((selectedWeek === "week-0-0" || !selectedWeek) && weeks.length > 0) {
      console.log("Auto-selecting first available mentor week:", weeks[0]);
      setSelectedWeek(weeks[0].id);
    }
  }, [selectedWeek, setSelectedWeek]);

  // Load available weeks on component mount and when storage changes
  useEffect(() => {
    findAvailableWeeks();

    // Listen for storage changes to refresh available weeks
    const handleStorageChange = () => {
      findAvailableWeeks();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("mentorDataUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mentorDataUpdated", handleStorageChange);
    };
  }, [findAvailableWeeks]);

  return (
    <WeekSelectorWithArrows
      selectedWeek={selectedWeek}
      setSelectedWeek={setSelectedWeek}
      availableWeeks={availableWeeks}
      isLoading={isLoading}
    />
  );
};

export default MentorWeekSelector;
