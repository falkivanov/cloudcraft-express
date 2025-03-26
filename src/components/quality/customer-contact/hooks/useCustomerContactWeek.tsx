
import { useState, useEffect } from "react";

export const useCustomerContactWeek = () => {
  // Initialize with the stored week or KW12 as default
  const getInitialWeek = () => {
    const storedWeek = localStorage.getItem("customerContactWeek");
    return storedWeek || "week-12-2025";
  };
  
  const [selectedWeek, setSelectedWeek] = useState<string>(getInitialWeek());
  
  // Save selected week to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("customerContactWeek", selectedWeek);
  }, [selectedWeek]);
  
  // Check if week has data (we would expand this for real data sources)
  const isUnavailableWeek = () => {
    // For now, all weeks in our selector are valid
    return false;
  };

  return { selectedWeek, setSelectedWeek, isUnavailableWeek };
};
