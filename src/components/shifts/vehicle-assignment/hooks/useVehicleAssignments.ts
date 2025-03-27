
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { toast } from "sonner";
import { generateAssignments } from "../utils/vehicleAssignmentUtils";

export const useVehicleAssignments = (isScheduleFinalized: boolean) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  
  const yesterdayDateKey = format(yesterday, "yyyy-MM-dd");
  const todayDateKey = format(today, "yyyy-MM-dd");
  const tomorrowDateKey = format(tomorrow, "yyyy-MM-dd");
  
  const [yesterdayAssignments, setYesterdayAssignments] = useState<Record<string, string>>({});
  const [todayAssignments, setTodayAssignments] = useState<Record<string, string>>({});
  const [tomorrowAssignments, setTomorrowAssignments] = useState<Record<string, string>>({});
  const [overrideFinalized, setOverrideFinalized] = useState(false);
  const [localFinalized, setLocalFinalized] = useState(isScheduleFinalized);

  // Check for changes in isScheduleFinalized prop
  useEffect(() => {
    setLocalFinalized(isScheduleFinalized);
    console.log("isScheduleFinalized prop changed:", isScheduleFinalized);
  }, [isScheduleFinalized]);
  
  // Listen for storage events that might update the finalized status
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
        if (savedIsScheduleFinalized) {
          const newValue = JSON.parse(savedIsScheduleFinalized);
          setLocalFinalized(newValue);
          console.log("Schedule finalized status updated from storage:", newValue);
        }
      } catch (error) {
        console.error('Error reading schedule finalized status from localStorage:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom dayFinalized events
    const handleDayFinalized = () => {
      setLocalFinalized(true);
      console.log("Day finalized event detected, updating local finalized state");
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, []);
  
  // Load saved assignments from localStorage
  useEffect(() => {
    try {
      const savedYesterdayAssignments = localStorage.getItem(`vehicleAssignments-${yesterdayDateKey}`);
      const savedTodayAssignments = localStorage.getItem(`vehicleAssignments-${todayDateKey}`);
      const savedTomorrowAssignments = localStorage.getItem(`vehicleAssignments-${tomorrowDateKey}`);
      const savedOverrideFinalized = localStorage.getItem('overrideFinalized');
      
      if (savedOverrideFinalized) {
        setOverrideFinalized(JSON.parse(savedOverrideFinalized));
      }
      
      if (savedYesterdayAssignments) {
        setYesterdayAssignments(JSON.parse(savedYesterdayAssignments));
      } else {
        // Fallback to mock data only if no saved data exists
        const mockYesterdayAssignments: Record<string, string> = {
          "1": "2",
          "2": "4",
          "3": "1",
          "6": "3",
          "9": "5",
        };
        setYesterdayAssignments(mockYesterdayAssignments);
        
        // Save the mock data for next time
        localStorage.setItem(`vehicleAssignments-${yesterdayDateKey}`, JSON.stringify(mockYesterdayAssignments));
      }
      
      if (savedTodayAssignments) {
        setTodayAssignments(JSON.parse(savedTodayAssignments));
      } else {
        // Fallback to mock data only if no saved data exists
        const mockTodayAssignments: Record<string, string> = {
          "1": "1",
          "2": "3",
          "3": "2",
          "6": "5",
          "9": "7",
        };
        setTodayAssignments(mockTodayAssignments);
        
        // Save the mock data for next time
        localStorage.setItem(`vehicleAssignments-${todayDateKey}`, JSON.stringify(mockTodayAssignments));
      }
      
      if (savedTomorrowAssignments) {
        setTomorrowAssignments(JSON.parse(savedTomorrowAssignments));
      }
    } catch (error) {
      console.error('Error loading vehicle assignments from localStorage:', error);
    }
  }, [yesterdayDateKey, todayDateKey, tomorrowDateKey]);
  
  // Save yesterday assignments to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(`vehicleAssignments-${yesterdayDateKey}`, JSON.stringify(yesterdayAssignments));
    } catch (error) {
      console.error('Error saving yesterday vehicle assignments to localStorage:', error);
    }
  }, [yesterdayAssignments, yesterdayDateKey]);
  
  // Save today assignments to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(`vehicleAssignments-${todayDateKey}`, JSON.stringify(todayAssignments));
    } catch (error) {
      console.error('Error saving today vehicle assignments to localStorage:', error);
    }
  }, [todayAssignments, todayDateKey]);
  
  // Save tomorrow assignments to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(`vehicleAssignments-${tomorrowDateKey}`, JSON.stringify(tomorrowAssignments));
    } catch (error) {
      console.error('Error saving tomorrow vehicle assignments to localStorage:', error);
    }
  }, [tomorrowAssignments, tomorrowDateKey]);
  
  // Save override status to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('overrideFinalized', JSON.stringify(overrideFinalized));
    } catch (error) {
      console.error('Error saving override finalized status to localStorage:', error);
    }
  }, [overrideFinalized]);
  
  const handleAutoAssign = () => {
    const effectivelyFinalized = localFinalized || overrideFinalized;
    
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeuge zuzuordnen, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    const newAssignments = generateAssignments();
    setTomorrowAssignments(newAssignments);
    
    const formattedTomorrow = format(tomorrow, "dd.MM.yyyy");
    toast.success(`${Object.keys(newAssignments).length} Fahrzeuge für ${formattedTomorrow} automatisch zugewiesen`, {
      description: "Überprüfen Sie die Zuordnungen und speichern Sie diese bei Bedarf."
    });
  };
  
  const handleSaveAssignments = () => {
    const effectivelyFinalized = localFinalized || overrideFinalized;
    
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeugzuordnungen zu speichern, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    if (Object.keys(tomorrowAssignments).length === 0) {
      toast.warning("Keine Zuordnungen vorhanden", {
        description: "Bitte führen Sie zuerst eine Auto-Zuordnung durch."
      });
      return;
    }
    
    // Save the assignment history to localStorage
    try {
      const { activeVehicles } = require("../utils/vehicleAssignmentUtils");
      const { initialEmployees } = require("@/data/sampleEmployeeData");
      
      const activeVehiclesList = activeVehicles();
      
      const savedAssignments = Object.entries(tomorrowAssignments).map(([vehicleId, employeeId]) => {
        const vehicle = activeVehiclesList.find(v => v.id === vehicleId);
        const employee = initialEmployees.find(e => e.id === employeeId);
        return {
          id: `${vehicleId}-${employeeId}-${tomorrowDateKey}`,
          vehicleId,
          vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
          employeeId,
          employeeName: employee?.name || "",
          date: tomorrowDateKey,
          assignedAt: new Date().toISOString(),
          assignedBy: "Admin"
        };
      });
      
      const existingHistory = localStorage.getItem('vehicleAssignmentHistory');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [...historyArray, ...savedAssignments];
      localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(updatedHistory));
      
      const formattedTomorrow = format(tomorrow, "dd.MM.yyyy");
      toast.success(`Fahrzeugzuordnungen für ${formattedTomorrow} wurden gespeichert!`);
    } catch (error) {
      console.error('Error saving vehicle assignment history to localStorage:', error);
      toast.error("Fehler beim Speichern", {
        description: "Die Zuordnungen konnten nicht gespeichert werden."
      });
    }
  };

  return {
    yesterdayAssignments,
    todayAssignments,
    tomorrowAssignments,
    overrideFinalized,
    setOverrideFinalized,
    effectivelyFinalized: localFinalized || overrideFinalized,
    handleAutoAssign,
    handleSaveAssignments,
    tomorrowDateKey,
    yesterdayDateKey,
    todayDateKey
  };
};
