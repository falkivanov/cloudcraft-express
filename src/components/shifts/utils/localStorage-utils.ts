/**
 * Utilities for handling localStorage operations related to shifts
 */

import { ShiftAssignment } from "@/types/shift";
import { STORAGE_KEYS, saveToStorage, loadFromStorage, mapToObject, objectToMap } from "@/utils/storage";

// Save shifts to localStorage
export const saveShiftsToStorage = (shiftsMap: Map<string, ShiftAssignment>): void => {
  if (shiftsMap.size > 0) {
    try {
      // Convert Map to a storable object
      const shiftsObject = mapToObject(shiftsMap);
      saveToStorage(STORAGE_KEYS.SHIFTS_MAP, shiftsObject);
      
      console.log('Saved shifts to localStorage:', Object.keys(shiftsObject).length);
    } catch (error) {
      console.error('Error saving shifts to localStorage:', error);
      if (shiftsMap.size > 0) {
        console.warn('Shift assignments might not persist after page refresh due to storage error');
      }
    }
  }
};

// Load shifts from localStorage
export const loadShiftsFromStorage = (): Map<string, ShiftAssignment> => {
  try {
    // Load data from localStorage
    const shiftsObject = loadFromStorage<Record<string, ShiftAssignment>>(STORAGE_KEYS.SHIFTS_MAP);
    
    if (shiftsObject) {
      // Restore map from object
      const newMap = objectToMap(shiftsObject);
      console.log('Loaded shifts from localStorage:', newMap.size);
      return newMap;
    } else {
      console.log('No saved shifts found in localStorage, starting with empty map');
      return new Map<string, ShiftAssignment>();
    }
  } catch (error) {
    console.error('Error loading shifts from localStorage:', error);
    // Return initial empty map if data is corrupted
    return new Map<string, ShiftAssignment>();
  }
};
