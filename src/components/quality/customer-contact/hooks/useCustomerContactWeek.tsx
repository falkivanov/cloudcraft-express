
import { useState, useRef } from "react";
import type { WeekOption } from "./types";
import { useAvailableWeeks } from "./useAvailableWeeks";
import { useWeekData } from "./useWeekData";

export type { WeekOption } from "./types";

export const useCustomerContactWeek = () => {
  // Try to load from localStorage or use default
  const savedWeek = localStorage.getItem("customerContactActiveWeek") || "week-13-2025";
  const [selectedWeek, setSelectedWeek] = useState<string>(savedWeek);
  const previousWeekRef = useRef<string>(savedWeek);
  
  // Event handler for when the week changes
  const handleWeekChange = (value: string) => {
    if (previousWeekRef.current === value) return; // Prevent duplicate events
    
    console.log("Changing Customer Contact week to:", value);
    setSelectedWeek(value);
    localStorage.setItem("customerContactActiveWeek", value);
    previousWeekRef.current = value;
    
    // Trigger data reload
    window.dispatchEvent(new CustomEvent('customerContactWeekChanged', {
      detail: { weekKey: value }
    }));
  };
  
  const { availableWeeks } = useAvailableWeeks(selectedWeek, handleWeekChange);
  const { loadWeekData } = useWeekData();

  return { 
    selectedWeek, 
    setSelectedWeek: handleWeekChange, 
    availableWeeks,
    loadWeekData
  };
};
