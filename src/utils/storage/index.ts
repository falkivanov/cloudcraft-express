
/**
 * Central storage utilities module
 * Re-exports all storage-related functionality
 */

// Core storage functionality
export {
  STORAGE_KEYS,
  isStorageAvailable,
  saveToStorage,
  loadFromStorage as loadRawFromStorage,
  clearStorageItem,
  clearAllStorage
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
