
import { useState, useEffect } from "react";

export const useCustomerContactWeek = () => {
  // Initialize with week 13 as default (most recent)
  const [selectedWeek, setSelectedWeek] = useState<string>("week-13-2025");
  
  // Check if week has data (we would expand this for real data sources)
  const isUnavailableWeek = () => {
    // For now, all weeks in our selector are valid
    return false;
  };

  // Log for debugging and making sure the correct week is selected
  useEffect(() => {
    console.info("Customer Contact week selection updated:", selectedWeek);
  }, [selectedWeek]);

  return { selectedWeek, setSelectedWeek, isUnavailableWeek };
};
