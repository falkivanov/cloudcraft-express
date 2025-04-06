
import { useState, useEffect, useMemo } from "react";
import { ConcessionsData, GroupedConcession } from "@/components/quality/concessions/types";
import { toast } from "sonner";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";

export const useConcessionsData = () => {
  const [concessionsData, setConcessionsData] = useState<ConcessionsData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<ConcessionsData['items']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTransportId, setExpandedTransportId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees data to map transport IDs to names
  useEffect(() => {
    const storedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    setEmployees(storedEmployees);
  }, []);

  // Create a mapping of transport IDs to employee names
  const transportIdToNameMap = useMemo(() => {
    const mapping: Record<string, string> = {};
    employees.forEach(employee => {
      if (employee.transporterId) {
        mapping[employee.transporterId] = employee.name;
      }
    });
    return mapping;
  }, [employees]);

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

  // Groupieren der Concessions nach Transport ID
  const groupedConcessions = useMemo(() => {
    const grouped: Record<string, GroupedConcession> = {};
    
    filteredItems.forEach(item => {
      if (!grouped[item.transportId]) {
        // Get driver name from the mapping or use transport ID as fallback
        const driverName = transportIdToNameMap[item.transportId] || `Fahrer (${item.transportId})`;
        
        grouped[item.transportId] = {
          transportId: item.transportId,
          driverName,
          count: 0,
          totalCost: 0,
          items: []
        };
      }
      
      grouped[item.transportId].count += 1;
      grouped[item.transportId].totalCost += item.cost;
      grouped[item.transportId].items.push(item);
    });
    
    return Object.values(grouped).sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredItems, transportIdToNameMap]);

  const toggleExpandTransportId = (transportId: string) => {
    setExpandedTransportId(current => 
      current === transportId ? null : transportId
    );
  };

  return { 
    concessionsData, 
    selectedWeek, 
    setSelectedWeek,
    filteredItems,
    isLoading,
    totalCost: filteredItems.reduce((sum, item) => sum + item.cost, 0),
    availableWeeks: concessionsData?.availableWeeks || [],
    groupedConcessions,
    expandedTransportId,
    toggleExpandTransportId
  };
};
