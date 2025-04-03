
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

  // Load mentor data for the selected week
  const loadWeekData = (weekId: string) => {
    const { weekNumber, year } = parseWeekIdentifier(weekId);
    setWeekData({ weekId, weekNumber, year });
  };

  // Update when selected week changes
  useEffect(() => {
    loadWeekData(selectedWeek);
  }, [selectedWeek]);

  return {
    selectedWeek,
    setSelectedWeek,
    weekData
  };
};
