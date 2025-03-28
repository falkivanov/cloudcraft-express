
import { useCallback } from "react";
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
  
  // Clear only regular shifts (preserves special shifts like Termin, Urlaub, Krank)
  const clearShifts = useCallback(() => {
    setShiftsMap(prevMap => {
      const newMap = new Map();
      
      // Keep all special shifts and Frei shifts will be cleared
      prevMap.forEach((shift, key) => {
        if (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank") {
          newMap.set(key, shift);
        }
      });
      
      return newMap;
    });
  }, [setShiftsMap]);
  
  // Clear ALL shifts for the week
  const clearAllShifts = useCallback(() => {
    setShiftsMap(new Map());
  }, [setShiftsMap]);
  
  return {
    shiftsMap,
    scheduledEmployees,
    formatDateKey,
    clearShifts,
    clearAllShifts,
    refreshScheduledCounts
  };
};
