
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
    
    // Create maps for different matching strategies
    const employeesByMentorName = new Map();
    const employeesByNameParts = new Map();
    
    employees.forEach(employee => {
      // Strategy 1: Match by mentor names in employee profile
      if (employee.mentorFirstName || employee.mentorLastName) {
        // Keys based on mentor first and last name
        const mentorKey = `${(employee.mentorFirstName || '').toLowerCase()}_${(employee.mentorLastName || '').toLowerCase()}`;
        employeesByMentorName.set(mentorKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
      
      // Strategy 2: Parse employee.name field
      const nameParts = employee.name.split(' ');
      if (nameParts.length >= 2) {
        const lastName = nameParts[nameParts.length - 1].toLowerCase();
        // Try different combinations for first name
        const firstName = nameParts[0].toLowerCase();
        
        // Key for exact match
        const exactKey = `${firstName}_${lastName}`;
        employeesByNameParts.set(exactKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
        
        // Key for partial match (only first 3 chars of first name)
        if (firstName.length > 2) {
          const partialKey = `${firstName.substring(0, 3)}_${lastName}`;
          employeesByNameParts.set(partialKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
        }
      }
    });
    
    console.log('Available employees for matching:', employees.length);
    console.log('Employees with mentor data:', employeesByMentorName.size);
    console.log('Employees with name parsing:', employeesByNameParts.size);
    
    // Map drivers with employee data
    const mappedDrivers = data.drivers
      .map(driver => {
        // Create the same key structures for matching
        const mentorKey = `${(driver.firstName || '').toLowerCase()}_${(driver.lastName || '').toLowerCase()}`;
        const matchedEmployee = employeesByMentorName.get(mentorKey) || 
                              employeesByNameParts.get(mentorKey);
        
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

      // Expand sorting logic to cover more fields
      switch (sortField) {
        case 'firstName':
        case 'lastName':
        case 'station':
          valueA = String(a[sortField] || '').toLowerCase();
          valueB = String(b[sortField] || '').toLowerCase();
          break;
        case 'totalTrips':
        case 'totalKm':
        case 'totalHours':
          valueA = typeof a[sortField] === 'number' ? Number(a[sortField]) : 0;
          valueB = typeof b[sortField] === 'number' ? Number(b[sortField]) : 0;
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

  return {
    driversWithNames,
    hasData: !!(data && data.drivers && data.drivers.length > 0)
  };
};
