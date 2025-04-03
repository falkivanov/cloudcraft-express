
import { MentorDriverData } from "../types";

/**
 * Filters out invalid driver records
 * @param drivers The array of driver data
 */
export function filterValidDrivers(drivers: MentorDriverData[]): MentorDriverData[] {
  // Filter out drivers with empty names or obvious headers
  return drivers.filter(driver => {
    const isValid = 
      (driver.firstName || driver.lastName) && 
      !driver.firstName.toLowerCase().includes('first') &&
      !driver.lastName.toLowerCase().includes('last');
    
    return isValid;
  });
}
