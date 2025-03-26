
import { useState, useEffect } from "react";

export const useCustomerContactWeek = () => {
  // Initialize with week 12 as default since our test data is from KW12
  const [selectedWeek, setSelectedWeek] = useState<string>("week-12-2025");
  
  // Check if week has data (we would expand this for real data sources)
  const isUnavailableWeek = () => {
    // For now, all weeks in our selector are valid
    return false;
  };

  // Log for debugging and making sure the correct week is selected
  useEffect(() => {
    console.info("Week selection updated:", selectedWeek);
  }, [selectedWeek]);

  return { selectedWeek, setSelectedWeek, isUnavailableWeek };
};
