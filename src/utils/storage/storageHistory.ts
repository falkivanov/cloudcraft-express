
/**
 * Utilities for handling file upload history in localStorage
 */

import { toast } from "sonner";
import { STORAGE_KEYS } from "./storageCore";

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
