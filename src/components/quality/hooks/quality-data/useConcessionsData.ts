import { useState, useEffect } from "react";
import { ConcessionsData } from "@/components/quality/concessions/types";

export const useConcessionsData = () => {
  const [concessionsData, setConcessionsData] = useState<ConcessionsData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<ConcessionsData['items']>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("concessionsData");
      if (data) {
        const parsedData = JSON.parse(data) as ConcessionsData;
        setConcessionsData(parsedData);
        
        if (parsedData.currentWeek && !selectedWeek) {
          setSelectedWeek(parsedData.currentWeek);
        }
      }
    } catch (error) {
      console.error("Error parsing concessions data:", error);
    }
  }, [selectedWeek]);

  useEffect(() => {
    if (concessionsData && selectedWeek) {
      if (selectedWeek === concessionsData.currentWeek) {
        setFilteredItems(concessionsData.items);
      } else {
        setFilteredItems([]);
      }
    } else {
      setFilteredItems([]);
    }
  }, [concessionsData, selectedWeek]);

  return { 
    concessionsData, 
    selectedWeek, 
    setSelectedWeek, 
    filteredItems,
    totalCost: filteredItems.reduce((sum, item) => sum + item.cost, 0)
  };
};
