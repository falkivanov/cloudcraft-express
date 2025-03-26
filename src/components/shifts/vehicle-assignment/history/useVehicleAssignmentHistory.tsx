
import { useState, useEffect, useCallback } from "react";
import { VehicleAssignment } from "@/types/shift";
import { 
  filterAssignments, 
  sortAssignmentsByDate,
  getSampleVehicleAssignments 
} from "./utils/assignmentUtils";

export const useVehicleAssignmentHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<VehicleAssignment[]>([]);
  
  // Load vehicle assignment history from localStorage
  useEffect(() => {
    const loadHistoryFromStorage = () => {
      try {
        const savedHistory = localStorage.getItem('vehicleAssignmentHistory');
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setAssignmentHistory(parsedHistory);
          console.log('Loaded vehicle assignment history from localStorage:', parsedHistory.length);
        } else {
          // Use sample data if no history exists in localStorage
          const sampleData = getSampleVehicleAssignments();
          setAssignmentHistory(sampleData);
          // Save sample data to localStorage for future use
          localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(sampleData));
          console.log('Initialized vehicle assignment history with sample data:', sampleData.length);
        }
      } catch (error) {
        console.error('Error loading vehicle assignment history from localStorage:', error);
        const sampleData = getSampleVehicleAssignments();
        setAssignmentHistory(sampleData);
      }
    };
    
    loadHistoryFromStorage();
  }, []);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicleAssignmentHistory' && e.newValue) {
        try {
          const updatedHistory = JSON.parse(e.newValue);
          setAssignmentHistory(updatedHistory);
          console.log('Updated vehicle assignment history from storage event');
        } catch (error) {
          console.error('Error parsing vehicle assignment history from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save assignment history to localStorage whenever it changes
  const updateAssignmentHistory = useCallback((newHistory: VehicleAssignment[]) => {
    setAssignmentHistory(newHistory);
    try {
      localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(newHistory));
      console.log('Saved updated vehicle assignment history:', newHistory.length);
    } catch (error) {
      console.error('Error saving vehicle assignment history:', error);
    }
  }, []);
  
  // Filter and sort assignments
  const filteredAssignments = filterAssignments(
    assignmentHistory,
    searchQuery,
    dateFilter,
    selectedEmployee
  );
  
  const sortedAssignments = sortAssignmentsByDate(filteredAssignments);
  
  return {
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    selectedEmployee,
    setSelectedEmployee,
    sortedAssignments,
    assignmentHistory,
    setAssignmentHistory: updateAssignmentHistory
  };
};
