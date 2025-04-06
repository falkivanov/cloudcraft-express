
import { useState, useEffect, useCallback } from "react";
import { loadFromStorage } from "@/utils/storage";
import { MentorReport } from "@/components/file-upload/processors/mentor/types";

export interface MentorWeekData {
  weekId: string;
  weekNumber: number;
  year: number;
}

export const useMentorWeek = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>("week-0-0");
  const [weekData, setWeekData] = useState<MentorWeekData>({
    weekId: "week-0-0",
    weekNumber: 0,
    year: 0
  });
  
  // Parse the week identifier (e.g., "week-12-2023" -> { weekNumber: 12, year: 2023 })
  const parseWeekIdentifier = useCallback((weekId: string): MentorWeekData => {
    const parts = weekId.split("-");
    if (parts.length !== 3) {
      return { weekId, weekNumber: 0, year: 0 };
    }
    
    return {
      weekId,
      weekNumber: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10)
    };
  }, []);

  // Handle week selection
  const handleWeekSelection = useCallback((weekId: string) => {
    console.log(`Switching to mentor week: ${weekId}`);
    setSelectedWeek(weekId);
    
    // Parse the week ID immediately
    const parsed = parseWeekIdentifier(weekId);
    setWeekData(parsed);
  }, [parseWeekIdentifier]);

  // Load mentor data for the selected week
  const loadMentorDataForWeek = useCallback((weekId: string): MentorReport | null => {
    try {
      if (!weekId || weekId === "week-0-0") return null;
      
      const { weekNumber, year } = parseWeekIdentifier(weekId);
      if (weekNumber === 0 || year === 0) return null;
      
      const weekKey = `mentor_data_week_${weekNumber}_${year}`;
      console.log(`Looking for mentor data with key: ${weekKey}`);
      
      const weekData = loadFromStorage<MentorReport>(weekKey);
      if (weekData && weekData.drivers && weekData.drivers.length > 0) {
        console.log(`Found week-specific mentor data for KW${weekNumber}/${year}`);
        return weekData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading mentor data for week:", error);
      return null;
    }
  }, [parseWeekIdentifier]);
  
  return {
    selectedWeek,
    setSelectedWeek: handleWeekSelection,
    weekData,
    parseWeekIdentifier,
    loadMentorDataForWeek
  };
};
