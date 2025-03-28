
import { useCallback, useEffect } from "react";
import { ShiftType } from "../utils/shift-utils";
import { useShiftStorage } from "./useShiftStorage";
import { useScheduledCounts } from "./useScheduledCounts";
import { useShiftEvents } from "./useShiftEvents";

export const useShiftTracker = (weekDays: Date[]) => {
  // Use our smaller hooks
  const { shiftsMap, setShiftsMap } = useShiftStorage();
  const { scheduledEmployees, formatDateKey, refreshScheduledCounts } = useScheduledCounts(weekDays, shiftsMap);
  
  // Set up event handling
  useShiftEvents(setShiftsMap);
  
  // After any shift change, ensure counts are refreshed
  useEffect(() => {
    refreshScheduledCounts();
  }, [shiftsMap, refreshScheduledCounts]);
  
  // Clear only regular shifts (preserves special shifts like Termin, Urlaub, Krank)
  const clearShifts = useCallback(() => {
    console.log("Before clearing shifts - Map size:", shiftsMap.size);
    
    setShiftsMap(prevMap => {
      const newMap = new Map();
      
      // Keep all special shifts and Frei shifts will be cleared
      prevMap.forEach((shift, key) => {
        if (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank") {
          newMap.set(key, shift);
        }
      });
      
      console.log("After filtering - New map size:", newMap.size);
      return newMap;
    });
    
    // Force refresh the scheduled counts to ensure UI updates
    setTimeout(() => {
      console.log("Refreshing counts after clearShifts");
      refreshScheduledCounts();
    }, 100);
  }, [setShiftsMap, refreshScheduledCounts, shiftsMap]);
  
  // Clear ALL shifts for the week
  const clearAllShifts = useCallback(() => {
    console.log("Clearing ALL shifts");
    
    // Completely clear the shifts map
    setShiftsMap(new Map());
    
    // Force refresh the scheduled counts to ensure UI updates
    setTimeout(() => {
      console.log("Refreshing counts after clearAllShifts");
      refreshScheduledCounts();
    }, 100);
  }, [setShiftsMap, refreshScheduledCounts]);
  
  return {
    shiftsMap,
    setShiftsMap,
    scheduledEmployees,
    formatDateKey,
    clearShifts,
    clearAllShifts,
    refreshScheduledCounts
  };
};
