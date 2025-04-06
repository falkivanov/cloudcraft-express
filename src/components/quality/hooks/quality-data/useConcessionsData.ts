import { useState, useEffect } from "react";
import { ConcessionsData } from "@/components/quality/concessions/types";
import { toast } from "sonner";

export const useConcessionsData = () => {
  const [concessionsData, setConcessionsData] = useState<ConcessionsData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<ConcessionsData['items']>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);
      const data = localStorage.getItem("concessionsData");
      
      if (data) {
        const parsedData = JSON.parse(data) as ConcessionsData;
        setConcessionsData(parsedData);
        
        if (parsedData.currentWeek && !selectedWeek) {
          setSelectedWeek(parsedData.currentWeek);
        }
      } else {
        setConcessionsData(null);
      }
    } catch (error) {
      console.error("Error parsing concessions data:", error);
      toast.error("Fehler beim Laden der Concessions-Daten", {
        description: "Die gespeicherten Daten konnten nicht gelesen werden."
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    if (concessionsData && selectedWeek) {
      if (concessionsData.weekToItems && concessionsData.weekToItems[selectedWeek]) {
        setFilteredItems(concessionsData.weekToItems[selectedWeek]);
        return;
      }
      
      const items = concessionsData.items.filter(item => {
        if (selectedWeek === concessionsData.currentWeek) {
          return true;
        }
        return false;
      });
      
      setFilteredItems(items);
    } else {
      setFilteredItems([]);
    }
  }, [concessionsData, selectedWeek]);

  return { 
    concessionsData, 
    selectedWeek, 
    setSelectedWeek,
    filteredItems,
    isLoading,
    totalCost: filteredItems.reduce((sum, item) => sum + item.cost, 0),
    availableWeeks: concessionsData?.availableWeeks || []
  };
};
