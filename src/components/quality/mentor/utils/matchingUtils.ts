
import { Employee } from "@/types/employee";

/**
 * Build mapping tables from employee data for different matching approaches
 */
export function buildEmployeeMappings(employees: Employee[]) {
  // Create maps for fast lookups
  const employeeByMentorId = new Map();
  
  // Build mapping tables from employee data
  employees.forEach(employee => {
    // Skip employees without mentor information
    if (!employee.mentorFirstName && !employee.mentorLastName && !employee.transporterId) {
      return;
    }
    
    // Mentor ID matching - most important for encrypted IDs
    if (employee.mentorFirstName) {
      // Store with lower case key for case-insensitive lookup
      const lowerCaseKey = employee.mentorFirstName.toLowerCase();
      employeeByMentorId.set(lowerCaseKey, {
        name: employee.name,
        transporterId: employee.transporterId
      });
      
      // Also try with = signs removed (common in base64 encoding)
      if (employee.mentorFirstName.includes('=')) {
        const cleanKey = employee.mentorFirstName.replace(/=+$/, '').toLowerCase();
        employeeByMentorId.set(cleanKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    }
    
    // Add by last name too if available
    if (employee.mentorLastName) {
      // Store with lower case key for case-insensitive lookup
      const lowerCaseKey = employee.mentorLastName.toLowerCase();
      employeeByMentorId.set(lowerCaseKey, {
        name: employee.name,
        transporterId: employee.transporterId
      });
      
      // Also try with = signs removed
      if (employee.mentorLastName.includes('=')) {
        const cleanKey = employee.mentorLastName.replace(/=+$/, '').toLowerCase();
        employeeByMentorId.set(cleanKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    }
    
    // Try to match by transporterId if it exists
    if (employee.transporterId) {
      // Store with lower case key for case-insensitive lookup
      const lowerCaseKey = employee.transporterId.toLowerCase();
      employeeByMentorId.set(lowerCaseKey, {
        name: employee.name,
        transporterId: employee.transporterId
      });
    }
  });
  
  console.log(`Built employee mappings with ${employeeByMentorId.size} entries`);
  
  // For debugging, log a few sample mappings
  if (employeeByMentorId.size > 0) {
    console.log("Sample mentor ID mappings:");
    let count = 0;
    for (const [key, value] of employeeByMentorId.entries()) {
      console.log(`Mentor ID: "${key}" -> Employee: "${value.name}"`);
      count++;
      if (count >= 5) break;
    }
  }
  
  return employeeByMentorId;
}

/**
 * Match a driver to an employee using the mentor ID
 */
export function matchDriverToEmployee(
  driver: {firstName?: string, lastName?: string, station?: string}, 
  employeesByMentorId: Map<string, {name: string, transporterId: string}>
) {
  // Log for debugging
  console.log(`Matching driver: ${driver.firstName} ${driver.lastName}`);
  
  // Try to match by first name which contains the mentor ID
  if (driver.firstName) {
    // Convert to lowercase for case-insensitive matching
    const lowerCaseFirstName = driver.firstName.toLowerCase();
    const matchedByFirstName = employeesByMentorId.get(lowerCaseFirstName);
    if (matchedByFirstName) {
      console.log(`Found match by first name: ${driver.firstName} -> ${matchedByFirstName.name}`);
      return matchedByFirstName;
    }
    
    // Try without trailing = signs (common in base64)
    if (driver.firstName.includes('=')) {
      const cleanKey = driver.firstName.replace(/=+$/, '').toLowerCase();
      const matchedByCleanKey = employeesByMentorId.get(cleanKey);
      if (matchedByCleanKey) {
        console.log(`Found match by cleaned first name: ${cleanKey} -> ${matchedByCleanKey.name}`);
        return matchedByCleanKey;
      }
    }
  }
  
  // Try to match by last name if no match by first name
  if (driver.lastName) {
    // Convert to lowercase for case-insensitive matching
    const lowerCaseLastName = driver.lastName.toLowerCase();
    const matchedByLastName = employeesByMentorId.get(lowerCaseLastName);
    if (matchedByLastName) {
      console.log(`Found match by last name: ${driver.lastName} -> ${matchedByLastName.name}`);
      return matchedByLastName;
    }
    
    // Try without trailing = signs
    if (driver.lastName.includes('=')) {
      const cleanKey = driver.lastName.replace(/=+$/, '').toLowerCase();
      const matchedByCleanKey = employeesByMentorId.get(cleanKey);
      if (matchedByCleanKey) {
        console.log(`Found match by cleaned last name: ${cleanKey} -> ${matchedByCleanKey.name}`);
        return matchedByCleanKey;
      }
    }
  }
  
  // No match found
  console.log(`No match found for driver: ${driver.firstName} ${driver.lastName}`);
  return null;
}
