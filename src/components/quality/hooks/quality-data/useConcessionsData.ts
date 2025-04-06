
import { useState, useEffect, useMemo } from "react";
import { ConcessionsData, GroupedConcession, ConcessionItem } from "@/components/quality/concessions/types";
import { toast } from "sonner";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";

/**
 * Load employees data from storage
 */
const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    const storedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    setEmployees(storedEmployees);
  }, []);
  
  return employees;
};

/**
 * Create a mapping of transport IDs to employee names
 */
const useTransportIdMapping = (employees: Employee[]) => {
  return useMemo(() => {
    const mapping: Record<string, string> = {};
    employees.forEach(employee => {
      if (employee.transporterId) {
        mapping[employee.transporterId] = employee.name;
      }
    });
    return mapping;
  }, [employees]);
};

/**
 * Load concessions data from storage
 */
const useLoadConcessionsData = () => {
  const [concessionsData, setConcessionsData] = useState<ConcessionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      setIsLoading(true);
      const data = localStorage.getItem("concessionsData");
      
      if (data) {
        const parsedData = JSON.parse(data) as ConcessionsData;
        setConcessionsData(parsedData);
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
  }, []);
  
  return { concessionsData, isLoading };
};

/**
 * Filter concessions data by selected week
 */
const useFilterByWeek = (concessionsData: ConcessionsData | null, selectedWeek: string | null) => {
  const [filteredItems, setFilteredItems] = useState<ConcessionsData['items']>([]);
  
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
    } else if (concessionsData) {
      // If no week is selected, use current week as default
      setFilteredItems(concessionsData.items);
    } else {
      setFilteredItems([]);
    }
  }, [concessionsData, selectedWeek]);
  
  return filteredItems;
};

/**
 * Group concessions by transport ID
 */
const useGroupConcessions = (filteredItems: ConcessionItem[], transportIdToNameMap: Record<string, string>) => {
  return useMemo(() => {
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
};

/**
 * Main hook for concessions data
 */
export const useConcessionsData = () => {
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [expandedTransportId, setExpandedTransportId] = useState<string | null>(null);

  // Use the extracted hooks
  const employees = useEmployeeData();
  const transportIdToNameMap = useTransportIdMapping(employees);
  const { concessionsData, isLoading } = useLoadConcessionsData();
  
  // Set selected week from loaded data if not already set
  useEffect(() => {
    if (concessionsData?.currentWeek && !selectedWeek) {
      setSelectedWeek(concessionsData.currentWeek);
    }
  }, [concessionsData, selectedWeek]);
  
  const filteredItems = useFilterByWeek(concessionsData, selectedWeek);
  const groupedConcessions = useGroupConcessions(filteredItems, transportIdToNameMap);

  const toggleExpandTransportId = (transportId: string) => {
    setExpandedTransportId(current => 
      current === transportId ? null : transportId
    );
  };

  // Calculate total cost based on filtered items
  const totalCost = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.cost, 0);
  }, [filteredItems]);

  return { 
    concessionsData, 
    selectedWeek, 
    setSelectedWeek,
    filteredItems,
    isLoading,
    totalCost,
    availableWeeks: concessionsData?.availableWeeks || [],
    groupedConcessions,
    expandedTransportId,
    toggleExpandTransportId
  };
};
