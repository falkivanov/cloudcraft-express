
import { useState, useMemo } from "react";
import { GroupedConcession } from "../types";

export const useConcessionsSorting = (groupedConcessions: GroupedConcession[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: '', direction: 'ascending' });

  // Filter grouped items based on search term
  const filteredGroups = useMemo(() => {
    return groupedConcessions.filter(group => 
      group.transportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.items.some(item => 
        item.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [groupedConcessions, searchTerm]);

  // Apply sorting to groups
  const sortedGroups = useMemo(() => {
    return [...filteredGroups].sort((a, b) => {
      if (sortConfig.key === '') return 0;
      
      let valueA: any = a[sortConfig.key as keyof typeof a];
      let valueB: any = b[sortConfig.key as keyof typeof b];
      
      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredGroups, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return {
    searchTerm,
    setSearchTerm,
    sortConfig,
    requestSort,
    sortedGroups
  };
};
