
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
  OVERRIDE_FINALIZED: "overrideFinalized"
};

/**
 * Saves data to localStorage with error handling and versioning
 * @param key Storage key
 * @param data Data to store
 * @returns boolean indicating success
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    // Store the data
    localStorage.setItem(key, JSON.stringify(data));
    
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
