
import { useMemo, useState, useEffect } from "react";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";
import { 
  MentorDriver, 
  MentorTableData, 
  SortField 
} from "./useMentorDriversTypes";
import { buildEmployeeMappings, matchDriverToEmployee } from "../utils/matchingUtils";
import { sortDrivers } from "../utils/sortDrivers";

const useMentorDrivers = (
  data: MentorTableData | null, 
  sortField: SortField = "lastName", 
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const loadedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    setEmployees(loadedEmployees);
    console.log('Loaded employee data for Mentor matching:', loadedEmployees.length);
    
    if (loadedEmployees.length > 0) {
      console.log('Sample employee mentor IDs:', 
        loadedEmployees.slice(0, 5).map(e => ({
          name: e.name,
          mentorFirstName: e.mentorFirstName,
          mentorLastName: e.mentorLastName,
          transporterId: e.transporterId
        }))
      );
    }
  }, []);

  const driversWithNames = useMemo(() => {
    if (!data?.drivers || !data.drivers.length) return [];
    
    console.log(`Processing ${data.drivers.length} drivers for display`);
    
    const employeeMappings = buildEmployeeMappings(employees);
    
    console.log('Built employee mappings for matching');
    
    const mappedDrivers = data.drivers.map(driver => {
      console.log('Matching driver:', {
        firstName: driver.firstName,
        lastName: driver.lastName,
        station: driver.station
      });
      
      const matchedEmployee = matchDriverToEmployee(driver, employeeMappings);
      
      return {
        ...driver,
        employeeName: matchedEmployee?.name || '',
        transporterId: matchedEmployee?.transporterId || ''
      };
    });

    return sortDrivers(mappedDrivers, sortField, sortDirection);
  }, [data, employees, sortField, sortDirection]);

  return {
    driversWithNames,
    hasData: !!(data && data.drivers && data.drivers.length > 0)
  };
};

export { useMentorDrivers };
export type { MentorDriver, MentorTableData, SortField };
