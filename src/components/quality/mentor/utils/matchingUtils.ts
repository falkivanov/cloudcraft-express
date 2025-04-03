
import { Employee } from "@/types/employee";

/**
 * Build mapping tables from employee data for different matching approaches
 */
export function buildEmployeeMappings(employees: Employee[]) {
  // Create maps for fast lookups
  const employeeByMentorId = new Map();
  
  // Build mapping tables from employee data
  employees.forEach(employee => {
    // Mentor ID matching - most important for encrypted IDs
    if (employee.mentorFirstName) {
      employeeByMentorId.set(employee.mentorFirstName, {
        name: employee.name,
        transporterId: employee.transporterId
      });
      
      // Also try with = signs removed (common in base64 encoding)
      if (employee.mentorFirstName.includes('=')) {
        const cleanKey = employee.mentorFirstName.replace(/=+$/, '');
        employeeByMentorId.set(cleanKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    }
    
    // Add by last name too if available
    if (employee.mentorLastName) {
      employeeByMentorId.set(employee.mentorLastName, {
        name: employee.name,
        transporterId: employee.transporterId
      });
    }
    
    // Try to match by transporterId if it exists
    if (employee.transporterId) {
      employeeByMentorId.set(employee.transporterId, {
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
    const matchedByFirstName = employeesByMentorId.get(driver.firstName);
    if (matchedByFirstName) {
      console.log(`Found match by first name: ${driver.firstName} -> ${matchedByFirstName.name}`);
      return matchedByFirstName;
    }
    
    // Try without trailing = signs (common in base64)
    if (driver.firstName.includes('=')) {
      const cleanKey = driver.firstName.replace(/=+$/, '');
      const matchedByCleanKey = employeesByMentorId.get(cleanKey);
      if (matchedByCleanKey) {
        console.log(`Found match by cleaned first name: ${cleanKey} -> ${matchedByCleanKey.name}`);
        return matchedByCleanKey;
      }
    }
  }
  
  // Try to match by last name if no match by first name
  if (driver.lastName) {
    const matchedByLastName = employeesByMentorId.get(driver.lastName);
    if (matchedByLastName) {
      console.log(`Found match by last name: ${driver.lastName} -> ${matchedByLastName.name}`);
      return matchedByLastName;
    }
  }
  
  // No match found
  console.log(`No match found for driver: ${driver.firstName} ${driver.lastName}`);
  return null;
}
