
/**
 * Utilities for handling localStorage operations related to shifts
 */

import { ShiftAssignment } from "@/types/shift";

// Convert Map to a storable object
export const mapToObject = <T>(map: Map<string, T>): Record<string, T> => {
  const obj: Record<string, T> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

// Save shifts to localStorage
export const saveShiftsToStorage = (shiftsMap: Map<string, ShiftAssignment>): void => {
  if (shiftsMap.size > 0) {
    try {
      // Convert Map to a storable object
      const shiftsObject = mapToObject(shiftsMap);
      localStorage.setItem('shiftsMap', JSON.stringify(shiftsObject));
      
      // Also set a timestamp for data verification
      localStorage.setItem('dataTimestamp', Date.now().toString());
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
    // Check if timestamp exists to confirm data validity
    const dataTimestamp = localStorage.getItem('dataTimestamp');
    
    // Load data from localStorage
    const savedShifts = localStorage.getItem('shiftsMap');
    if (savedShifts) {
      // Restore map from JSON string
      const shiftsObject = JSON.parse(savedShifts);
      const newMap = new Map<string, ShiftAssignment>();
      
      if (typeof shiftsObject === 'object' && shiftsObject !== null) {
        Object.entries(shiftsObject).forEach(([key, value]) => {
          if (value && typeof value === 'object' && 'employeeId' in value && 'date' in value && 'shiftType' in value) {
            newMap.set(key, value as ShiftAssignment);
          } else {
            console.warn(`Invalid shift assignment found for key ${key}, skipping`, value);
          }
        });
        console.log('Loaded shifts from localStorage:', newMap.size);
        return newMap;
      } else {
        console.error('Invalid shifts data structure in localStorage');
        // Return empty map if data is invalid
        return new Map<string, ShiftAssignment>();
      }
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
