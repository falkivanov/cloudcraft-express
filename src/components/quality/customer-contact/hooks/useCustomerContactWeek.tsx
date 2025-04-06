
import { useState, useEffect } from "react";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";

export interface WeekOption {
  id: string;
  label: string;
  weekNum: number;
  year: number;
}

export const useCustomerContactWeek = () => {
  // Try to load from localStorage or use default
  const savedWeek = localStorage.getItem("customerContactActiveWeek") || "week-13-2025";
  const [selectedWeek, setSelectedWeek] = useState<string>(savedWeek);
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  
  // Event handler for when the week changes
  const handleWeekChange = (value: string) => {
    console.log("Changing Customer Contact week to:", value);
    setSelectedWeek(value);
    localStorage.setItem("customerContactActiveWeek", value);
    
    // Trigger data reload
    window.dispatchEvent(new CustomEvent('customerContactWeekChanged', {
      detail: { weekKey: value }
    }));
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
            label: `KW ${weekNum}${weekNum === getCurrentWeek() ? " (aktuell)" : ""}`,
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
          label: `KW ${currentWeek} (aktuell)`,
          weekNum: currentWeek,
          year: currentYear
        },
        {
          id: `week-${currentWeek - 1}-${currentYear}`,
          label: `KW ${currentWeek - 1}`,
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
  }, [selectedWeek]);

  // Helper function to get current week number
  const getCurrentWeek = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + start.getDay()) / 7);
  };

  // Load customer contact data from localStorage for the selected week
  const loadWeekData = () => {
    const htmlDataKey = `customerContactData_${selectedWeek}`;
    const parsedDataKey = `parsedCustomerContactData_${selectedWeek}`;
    
    const htmlData = localStorage.getItem(htmlDataKey) || localStorage.getItem("customerContactData");
    
    if (htmlData) {
      // Found data for this week, return it
      const parsedStoredData = localStorage.getItem(parsedDataKey) || localStorage.getItem("parsedCustomerContactData");
      
      if (parsedStoredData) {
        try {
          return JSON.parse(parsedStoredData);
        } catch (e) {
          console.error(`Error parsing stored data for week ${selectedWeek}:`, e);
          // If parse fails, re-parse the HTML
          return parseCustomerContactData(htmlData);
        }
      } else {
        // No parsed data, parse the HTML
        return parseCustomerContactData(htmlData);
      }
    }
    
    // No data found for this week
    return [];
  };

  return { 
    selectedWeek, 
    setSelectedWeek: handleWeekChange, 
    availableWeeks,
    loadWeekData
  };
};
