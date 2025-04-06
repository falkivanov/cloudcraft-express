
import { useState, useEffect } from "react";
import { WeekOption } from "./types";

/**
 * Hook to discover and manage available customer contact weeks
 */
export const useAvailableWeeks = (selectedWeek: string, setSelectedWeek: (week: string) => void) => {
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  
  // Helper function to get current week number
  const getCurrentWeek = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + start.getDay()) / 7);
  };
  
  // Discover available weeks from localStorage
  useEffect(() => {
    const weeks: WeekOption[] = [];
    const prefix = "customerContactData_week-";
    
    // Find all weeks in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const weekKey = key.substring("customerContactData_".length);
        const parts = weekKey.split("-");
        if (parts.length === 3) {
          const weekNum = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          weeks.push({
            id: weekKey,
            label: `KW ${weekNum}/${year}${weekNum === getCurrentWeek() ? " (aktuell)" : ""}`,
            weekNum,
            year
          });
        }
      }
    }
    
    // Add defaults if no data found
    if (weeks.length === 0) {
      const currentYear = new Date().getFullYear();
      const currentWeek = getCurrentWeek();
      
      weeks.push(
        {
          id: `week-${currentWeek}-${currentYear}`,
          label: `KW ${currentWeek}/${currentYear} (aktuell)`,
          weekNum: currentWeek,
          year: currentYear
        },
        {
          id: `week-${currentWeek - 1}-${currentYear}`,
          label: `KW ${currentWeek - 1}/${currentYear}`,
          weekNum: currentWeek - 1,
          year: currentYear
        }
      );
    }
    
    // Sort weeks by year and week number (descending)
    weeks.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.weekNum - a.weekNum;
    });
    
    setAvailableWeeks(weeks);
    
    // If the selected week is not in the available weeks, select the first one
    if (!weeks.find(week => week.id === selectedWeek) && weeks.length > 0) {
      setSelectedWeek(weeks[0].id);
      localStorage.setItem("customerContactActiveWeek", weeks[0].id);
    }
  }, [selectedWeek, setSelectedWeek]);
  
  return { availableWeeks };
};
