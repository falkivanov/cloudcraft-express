
import { MentorDriver } from "../hooks/useMentorDriversTypes";
import { parseTimeToMinutes, getRiskValue } from "./sortingUtils";

type SortField = 
  | "firstName" 
  | "lastName" 
  | "overallRating" 
  | "station" 
  | "totalTrips" 
  | "totalKm" 
  | "totalHours" 
  | "acceleration" 
  | "braking" 
  | "cornering" 
  | "speeding" 
  | "seatbelt"
  | "tempo";

/**
 * Sort drivers based on the provided field and direction
 */
export function sortDrivers(
  drivers: MentorDriver[], 
  sortField: SortField = "lastName", 
  sortDirection: 'asc' | 'desc' = 'asc'
): MentorDriver[] {
  return [...drivers].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    // Expand sorting logic to cover special cases for timestamp in first name
    switch (sortField) {
      case 'firstName':
        // Special case for timestamps in first name field
        const isTimeA = typeof a.firstName === 'string' && /^\d+:\d+$/.test(a.firstName);
        const isTimeB = typeof b.firstName === 'string' && /^\d+:\d+$/.test(b.firstName);
        
        if (isTimeA && isTimeB) {
          // Both are timestamps, convert to minutes for sorting
          const [hoursA, minutesA] = a.firstName.split(':').map(Number);
          const [hoursB, minutesB] = b.firstName.split(':').map(Number);
          valueA = hoursA * 60 + minutesA;
          valueB = hoursB * 60 + minutesB;
        } else if (isTimeA) {
          // Only A is timestamp, place first or last depending on sort direction
          return sortDirection === 'asc' ? -1 : 1;
        } else if (isTimeB) {
          // Only B is timestamp, place first or last depending on sort direction
          return sortDirection === 'asc' ? 1 : -1;
        } else {
          // Neither are timestamps, sort alphabetically
          valueA = String(a.firstName || '').toLowerCase();
          valueB = String(b.firstName || '').toLowerCase();
        }
        break;
      case 'lastName':
      case 'station':
        valueA = String(a[sortField] || '').toLowerCase();
        valueB = String(b[sortField] || '').toLowerCase();
        break;
      case 'totalTrips':
        valueA = typeof a.totalTrips === 'number' ? a.totalTrips : 0;
        valueB = typeof b.totalTrips === 'number' ? b.totalTrips : 0;
        break;
      case 'totalKm':
        valueA = typeof a.totalKm === 'number' ? a.totalKm : 0;
        valueB = typeof b.totalKm === 'number' ? b.totalKm : 0;
        break;
      case 'totalHours':
        // Handle different hour formats
        if (typeof a.totalHours === 'string' && a.totalHours.includes(':') &&
            typeof b.totalHours === 'string' && b.totalHours.includes(':')) {
          // Both are in HH:MM format
          const [hoursA, minutesA] = a.totalHours.split(':').map(Number);
          const [hoursB, minutesB] = b.totalHours.split(':').map(Number);
          valueA = hoursA * 60 + minutesA;
          valueB = hoursB * 60 + minutesB;
        } else {
          // Convert to numeric values for comparison
          valueA = typeof a.totalHours === 'number' ? a.totalHours : 
                   typeof a.totalHours === 'string' && a.totalHours.includes(':') ? 
                   parseTimeToMinutes(a.totalHours) :
                   parseFloat(String(a.totalHours)) || 0;
          
          valueB = typeof b.totalHours === 'number' ? b.totalHours : 
                   typeof b.totalHours === 'string' && b.totalHours.includes(':') ? 
                   parseTimeToMinutes(b.totalHours) :
                   parseFloat(String(b.totalHours)) || 0;
        }
        break;
      case 'acceleration':
      case 'braking':
      case 'cornering':
      case 'speeding':
      case 'seatbelt':
      case 'tempo':
        valueA = getRiskValue(a[sortField]);
        valueB = getRiskValue(b[sortField]);
        break;
      case 'overallRating':
        // Handle FICO Score with special parsing
        valueA = typeof a.overallRating === 'number' 
          ? a.overallRating 
          : parseFloat(String(a.overallRating)) || 0;
        valueB = typeof b.overallRating === 'number' 
          ? b.overallRating 
          : parseFloat(String(b.overallRating)) || 0;
        break;
      default:
        valueA = String(a[sortField] || '').toLowerCase();
        valueB = String(b[sortField] || '').toLowerCase();
    }

    // Apply sort direction
    if (sortDirection === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
}
