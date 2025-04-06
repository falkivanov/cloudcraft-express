
import { useState, useCallback } from "react";
import { parseCustomerContactData } from "@/components/quality/utils/parseCustomerContactData";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

export const useCustomerContactData = () => {
  const [customerContactData, setCustomerContactData] = useState<string | null>(null);
  const [driversData, setDriversData] = useState<DriverComplianceData[]>([]);
  
  const loadCustomerContactData = useCallback((weekKey?: string) => {
    const activeWeek = weekKey || localStorage.getItem("customerContactActiveWeek") || "";
    console.info(`Loading customer contact data for week: ${activeWeek}`);
    
    if (activeWeek) {
      // Try to load week-specific data
      const htmlDataKey = `customerContactData_${activeWeek}`;
      const parsedDataKey = `parsedCustomerContactData_${activeWeek}`;
      
      const weekHtmlData = localStorage.getItem(htmlDataKey);
      if (weekHtmlData) {
        setCustomerContactData(weekHtmlData);
        
        // Try to load pre-parsed data
        const parsedData = localStorage.getItem(parsedDataKey);
        if (parsedData) {
          try {
            const driverData = JSON.parse(parsedData);
            setDriversData(driverData);
            console.info(`Loaded ${driverData.length} drivers for week ${activeWeek}`);
            return;
          } catch (e) {
            console.error(`Error parsing stored data for week ${activeWeek}:`, e);
          }
        }
        
        // If no parsed data or error parsing, re-parse the HTML
        const reparsedData = parseCustomerContactData(weekHtmlData);
        setDriversData(reparsedData);
        console.info(`Re-parsed ${reparsedData.length} drivers for week ${activeWeek}`);
        return;
      }
    }
    
    // Fallback to default data
    const defaultData = localStorage.getItem("customerContactData");
    setCustomerContactData(defaultData);
    
    if (defaultData) {
      // Try to load pre-parsed default data
      const parsedDefaultData = localStorage.getItem("parsedCustomerContactData");
      if (parsedDefaultData) {
        try {
          const driverData = JSON.parse(parsedDefaultData);
          setDriversData(driverData);
          console.info(`Loaded ${driverData.length} drivers from default data`);
          return;
        } catch (e) {
          console.error("Error parsing default parsed data:", e);
        }
      }
      
      // If no parsed data or error parsing, re-parse the HTML
      const reparsedData = parseCustomerContactData(defaultData);
      setDriversData(reparsedData);
      console.info(`Re-parsed ${reparsedData.length} drivers from default data`);
    } else {
      setDriversData([]);
      console.info("No customer contact data found");
    }
  }, []);

  return {
    customerContactData,
    driversData,
    loadCustomerContactData
  };
};
