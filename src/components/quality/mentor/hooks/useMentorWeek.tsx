
import { useState, useEffect, useCallback } from "react";
import { loadFromStorage } from "@/utils/storage";

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
  const [forceRefresh, setForceRefresh] = useState<number>(0);

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

  // Handle week selection with forced refresh to trigger data reload
  const handleWeekSelection = useCallback((weekId: string) => {
    console.log(`Switching to week: ${weekId}`);
    setSelectedWeek(weekId);
    
    // Parse the week ID immediately
    const parsed = parseWeekIdentifier(weekId);
    setWeekData(parsed);
    
    // Force a refresh to ensure data reloading
    setForceRefresh(prev => prev + 1);
  }, [parseWeekIdentifier]);

  return {
    selectedWeek,
    setSelectedWeek: handleWeekSelection,
    weekData,
    parseWeekIdentifier,
    forceRefresh
  };
};
