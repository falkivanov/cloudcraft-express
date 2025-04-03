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
    
    // Debug output for mentorFirstName/mentorLastName values
    if (loadedEmployees.length > 0) {
      console.log('Sample employee mentor IDs:', 
        loadedEmployees.slice(0, 5).map(e => ({
          name: e.name,
          mentorFirstName: e.mentorFirstName,
          mentorLastName: e.mentorLastName
        }))
      );
    }
  }, []);

  const driversWithNames = useMemo(() => {
    if (!data?.drivers || !data.drivers.length) return [];
    
    console.log(`Processing ${data.drivers.length} drivers for display`);
    
    // Enhanced matching strategy for anonymized names
    // Create maps for different matching approaches
    const employeesByMentorId = new Map();
    
    // Build mapping tables from employee data
    employees.forEach(employee => {
      // Only process employees with mentorFirstName or mentorLastName
      if (employee.mentorFirstName || employee.mentorLastName) {
        // Store by mentor ID - this is the primary matching strategy
        if (employee.mentorFirstName) {
          const mentorIdKey = employee.mentorFirstName.trim();
          if (mentorIdKey.length > 0) {
            employeesByMentorId.set(mentorIdKey, {
              name: employee.name,
              transporterId: employee.transporterId
            });
            
            // Also try with = signs removed (common in base64 encoding)
            const cleanKey = mentorIdKey.replace(/=+$/, '');
            if (cleanKey !== mentorIdKey) {
              employeesByMentorId.set(cleanKey, {
                name: employee.name,
                transporterId: employee.transporterId
              });
            }
          }
        }
        
        // Also try combination of first and last if both exist
        if (employee.mentorFirstName && employee.mentorLastName) {
          const combinedKey = `${employee.mentorFirstName.trim()}_${employee.mentorLastName.trim()}`;
          employeesByMentorId.set(combinedKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
        }
      }
    });
    
    console.log('Employees with mentor IDs for matching:', employeesByMentorId.size);
    
    // Map drivers with employee data using progressively fallback strategies
    const mappedDrivers = data.drivers.map(driver => {
      let matchedEmployee = null;
      
      // Debug what we're trying to match
      console.log('Trying to match driver:', {
        firstName: driver.firstName,
        lastName: driver.lastName
      });
      
      // Strategy 1: Exact match on mentor ID (firstName field in Mentor data)
      if (driver.firstName) {
        const mentorIdKey = driver.firstName.trim();
        matchedEmployee = employeesByMentorId.get(mentorIdKey);
        
        // Try with trailing equals signs removed (common in base64 encoded data)
        if (!matchedEmployee && mentorIdKey.includes('=')) {
          const cleanedKey = mentorIdKey.replace(/=+$/, '');
          matchedEmployee = employeesByMentorId.get(cleanedKey);
          
          // If still no match, try more aggressive truncation patterns
          if (!matchedEmployee) {
            // Try removing all special characters
            const veryCleanedKey = cleanedKey.replace(/[^a-zA-Z0-9]/g, '');
            matchedEmployee = employeesByMentorId.get(veryCleanedKey);
          }
        }
      }
      
      // Strategy 2: Combined first and last name match
      if (!matchedEmployee && driver.firstName && driver.lastName) {
        const combinedKey = `${driver.firstName.trim()}_${driver.lastName.trim()}`;
        matchedEmployee = employeesByMentorId.get(combinedKey);
        
        // If no match, try with equals signs removed
        if (!matchedEmployee && combinedKey.includes('=')) {
          const cleanedKey = combinedKey.replace(/=+$/, '');
          matchedEmployee = employeesByMentorId.get(cleanedKey);
        }
      }
      
      // Return driver with matched employee info (if found)
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
