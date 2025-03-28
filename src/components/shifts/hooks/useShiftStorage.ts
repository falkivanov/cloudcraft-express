
import { useState, useEffect } from "react";
import { ShiftAssignment } from "@/types/shift";

export const useShiftStorage = () => {
  // Initialize shiftsMap from localStorage or as an empty Map
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftAssignment>>(() => {
    try {
      const savedShifts = localStorage.getItem('shiftsMap');
      if (savedShifts) {
        // Convert from object to Map
        const shiftsObject = JSON.parse(savedShifts);
        const newMap = new Map();
        
        // Process each shift
        Object.keys(shiftsObject).forEach(key => {
          newMap.set(key, shiftsObject[key]);
        });
        
        console.log(`Loaded ${newMap.size} shifts from localStorage`);
        console.log(`'Arbeit' shifts loaded: ${Array.from(newMap.values()).filter(s => s.shiftType === "Arbeit").length}`);
        
        return newMap;
      }
    } catch (error) {
      console.error('Error loading shifts from localStorage:', error);
    }
    
    return new Map();
  });
  
  // Save shiftsMap to localStorage whenever it changes
  useEffect(() => {
    try {
      // Convert Map to object for localStorage
      const shiftsObject: Record<string, ShiftAssignment> = {};
      shiftsMap.forEach((value, key) => {
        shiftsObject[key] = value;
      });
      
      // Log to debug
      console.log(`Saving ${shiftsMap.size} shifts to localStorage`);
      console.log(`'Arbeit' shifts being saved: ${Array.from(shiftsMap.values()).filter(s => s.shiftType === "Arbeit").length}`);
      
      // Save even if empty - this ensures we clear the localStorage when shifts are cleared
      localStorage.setItem('shiftsMap', JSON.stringify(shiftsObject));
      
    } catch (error) {
      console.error('Error saving shifts to localStorage:', error);
    }
  }, [shiftsMap]);
  
  return {
    shiftsMap,
    setShiftsMap
  };
};
