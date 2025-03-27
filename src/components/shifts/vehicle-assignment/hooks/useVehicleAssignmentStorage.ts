
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

export interface VehicleAssignment {
  vehicleId: string;
  employeeId: string;
}

export const useVehicleAssignmentStorage = (
  yesterdayDateKey: string,
  todayDateKey: string,
  tomorrowDateKey: string
) => {
  const [yesterdayAssignments, setYesterdayAssignments] = useState<Record<string, string>>({});
  const [todayAssignments, setTodayAssignments] = useState<Record<string, string>>({});
  const [tomorrowAssignments, setTomorrowAssignments] = useState<Record<string, string>>({});
  const [overrideFinalized, setOverrideFinalized] = useState(false);

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

  const saveAssignmentHistory = (assignments: Record<string, string>, dateKey: string) => {
    try {
      const { activeVehicles } = require("../utils/vehicleAssignmentUtils");
      const { initialEmployees } = require("@/data/sampleEmployeeData");
      
      const activeVehiclesList = activeVehicles();
      
      const savedAssignments = Object.entries(assignments).map(([vehicleId, employeeId]) => {
        const vehicle = activeVehiclesList.find(v => v.id === vehicleId);
        const employee = initialEmployees.find(e => e.id === employeeId);
        return {
          id: `${vehicleId}-${employeeId}-${dateKey}`,
          vehicleId,
          vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
          employeeId,
          employeeName: employee?.name || "",
          date: dateKey,
          assignedAt: new Date().toISOString(),
          assignedBy: "Admin"
        };
      });
      
      const existingHistory = localStorage.getItem('vehicleAssignmentHistory');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [...historyArray, ...savedAssignments];
      localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(updatedHistory));
      
      return true;
    } catch (error) {
      console.error('Error saving vehicle assignment history to localStorage:', error);
      return false;
    }
  };

  return {
    yesterdayAssignments,
    setYesterdayAssignments,
    todayAssignments,
    setTodayAssignments,
    tomorrowAssignments,
    setTomorrowAssignments,
    overrideFinalized,
    setOverrideFinalized,
    saveAssignmentHistory
  };
};
