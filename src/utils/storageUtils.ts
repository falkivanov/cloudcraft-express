
/**
 * Central utilities for handling localStorage operations across the application
 */

import { z } from "zod";

const STORAGE_VERSION = "1.0";

// Keys for different data types
export const STORAGE_KEYS = {
  EMPLOYEES: "employees",
  VEHICLES: "vehicles",
  SHIFTS_MAP: "shiftsMap",
  DATA_TIMESTAMP: "dataTimestamp",
  STORAGE_VERSION: "storageVersion",
  WAVE_ASSIGNMENTS_PREFIX: "waveAssignments",
  VEHICLE_ASSIGNMENTS_PREFIX: "vehicleAssignments",
  VEHICLE_ASSIGNMENT_HISTORY: "vehicleAssignmentHistory",
  IS_SCHEDULE_FINALIZED: "isScheduleFinalized",
  OVERRIDE_FINALIZED: "overrideFinalized",
  EXTRACTED_SCORECARD_DATA: "extractedScorecardData",
  FILE_UPLOAD_HISTORY: "fileUploadHistory"
};

/**
 * Checks if localStorage is available and working
 * @returns boolean indicating if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = 'storage-test';
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey) === 'test';
    localStorage.removeItem(testKey);
    return result;
  } catch (e) {
    return false;
  }
}

/**
 * Saves data to localStorage with error handling and versioning
 * @param key Storage key
 * @param data Data to store
 * @returns boolean indicating success
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  
  try {
    // Store the data
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Update timestamp and version
    localStorage.setItem(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
    
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Loads data from localStorage with validation
 * @param key Storage key
 * @param validator Optional Zod schema to validate the data
 * @param fallback Fallback data if nothing is found or validation fails
 * @returns The loaded data or fallback
 */
export function loadFromStorage<T>(
  key: string, 
  validator?: z.ZodType<T>,
  fallback?: T
): T | null {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return fallback || null;
  }
  
  try {
    const savedData = localStorage.getItem(key);
    
    if (!savedData) {
      console.log(`No ${key} data found in localStorage`);
      return fallback || null;
    }
    
    const parsedData = JSON.parse(savedData);
    
    // If a validator is provided, validate the data
    if (validator) {
      const validationResult = validator.safeParse(parsedData);
      if (!validationResult.success) {
        console.error(`Invalid ${key} data structure in localStorage:`, validationResult.error);
        return fallback || null;
      }
      return validationResult.data;
    }
    
    return parsedData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback || null;
  }
}

/**
 * Clears a specific item from localStorage
 * @param key Storage key to clear
 * @returns boolean indicating success
 */
export function clearStorageItem(key: string): boolean {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Clears all data in localStorage
 * @returns boolean indicating success
 */
export function clearAllStorage(): boolean {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Converts a Map to a storable object
 */
export function mapToObject<T>(map: Map<string, T>): Record<string, T> {
  const obj: Record<string, T> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * Converts an object back to a Map
 */
export function objectToMap<T>(obj: Record<string, T>): Map<string, T> {
  const map = new Map<string, T>();
  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      map.set(key, value);
    });
  }
  return map;
}

/**
 * Add an item to the file upload history
 * @param historyItem Item to add to the history
 * @returns Boolean indicating if the operation was successful
 */
export function addItemToHistory(historyItem: any): boolean {
  try {
    // Get existing history
    const historyString = localStorage.getItem(STORAGE_KEYS.FILE_UPLOAD_HISTORY);
    const history = historyString ? JSON.parse(historyString) : [];
    
    // Add new item and save
    history.push({
      ...historyItem,
      timestamp: historyItem.timestamp || Date.now()
    });
    
    localStorage.setItem(STORAGE_KEYS.FILE_UPLOAD_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error("Error updating file upload history:", error);
    return false;
  }
}

/**
 * Get the file upload history
 * @returns Array of history items or empty array if none found
 */
export function getUploadHistory(): any[] {
  try {
    const historyString = localStorage.getItem(STORAGE_KEYS.FILE_UPLOAD_HISTORY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error("Error getting file upload history:", error);
    return [];
  }
}
