
import { useState, useEffect } from "react";

export const useCustomerContactWeek = () => {
  // Initialize with week 11 as default since our test data is from KW11
  const [selectedWeek, setSelectedWeek] = useState<string>("week-11-2025");
  
  // Check if week has data (we would expand this for real data sources)
  const isUnavailableWeek = () => {
    // For now, all weeks in our selector are valid
    return false;
  };

  return { selectedWeek, setSelectedWeek, isUnavailableWeek };
};
