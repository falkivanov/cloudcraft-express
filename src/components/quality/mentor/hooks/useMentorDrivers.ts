
import { useMemo, useState, useEffect } from "react";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";
import { MentorDriver, MentorTableData, SortField } from "./useMentorDriversTypes";
import { buildEmployeeMappings, matchDriverToEmployee } from "../utils/matchingUtils";
import { sortDrivers } from "../utils/sortDrivers";

export { MentorDriver, MentorTableData, SortField };

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
    const employeesByMentorId = buildEmployeeMappings(employees);
    
    console.log('Employees with mentor IDs for matching:', employeesByMentorId.size);
    
    // Map drivers with employee data using progressively fallback strategies
    const mappedDrivers = data.drivers.map(driver => {
      // Debug what we're trying to match
      console.log('Trying to match driver:', {
        firstName: driver.firstName,
        lastName: driver.lastName
      });
      
      const matchedEmployee = matchDriverToEmployee(driver, employeesByMentorId);
      
      // Return driver with matched employee info (if found)
      return {
        ...driver,
        employeeName: matchedEmployee?.name || '',
        transporterId: matchedEmployee?.transporterId || ''
      };
    });

    // Apply sorting based on the provided field and direction
    return sortDrivers(mappedDrivers, sortField, sortDirection);
  }, [data, employees, sortField, sortDirection]);

  return {
    driversWithNames,
    hasData: !!(data && data.drivers && data.drivers.length > 0)
  };
};
