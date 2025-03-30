
/**
 * Utilities for data validation and serialization in storage operations
 */

import { z } from "zod";
import { loadFromStorage as loadStorage } from "./storageCore";

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
  const parsedData = loadStorage<T>(key);
  
  if (parsedData === null) {
    return fallback || null;
  }
  
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
