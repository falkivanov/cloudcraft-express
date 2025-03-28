
import { useState, useEffect } from "react";
import { ShiftAssignment } from "@/types/shift";
import { loadShiftsFromStorage, saveShiftsToStorage } from "../utils/localStorage-utils";

/**
 * Hook for handling shift storage operations
 */
export const useShiftStorage = () => {
  // Initialize shifts map to track all current assignments
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftAssignment>>(new Map());
  
  // Load saved shift assignments
  useEffect(() => {
    const newMap = loadShiftsFromStorage();
    setShiftsMap(newMap);
  }, []);

  // Save shift assignments to localStorage whenever they change
  useEffect(() => {
    const saveShifts = () => {
      saveShiftsToStorage(shiftsMap);
    };
    
    // Save immediately when shifts change
    saveShifts();
    
    // Also set up an interval to save periodically (every 30 seconds)
    const saveInterval = setInterval(saveShifts, 30000);
    
    return () => {
      clearInterval(saveInterval);
      // Save one last time when component unmounts
      saveShifts();
    };
  }, [shiftsMap]);
  
  // Add a beforeunload handler to save data when the page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveShiftsToStorage(shiftsMap);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shiftsMap]);
  
  return {
    shiftsMap,
    setShiftsMap
  };
};
