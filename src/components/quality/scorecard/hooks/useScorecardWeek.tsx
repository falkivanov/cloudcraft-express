
import { useState, useEffect } from "react";
import { parseWeekIdentifier, isDataAvailableForWeek } from "../data";
import { ScoreCardData } from "../types";

export const useScorecardWeek = (scorecardData: ScoreCardData | null) => {
  // Initialize with an empty week indicator
  const [selectedWeek, setSelectedWeek] = useState<string>("week-0-0");
  
  // Try to extract week number from data if it exists
  useEffect(() => {
    if (scorecardData && scorecardData.week > 0) {
      // Set the week from our data
      const weekId = `week-${scorecardData.week}-${scorecardData.year}`;
      setSelectedWeek(weekId);
      console.log(`Using week ${scorecardData.week} from scorecard data`);
    }
  }, [scorecardData]);

  // Check if selected week has available data
  const isUnavailableWeek = () => {
    const parsedWeek = parseWeekIdentifier(selectedWeek);
    if (!parsedWeek) return true;
    
    const { weekNum, year } = parsedWeek;
    return !isDataAvailableForWeek(weekNum, year);
  };

  return { selectedWeek, setSelectedWeek, isUnavailableWeek };
};
