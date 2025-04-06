
import { useState, useEffect } from "react";

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
  const parseWeekIdentifier = (weekId: string): MentorWeekData => {
    const parts = weekId.split("-");
    if (parts.length !== 3) {
      return { weekId, weekNumber: 0, year: 0 };
    }
    
    return {
      weekId,
      weekNumber: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10)
    };
  };

  // Handle week selection - update immediately
  const handleWeekSelection = (weekId: string) => {
    console.log(`Switching to week: ${weekId}`);
    setSelectedWeek(weekId);
    
    // Update the week data immediately
    const parsed = parseWeekIdentifier(weekId);
    setWeekData(parsed);
  };

  // Update when selected week changes
  useEffect(() => {
    const parsed = parseWeekIdentifier(selectedWeek);
    console.log(`Setting week data to: weekNumber=${parsed.weekNumber}, year=${parsed.year}, weekId=${selectedWeek}`);
    setWeekData(parsed);
  }, [selectedWeek]);

  return {
    selectedWeek,
    setSelectedWeek: handleWeekSelection,
    weekData,
    parseWeekIdentifier
  };
};
