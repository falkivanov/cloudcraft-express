
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";

/**
 * Hook to load customer contact data for a specific week
 */
export const useWeekData = () => {
  // Load customer contact data from localStorage for the selected week
  const loadWeekData = (selectedWeek: string) => {
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

  return { loadWeekData };
};
