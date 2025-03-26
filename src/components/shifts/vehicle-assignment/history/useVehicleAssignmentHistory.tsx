
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
  
  // Lade Fahrzeugzuordnungshistorie aus localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('vehicleAssignmentHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setAssignmentHistory(parsedHistory);
      } else {
        // Fallback auf Beispieldaten, wenn keine Historie im localStorage vorhanden ist
        setAssignmentHistory(getSampleVehicleAssignments());
      }
    } catch (error) {
      console.error('Error loading vehicle assignment history from localStorage:', error);
      setAssignmentHistory(getSampleVehicleAssignments());
    }
  }, []);
  
  // Filtern und Sortieren der Zuweisungen
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
    sortedAssignments
  };
};
