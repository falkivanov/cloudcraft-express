
import { useState, useEffect, useCallback } from "react";
import { loadFromStorage } from "@/utils/storage";
import { MentorReport } from "@/components/file-upload/processors/mentor/types";
import { toast } from "sonner";

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
  const [mentorData, setMentorData] = useState<MentorReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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
  
  // Load data whenever selected week changes
  useEffect(() => {
    if (!selectedWeek || selectedWeek === "week-0-0") {
      setMentorData(null);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { weekNumber, year } = weekData;
      console.log(`Loading mentor data for KW${weekNumber}/${year}...`);
      
      const data = loadMentorDataForWeek(selectedWeek);
      
      if (!data) {
        console.log(`No mentor data found for KW${weekNumber}/${year}`);
        toast.error(`Keine Daten für KW${weekNumber}/${year} gefunden`);
        setMentorData(null);
      } else {
        console.log(`Successfully loaded mentor data for KW${weekNumber}/${year}`);
        setMentorData(data);
      }
    } catch (error) {
      console.error("Error in useMentorWeek hook:", error);
      toast.error("Fehler beim Laden der Mentor Daten");
      setMentorData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek, weekData, loadMentorDataForWeek]);
  
  return {
    selectedWeek,
    setSelectedWeek: handleWeekSelection,
    weekData,
    mentorData,
    isLoading,
    parseWeekIdentifier,
    loadMentorDataForWeek
  };
};
