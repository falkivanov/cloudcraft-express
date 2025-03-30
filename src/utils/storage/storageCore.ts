
/**
 * Core utilities for handling localStorage operations
 */

// Version information
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
 * Loads data from localStorage
 * @param key Storage key
 * @returns The loaded data or null
 */
export function loadFromStorage<T>(key: string): T | null {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return null;
  }
  
  try {
    const savedData = localStorage.getItem(key);
    
    if (!savedData) {
      console.log(`No ${key} data found in localStorage`);
      return null;
    }
    
    return JSON.parse(savedData);
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return null;
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
