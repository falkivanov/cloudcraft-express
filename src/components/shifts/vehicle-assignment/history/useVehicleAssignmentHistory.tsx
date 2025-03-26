
import { useState, useEffect } from "react";
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
    try {
      const savedHistory = localStorage.getItem('vehicleAssignmentHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setAssignmentHistory(parsedHistory);
      } else {
        // Use sample data if no history exists in localStorage
        const sampleData = getSampleVehicleAssignments();
        setAssignmentHistory(sampleData);
        // Save sample data to localStorage for future use
        localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(sampleData));
      }
    } catch (error) {
      console.error('Error loading vehicle assignment history from localStorage:', error);
      setAssignmentHistory(getSampleVehicleAssignments());
    }
  }, []);

  // Save assignment history to localStorage whenever it changes
  useEffect(() => {
    if (assignmentHistory.length > 0) {
      try {
        localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(assignmentHistory));
      } catch (error) {
        console.error('Error saving vehicle assignment history to localStorage:', error);
      }
    }
  }, [assignmentHistory]);
  
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
    setAssignmentHistory
  };
};
