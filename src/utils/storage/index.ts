
/**
 * Central storage utilities module
 * Re-exports all storage-related functionality
 * 
 * NOTE: This module is being phased out as we migrate from localStorage 
 * to backend API for data management. It is kept for backward compatibility
 * and will eventually be removed.
 */

// Core storage functionality
export {
  STORAGE_KEYS,
  isStorageAvailable,
  saveToStorage,
  loadFromStorage as loadRawFromStorage,
  clearStorageItem,
  clearAllStorage,
  clearEmployeesStorage
} from './storageCore';

// Serialization and validation utilities
export {
  loadFromStorage,
  mapToObject,
  objectToMap
} from './storageSerialization';

// History utilities
export {
  addItemToHistory,
  getUploadHistory
} from './storageHistory';
