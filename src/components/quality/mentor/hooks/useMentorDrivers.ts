import { useMemo, useState, useEffect } from "react";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";
import { Employee } from "@/types/employee";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";

interface MentorDriver extends MentorDriverData {
  employeeName?: string;
  transporterId?: string;
}

export interface MentorTableData {
  weekNumber: number;
  year: number;
  drivers: MentorDriverData[];
}

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
  | "seatbelt";

export const useMentorDrivers = (
  data: MentorTableData | null, 
  sortField: SortField = "lastName", 
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employee data from localStorage
  useEffect(() => {
    const loadedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    setEmployees(loadedEmployees);
    console.log('Loaded employee data for Mentor matching:', loadedEmployees.length);
  }, []);

  const driversWithNames = useMemo(() => {
    if (!data?.drivers || !data.drivers.length) return [];
    
    console.log(`Processing ${data.drivers.length} drivers for display`);
    
    // Enhanced matching strategy for anonymized names
    // Create maps for different matching approaches
    const employeesByMentorId = new Map();
    const employeesByNameParts = new Map();
    
    // Build mapping tables from employee data
    employees.forEach(employee => {
      // Only process employees with mentorFirstName or mentorLastName
      if (employee.mentorFirstName || employee.mentorLastName) {
        // Store by mentor ID - this is the primary matching strategy
        const mentorIdKey = `${(employee.mentorFirstName || '').toLowerCase()}`;
        if (mentorIdKey.length > 5) { // Only consider IDs of reasonable length
          employeesByMentorId.set(mentorIdKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
        }
        
        // Alternative: store by both first and last name combined
        if (employee.mentorFirstName && employee.mentorLastName) {
          const combinedKey = `${employee.mentorFirstName.toLowerCase()}_${employee.mentorLastName.toLowerCase()}`;
          employeesByMentorId.set(combinedKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
        }
      }
      
      // Fallback: Parse employee name for potential matching
      const nameParts = employee.name.split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts[nameParts.length - 1].toLowerCase();
        
        // Store by full name parts
        const nameKey = `${firstName}_${lastName}`;
        employeesByNameParts.set(nameKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    });
    
    console.log('Available employees for matching:', employees.length);
    console.log('Employees with mentor IDs:', employeesByMentorId.size);
    console.log('Employees with parsed names:', employeesByNameParts.size);
    
    // Map drivers with employee data using progressively fallback strategies
    const mappedDrivers = data.drivers.map(driver => {
      let matchedEmployee = null;
      
      // Strategy 1: Exact match on mentor ID (firstName field in Mentor data)
      if (driver.firstName) {
        const mentorIdKey = driver.firstName.toLowerCase();
        matchedEmployee = employeesByMentorId.get(mentorIdKey);
        
        // Try alternate formats of the ID
        if (!matchedEmployee && mentorIdKey.includes('=')) {
          // Try without trailing equals signs (common in anonymized data)
          const cleanedKey = mentorIdKey.replace(/=+$/, '');
          matchedEmployee = employeesByMentorId.get(cleanedKey);
        }
      }
      
      // Strategy 2: Combined first and last name match
      if (!matchedEmployee && driver.firstName && driver.lastName) {
        const combinedKey = `${driver.firstName.toLowerCase()}_${driver.lastName.toLowerCase()}`;
        matchedEmployee = employeesByMentorId.get(combinedKey);
      }
      
      // Strategy 3: Fallback to name parts matching
      if (!matchedEmployee && driver.firstName && driver.lastName) {
        const nameKey = `${driver.firstName.toLowerCase()}_${driver.lastName.toLowerCase()}`;
        matchedEmployee = employeesByNameParts.get(nameKey);
      }
      
      return {
        ...driver,
        employeeName: matchedEmployee?.name || '',
        transporterId: matchedEmployee?.transporterId || ''
      };
    });

    // Apply sorting based on the provided field and direction
    const sortedDrivers = [...mappedDrivers].sort((a, b) => {
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
          const getRiskValue = (risk: string | undefined) => {
            if (!risk || risk === '-') return 0;
            if (risk.includes('Low')) return 1;
            if (risk.includes('Medium')) return 2;
            if (risk.includes('High')) return 3;
            return 0;
          };
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

    return sortedDrivers;
  }, [data, employees, sortField, sortDirection]);

  // Helper function to parse time string to minutes for sorting
  function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr.includes(':')) return parseFloat(timeStr) || 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + (minutes || 0);
  }

  return {
    driversWithNames,
    hasData: !!(data && data.drivers && data.drivers.length > 0)
  };
};
