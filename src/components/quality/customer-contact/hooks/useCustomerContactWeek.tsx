
import { useState, useEffect } from "react";

export const useCustomerContactWeek = () => {
  // Initialize with the stored week or KW12 as default
  const getInitialWeek = () => {
    const storedWeek = localStorage.getItem("customerContactWeek");
    // Always default to week 12 if no valid week is stored
    return storedWeek && ["week-8-2025", "week-9-2025", "week-10-2025", "week-11-2025", "week-12-2025"].includes(storedWeek) 
      ? storedWeek 
      : "week-12-2025";
  };
  
  const [selectedWeek, setSelectedWeek] = useState<string>(getInitialWeek());
  
  // Save selected week to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("customerContactWeek", selectedWeek);
    console.log("Week selection updated:", selectedWeek);
  }, [selectedWeek]);

  return { selectedWeek, setSelectedWeek };
};
